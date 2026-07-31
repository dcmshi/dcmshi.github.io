const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, declaration, contrastRatio } = require('./helpers');

const css = read('styles.css');
const js = read('script.js');

const BLACK = '#000000';
const BOX = '#0a0a0a'; // .section-box
const RED = '#ff0000'; // .skip-link

// Selector → the background it actually renders against. Backgrounds can't be
// resolved from the stylesheet alone, so they're pinned here deliberately.
const ON_BACKGROUND = [
    ['.expand-indicator', BLACK],
    ['.project-item.expanded .expand-indicator', BLACK],
    ['.project-tech', BLACK],
    ['.project-desc', BLACK],
    ['.project-link', BLACK],
    ['.press-start', BLACK],
    ['.back-link', BLACK],
    ['.footer p', BLACK],
    ['.footer-credit', BLACK],
    ['.skills-label', BLACK],
    ['.contact-link', BOX],
    ['.section-intro', BOX],
    ['.section-title', BOX],
    ['.skip-link', RED],
];

test('all body text meets WCAG AA (4.5:1)', () => {
    for (const [selector, background] of ON_BACKGROUND) {
        const color = declaration(css, selector, 'color');
        assert.ok(color, 'no color declared for ' + selector);
        const ratio = contrastRatio(color, background);
        assert.ok(
            ratio >= 4.5,
            `${selector} (${color} on ${background}) is ${ratio.toFixed(2)}:1, needs 4.5:1`
        );
    }
});

test('the gauntlet dismiss hint is legible', () => {
    // The overlay is rgba(0,0,0,0.88) over the page, so effectively near-black.
    const color = js.match(/hintEl[\s\S]{0,400}?color: '(#[0-9a-f]{6})'/i)[1];
    assert.ok(contrastRatio(color, BLACK) >= 4.5, `hint colour ${color} is too dim`);
});
