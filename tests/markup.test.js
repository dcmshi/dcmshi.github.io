const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read } = require('./helpers');

const html = read('index.html');

test('no faked buttons — interactive controls are real <button> elements', () => {
    assert.doesNotMatch(html, /role="button"/);
    assert.doesNotMatch(html, /tabindex="0"/);
    assert.match(html, /<button type="button" class="press-start">/);
});

test('the skip link lands focus on a named main region', () => {
    const target = html.match(/href="#([^"]+)" class="skip-link"/)[1];
    // Without tabindex, focus stays put and the skip link only moves the scroll.
    assert.match(html, new RegExp('<main id="' + target + '" tabindex="-1">'));
});

test('the primary nav is a labelled landmark', () => {
    // The skip link deliberately bypasses the menu, so the menu has to stay
    // findable through landmark navigation instead.
    assert.match(html, /<nav class="main-menu" aria-label="Main">/);
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

// Category groups are a second accordion wrapped around the cards. They must
// not reuse .project-item / .project-toggle — the assertions above count those,
// and the script's closest('.project-item') lookup would find the wrong element.
const groups = [...html.matchAll(
    /<div class="project-group( expanded)?">([\s\S]*?)<div class="project-group-body"/g
)];

test('every project group has a real toggle button pointing at its panel', () => {
    assert.ok(groups.length > 0, 'expected project groups');
    const toggles = html.match(/<button type="button" class="group-toggle"/g) || [];
    assert.equal(toggles.length, groups.length);

    const panelIds = [...html.matchAll(/class="project-group-body" id="([^"]*)"/g)].map(m => m[1]);
    assert.equal(new Set(panelIds).size, panelIds.length, 'panel ids must be unique');
    assert.equal(panelIds.length, groups.length);

    const controls = [...html.matchAll(
        /class="group-toggle" aria-expanded="[^"]*" aria-controls="([^"]*)"/g
    )];
    assert.equal(controls.length, groups.length, 'every group toggle needs both ARIA attributes');
    for (const [, target] of controls) {
        assert.ok(panelIds.includes(target), 'aria-controls must target a group panel: ' + target);
    }
});

test('each group agrees with itself about whether it is open', () => {
    for (const [, expandedClass, header] of groups) {
        const open = expandedClass === ' expanded';
        assert.equal(header.match(/class="group-toggle" aria-expanded="([^"]*)"/)[1], String(open));
        assert.equal(
            header.match(/<span class="expand-indicator" aria-hidden="true">(\[.\])/)[1],
            open ? '[-]' : '[+]'
        );
    }
});

test('project cards sit a heading level below their category', () => {
    const items = html.match(/class="project-item"/g) || [];
    assert.equal((html.match(/<h3 class="project-group-name"/g) || []).length, groups.length);
    assert.equal((html.match(/<h4 class="project-name"/g) || []).length, items.length);
    assert.doesNotMatch(html, /<h3 class="project-name"/, 'cards now nest under an h3 category');
});
