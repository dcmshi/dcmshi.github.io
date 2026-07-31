const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, declaration, functionBody } = require('./helpers');

const css = read('styles.css');
const js = read('script.js');

test('the sleeping dog stays near the viewport edge and does not linger', () => {
    const sleep = functionBody(js, 'spawnWalkAndSleep');

    const band = Number(sleep.match(/randomBand\(([\d.]+)\)/)[1]);
    const defaultBand = Number(
        functionBody(js, 'randomBand').match(/maxFrac \|\| ([\d.]+)/)[1]
    );
    assert.ok(band < defaultBand,
        `sleep band ${band} should be tighter than the default ${defaultBand}`);

    // Content is vertically centred, so a dog parked mid-screen covers text.
    const [, base, spread] = sleep.match(/\}, (\d+) \+ Math\.random\(\) \* (\d+)\)/);
    assert.ok(Number(base) + Number(spread) <= 3500,
        'a sleeping dog should not sit still for more than 3.5s');
});
