const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, functionBody } = require('./helpers');

const js = read('script.js');

test('the per-frame draw does no per-frame work it can precompute', () => {
    const draw = functionBody(js, 'Dog.prototype.draw');
    assert.doesNotMatch(draw, /Math\.max/, 'widest frame is precomputed in prerender()');
    assert.match(draw, /MAX_FRAME_W\[animName\]/);

    // Assigning canvas.width resets the 2D context, so it must be conditional.
    assert.match(draw, /if \(this\.canvas\.width !== w \|\| this\.canvas\.height !== h\)/);
});

test('every animation gets a precomputed width', () => {
    const prerender = functionBody(js, 'prerender');
    assert.match(prerender, /MAX_FRAME_W\[name\] = Math\.max\(\.\.\.anim\.frames\.map/);

    // Anything reading MAX_FRAME_W by literal key needs an entry in ANIMS.
    const animNames = [...js.matchAll(/^\s{8}(\w+):\s*\{ y:/gm)].map(m => m[1]);
    assert.ok(animNames.length > 0, 'expected animation definitions');
    for (const [, key] of js.matchAll(/MAX_FRAME_W\.(\w+)/g)) {
        assert.ok(animNames.includes(key), 'MAX_FRAME_W.' + key + ' has no ANIMS entry');
    }
});
