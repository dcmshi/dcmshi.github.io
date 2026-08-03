const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, rules, declaration, mediaBlock, functionBody } = require('./helpers');

const css = read('styles.css');
const js = read('script.js');

const EXPANDED_CARD = '.project-group.expanded .project-item.expanded .project-body';

test('collapsed project bodies are hidden from the tab order', () => {
    assert.equal(declaration(css, '.project-body', 'visibility'), 'hidden');
    assert.equal(declaration(css, EXPANDED_CARD, 'visibility'), 'visible');
});

test('a card left open inside a collapsed group stays out of the tab order', () => {
    // The group clips its panel to nothing, but visibility inherits — so an
    // unscoped `.project-item.expanded .project-body { visibility: visible }`
    // would hand the card's links back to the tab order inside a closed group.
    assert.deepEqual(rules(css, '.project-item.expanded .project-body'), [],
        'the expanded-card rule must require an expanded group too');
    assert.equal(declaration(css, '.project-group-body', 'visibility'), 'hidden');
    assert.equal(
        declaration(css, '.project-group.expanded .project-group-body', 'visibility'),
        'visible'
    );
});

test('collapsed project bodies stay visible for the whole collapse transition', () => {
    // A discrete property like visibility flips at 50% progress by default,
    // which would blank the card mid-animation. Both rules must pin the timing.
    for (const [collapsedSel, expandedSel] of [
        ['.project-body', EXPANDED_CARD],
        ['.project-group-body', '.project-group.expanded .project-group-body'],
    ]) {
        const collapsed = declaration(css, collapsedSel, 'transition');
        const expanded = declaration(css, expandedSel, 'transition');
        assert.match(collapsed, /visibility 0s linear 0\.35s/);
        assert.match(expanded, /visibility 0s linear 0s/);
        assert.match(collapsed, /max-height 0\.35s/);
    }
});

test('reduced motion disables the accordion transition', () => {
    const reduced = mediaBlock(css, 'prefers-reduced-motion');
    for (const selector of [
        '.project-body',
        EXPANDED_CARD,
        '.project-group-body',
        '.project-group.expanded .project-group-body',
    ]) {
        assert.equal(declaration(reduced, selector, 'transition'), 'none', selector);
    }
});

test('reduced motion skips the max-height pin that a transitionend would release', () => {
    const toggle = functionBody(js, 'toggle');
    assert.match(toggle, /reducedMotion\(\) \? 'none' : contentHeight/);
    assert.match(toggle, /if \(!reducedMotion\(\)\)/);
});

test('the global shortcut does not hijack Enter', () => {
    const shortcut = js.match(/if \(\(e\.key === 's'[^)]*\) && window\.scrollY < 100\)/)[0];
    assert.doesNotMatch(shortcut, /Enter/);
});

test('decorative sprite canvases are hidden from assistive tech', () => {
    assert.match(
        functionBody(js, 'Dog'),
        /this\.el\.setAttribute\('aria-hidden', 'true'\)/
    );
    const gauntlet = functionBody(js, 'spawnGauntlet');
    for (const el of ['ropeEl', 'dogCanvas', 'c']) {
        assert.match(
            gauntlet,
            new RegExp(el + "\\.setAttribute\\('aria-hidden', 'true'\\)"),
            el + ' is decorative and must be aria-hidden'
        );
    }
});

test('gauntlet overlay traps and restores focus', () => {
    const body = functionBody(js, 'spawnGauntlet');
    assert.match(body, /previouslyFocused = document\.activeElement/);
    assert.match(body, /node\.inert = true/);
    assert.match(body, /node\.inert = false/);
    assert.match(body, /overlay\.focus\(\)/);
    // Focus must be handed back, and Tab must not escape the modal.
    assert.match(body, /releaseFocus\(\)/);
    assert.match(body, /e\.key === 'Tab'/);
});

test('the gauntlet can always be dismissed, even if no frame ever renders', () => {
    const body = functionBody(js, 'spawnGauntlet');
    // The page is made inert synchronously. If the dismiss handlers were
    // registered inside the requestAnimationFrame chain and those frames never
    // arrived, the whole page would stay inert with no way out.
    const inertAt = body.indexOf('node.inert = true');
    const keyListenerAt = body.indexOf("document.addEventListener('keydown', onKey)");
    const clickListenerAt = body.indexOf("overlay.addEventListener('click', dismiss)");
    const firstFrameAt = body.indexOf('requestAnimationFrame(');

    assert.ok(inertAt !== -1 && firstFrameAt !== -1);
    assert.ok(keyListenerAt !== -1 && keyListenerAt < firstFrameAt,
        'Escape must be wired up before the animation frames');
    assert.ok(clickListenerAt !== -1 && clickListenerAt < firstFrameAt,
        'click-to-dismiss must be wired up before the animation frames');

    // And a late frame must not restart an already-dismissed overlay.
    assert.match(body, /if \(dismissed\) return;/);
});
