const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read } = require('./helpers');

const html = read('index.html');
const js = read('script.js');

test('sprites are cached, not cache-busted', () => {
    // The sprite sheets are static and GitHub Pages sets cache headers; a
    // Date.now() query string forces a re-download on every page load.
    assert.doesNotMatch(js, /\.src = [^;]*Date\.now\(\)/);
    assert.doesNotMatch(js, /\?v=/);
});
