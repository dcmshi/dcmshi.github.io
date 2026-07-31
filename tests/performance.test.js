const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, read, atRuleBlock, functionBody } = require('./helpers');

const html = read('index.html');
const notFound = read('404.html');
const css = read('styles.css');
const js = read('script.js');

const size = rel => fs.statSync(path.join(ROOT, rel)).size;

test('sprites are cached, not cache-busted', () => {
    // The sprite sheets are static and GitHub Pages sets cache headers; a
    // Date.now() query string forces a re-download on every page load.
    assert.doesNotMatch(js, /\.src = [^;]*Date\.now\(\)/);
    assert.doesNotMatch(js, /\?v=/);
});

test('dog cameos do not spawn in a hidden tab', () => {
    assert.match(functionBody(js, 'pick'), /document\.hidden/);
});

test('no font is downloaded that the site never renders', () => {
    for (const [name, page] of [['index.html', html], ['404.html', notFound]]) {
        const request = page.match(/fonts\.googleapis\.com\/css2\?([^"]+)/)[1];
        const families = [...request.matchAll(/family=([^&]+)/g)].map(m => m[1]);
        for (const family of families) {
            const cssName = decodeURIComponent(family).replace(/\+/g, ' ');
            assert.ok(css.includes("'" + cssName + "'"),
                `${name} requests ${cssName} but styles.css never uses it`);
        }
    }
});

test('the body font ships as WOFF2 with a TTF fallback', () => {
    assert.ok(size('fonts/DTM-Mono.woff2') < size('fonts/DTM-Mono.ttf') / 2,
        'the WOFF2 should be well under half the TTF');

    const src = atRuleBlock(css, 'font-face');
    const woff2At = src.indexOf("format('woff2')");
    const ttfAt = src.indexOf("format('truetype')");
    assert.ok(woff2At !== -1 && ttfAt !== -1, 'both formats must be declared');
    assert.ok(woff2At < ttfAt, 'WOFF2 must come first so browsers prefer it');
});

test('both pages preload the body font', () => {
    // Fonts are always fetched in CORS mode, so the preload needs crossorigin
    // or the browser downloads the file twice.
    assert.match(html,
        /<link rel="preload" href="fonts\/DTM-Mono\.woff2" as="font" type="font\/woff2" crossorigin>/);
    assert.match(notFound,
        /<link rel="preload" href="\/fonts\/DTM-Mono\.woff2" as="font" type="font\/woff2" crossorigin>/);
});
