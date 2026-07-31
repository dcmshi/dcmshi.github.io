const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, declaration, mediaBlock, functionBody } = require('./helpers');

const css = read('styles.css');
const js = read('script.js');

test('collapsed project bodies are hidden from the tab order', () => {
    assert.equal(declaration(css, '.project-body', 'visibility'), 'hidden');
    assert.equal(
        declaration(css, '.project-item.expanded .project-body', 'visibility'),
        'visible'
    );
});

test('collapsed project bodies stay visible for the whole collapse transition', () => {
    // A discrete property like visibility flips at 50% progress by default,
    // which would blank the card mid-animation. Both rules must pin the timing.
    const collapsed = declaration(css, '.project-body', 'transition');
    const expanded = declaration(css, '.project-item.expanded .project-body', 'transition');
    assert.match(collapsed, /visibility 0s linear 0\.35s/);
    assert.match(expanded, /visibility 0s linear 0s/);
    assert.match(collapsed, /max-height 0\.35s/);
});

test('reduced motion disables the accordion transition', () => {
    const reduced = mediaBlock(css, 'prefers-reduced-motion');
    assert.equal(declaration(reduced, '.project-body', 'transition'), 'none');
    assert.equal(
        declaration(reduced, '.project-item.expanded .project-body', 'transition'),
        'none'
    );
});

test('reduced motion skips the max-height pin that a transitionend would release', () => {
    const toggle = functionBody(js, 'toggle');
    assert.match(toggle, /reducedMotion\(\) \? 'none' : body\.scrollHeight/);
    assert.match(toggle, /if \(!reducedMotion\(\)\)/);
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
