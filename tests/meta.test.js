const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, read, declaration } = require('./helpers');

const html = read('index.html');
const notFound = read('404.html');
const css = read('styles.css');

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
