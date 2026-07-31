const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read } = require('./helpers');

const html = read('index.html');

test('no faked buttons — interactive controls are real <button> elements', () => {
    assert.doesNotMatch(html, /role="button"/);
    assert.doesNotMatch(html, /tabindex="0"/);
    assert.match(html, /<button type="button" class="press-start">/);
});

test('every project card has a real toggle button', () => {
    const items = html.match(/class="project-item"/g) || [];
    const toggles = html.match(/<button type="button" class="project-toggle"/g) || [];
    assert.ok(items.length > 0, 'expected project cards');
    assert.equal(toggles.length, items.length);
});

test('project toggles start collapsed and point at their panel', () => {
    const toggles = [...html.matchAll(
        /<button type="button" class="project-toggle" aria-expanded="([^"]*)" aria-controls="([^"]*)"/g
    )];
    const items = html.match(/class="project-item"/g) || [];
    assert.equal(toggles.length, items.length, 'every toggle needs both ARIA attributes');

    const panelIds = [...html.matchAll(/class="project-body" id="([^"]*)"/g)].map(m => m[1]);
    assert.equal(new Set(panelIds).size, panelIds.length, 'panel ids must be unique');

    for (const [, expanded, controls] of toggles) {
        assert.equal(expanded, 'false', 'cards render collapsed');
        assert.ok(panelIds.includes(controls), 'aria-controls must target a panel: ' + controls);
    }
});
