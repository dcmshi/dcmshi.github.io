const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, allRules } = require('./helpers');

const css = read('styles.css');

test('no rule restates a declaration it already inherits', () => {
    // A rule like `.about-section .content p { margin-bottom: 20px }` is dead
    // weight when `.content p` already sets the same value.
    const rules = allRules(css);
    const offenders = [];

    for (const outer of rules) {
        for (const inner of rules) {
            if (outer === inner) continue;
            if (!outer.selector.endsWith(' ' + inner.selector)) continue;
            for (const [prop, value] of Object.entries(outer.declarations)) {
                if (inner.declarations[prop] === value) {
                    offenders.push(
                        `${outer.selector} { ${prop}: ${value} } duplicates ${inner.selector}`
                    );
                }
            }
        }
    }

    assert.deepEqual(offenders, []);
});
