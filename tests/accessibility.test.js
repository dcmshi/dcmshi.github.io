const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, declaration } = require('./helpers');

const css = read('styles.css');

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
