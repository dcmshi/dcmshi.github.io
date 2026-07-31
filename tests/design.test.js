const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, rules, declaration, parentTagsOf, functionBody } = require('./helpers');

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

// Resolves the horizontal margins of a selector, longhand winning over the
// shorthand, as ['<left>', '<right>'].
function sideMargins(selector) {
    const parts = (declaration(css, selector, 'margin') || '').trim().split(/\s+/);
    const [, right = '', , left = ''] =
        parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]]
        : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]]
        : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]]
        : parts;
    return [
        declaration(css, selector, 'margin-left') || left,
        declaration(css, selector, 'margin-right') || right,
    ];
}

test('.container centres itself, because not every parent is a centring flex row', () => {
    // Past max-width the container is narrower than its parent, and the leftover
    // space has to be split evenly by something. The sections do it with
    // justify-content, but the footer is a plain block — with no auto margins its
    // container hugs the left edge and the centred text inside it drifts left of
    // the viewport centre, which only shows once the viewport clears max-width.
    assert.ok(declaration(css, '.container', 'max-width'),
        '.container caps its width, so it needs a centring rule');

    const flexCentres = (tag) => {
        const classList = tag.match(/class="([^"]*)"/);
        if (!classList) return false;
        return classList[1].split(/\s+/).filter(Boolean).some(cls =>
            declaration(css, '.' + cls, 'display') === 'flex' &&
            declaration(css, '.' + cls, 'justify-content') === 'center');
    };

    // Prove the premise rather than assuming it: find the parents that do not.
    const parents = ['index.html', '404.html']
        .flatMap(file => parentTagsOf(read(file), 'container'));
    assert.ok(parents.length > 0, 'expected .container elements');

    const uncentred = parents.filter(tag => tag && !flexCentres(tag));
    assert.ok(uncentred.length > 0,
        'premise changed: every .container parent now flex-centres, so this test is moot');

    const [left, right] = sideMargins('.container');
    assert.equal(left, 'auto',
        `.container sits in ${uncentred[0]}, which does not centre it`);
    assert.equal(right, 'auto',
        `.container sits in ${uncentred[0]}, which does not centre it`);
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
