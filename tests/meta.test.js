const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, read, declaration } = require('./helpers');

const html = read('index.html');
const notFound = read('404.html');
const css = read('styles.css');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

const SITE_ORIGIN = 'https://dcmshi.github.io';

function meta(attr, name) {
    const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`));
    return m && m[1];
}

// Width and height live in the PNG's IHDR chunk, at a fixed offset.
function pngSize(relPath) {
    const buf = fs.readFileSync(path.join(ROOT, relPath));
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// Maps an absolute site URL back to the file that serves it.
function localFileFor(url) {
    assert.ok(url.startsWith(SITE_ORIGIN + '/'), 'expected an absolute site URL: ' + url);
    return url.slice(SITE_ORIGIN.length + 1);
}

test('the canonical URL agrees with og:url', () => {
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)[1];
    assert.equal(canonical, meta('property', 'og:url'));
    // 404.html is noindex, so a canonical there would only confuse crawlers.
    assert.doesNotMatch(notFound, /rel="canonical"/);
});

test('both pages ship a full-size apple-touch-icon', () => {
    for (const [name, page, prefix] of [['index.html', html, ''], ['404.html', notFound, '/']]) {
        const m = page.match(/<link rel="apple-touch-icon" href="([^"]*)"/);
        assert.ok(m, name + ' is missing apple-touch-icon');
        assert.equal(m[1], prefix + 'images/apple-touch-icon.png');
    }
    // iOS renders the home screen icon at 180x180; the 66x66 favicon is too
    // small and gets upscaled into mush.
    assert.deepEqual(pngSize('images/apple-touch-icon.png'), { width: 180, height: 180 });
});

test('theme-color matches the page background on every page', () => {
    const background = declaration(css, 'body', 'background-color');
    for (const [name, page] of [['index.html', html], ['404.html', notFound]]) {
        const m = page.match(/<meta name="theme-color" content="([^"]*)"/);
        assert.ok(m, name + ' is missing theme-color');
        assert.equal(m[1], background, name + ' theme-color should match body');
    }
});

test('og:image declares the real dimensions of the banner', () => {
    const actual = pngSize(localFileFor(meta('property', 'og:image')));
    assert.equal(meta('property', 'og:image:width'), String(actual.width));
    assert.equal(meta('property', 'og:image:height'), String(actual.height));
});

test('og:image has alt text', () => {
    const alt = meta('property', 'og:image:alt');
    assert.ok(alt && alt.length > 10, 'og:image:alt should describe the banner');
});

test('the Search Console verification file matches its own filename', () => {
    // Google fetches /<token>.html and expects the body to name that same file.
    // It re-checks periodically, so deleting or editing this silently
    // un-verifies the property — hence the guard. It is deliberately not valid
    // HTML despite the extension; Google only looks for the token line.
    const found = fs.readdirSync(ROOT).filter(n => /^google[0-9a-f]+\.html$/.test(n));
    assert.equal(found.length, 1, 'expected one verification file, found: ' + found.join(', '));
    assert.equal(read(found[0]).trim(), 'google-site-verification: ' + found[0]);
});

test('robots.txt keeps the site crawlable', () => {
    // Directives, minus comments and blank lines, as [field, value] pairs.
    const directives = robots
        .split('\n')
        .map(line => line.replace(/#.*/, '').trim())
        .filter(Boolean)
        .map(line => {
            const idx = line.indexOf(':');
            return [line.slice(0, idx).trim().toLowerCase(), line.slice(idx + 1).trim()];
        });

    const groups = directives.filter(([field]) => field === 'user-agent');
    assert.deepEqual(groups.map(([, value]) => value), ['*'], 'expected one wildcard group');

    // A stray `Disallow: /` is the single easiest way to delist the whole site.
    for (const [field, value] of directives) {
        if (field === 'disallow') {
            assert.notEqual(value, '/', 'Disallow: / would hide the entire site');
        }
    }
});

test('the sitemap robots.txt advertises is the one that exists', () => {
    const advertised = robots.match(/^Sitemap:\s*(\S+)$/m);
    assert.ok(advertised, 'robots.txt should advertise a sitemap');
    // Per the sitemaps spec this must be a full URL, not a site-relative path.
    const local = localFileFor(advertised[1]);
    assert.equal(local, 'sitemap.xml');
    assert.ok(fs.existsSync(path.join(ROOT, local)), local + ' does not exist');
});

test('the sitemap lists the canonical URL and nothing else', () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)[1];
    // Disagreeing with the canonical tag sends crawlers two different answers
    // about which URL is the real one. Exact equality also keeps noindex pages
    // like 404.html out, since any extra <loc> fails here.
    assert.deepEqual(locs, [canonical]);
});
