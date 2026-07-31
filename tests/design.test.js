const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, rules, declaration, functionBody } = require('./helpers');

const css = read('styles.css');
const js = read('script.js');

test('inline links are big enough to tap', () => {
    // Both links inherit line-height from body; assert that before relying on it.
    const lineHeight = Number(declaration(css, 'body', 'line-height'));
    assert.equal(lineHeight, 1.6);

    for (const selector of ['.project-link', '.contact-link']) {
        assert.equal(declaration(css, selector, 'display'), 'inline-block',
            selector + ' must be inline-block for padding to apply');

        const fontSize = parseFloat(declaration(css, selector, 'font-size'));
        const padding = parseFloat(declaration(css, selector, 'padding'));
        const height = fontSize * lineHeight + padding * 2;
        assert.ok(height >= 40,
            `${selector} is only ${height.toFixed(1)}px tall; thumbs want ~44px`);
    }
});

test('the skip link stacks above every sprite layer', () => {
    const skipLink = Number(declaration(css, '.skip-link', 'z-index'));
    const jsLayers = [...js.matchAll(/zIndex: '(\d+)'/g)].map(m => Number(m[1]));
    assert.ok(jsLayers.length > 0, 'expected script-managed layers');
    assert.ok(skipLink > Math.max(...jsLayers),
        `skip link z-index ${skipLink} must beat ${Math.max(...jsLayers)}`);
});

test('full-height sections use svh with a vh fallback', () => {
    const block = rules(css, '.section')[0];
    const vhAt = block.indexOf('min-height: 100vh');
    const svhAt = block.indexOf('min-height: 100svh');
    assert.ok(vhAt !== -1, 'vh fallback is needed for browsers without svh');
    assert.ok(svhAt !== -1, '100vh alone overshoots on mobile');
    assert.ok(vhAt < svhAt, 'the fallback must come first or it always wins');
});

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
