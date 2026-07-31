// Shared helpers for the site tests.
//
// The site has no build step and no dependencies, so these tests read the
// source files as text and assert on their content. Run with `node --test`.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// Strips /* ... */ comments so selector matching doesn't hit commented-out code.
function stripCssComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Removes @media/@supports blocks so top-level lookups don't pick up an
// override that only applies under a media query. Use mediaBlock() for those.
function stripAtRuleBlocks(css) {
    let out = '';
    for (let i = 0; i < css.length; i++) {
        if (css[i] !== '@') { out += css[i]; continue; }
        const open = css.indexOf('{', i);
        if (open === -1) { out += css.slice(i); break; }
        let depth = 0;
        let end = open;
        for (; end < css.length; end++) {
            if (css[end] === '{') depth++;
            else if (css[end] === '}') {
                depth--;
                if (depth === 0) break;
            }
        }
        i = end;
    }
    return out;
}

// Returns the declaration block bodies for every rule whose selector list
// contains `selector` exactly (as one of its comma-separated parts).
function rules(css, selector) {
    const found = [];
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(stripAtRuleBlocks(stripCssComments(css)))) !== null) {
        const selectors = m[1].split(',').map(s => s.trim().replace(/\s+/g, ' '));
        if (selectors.includes(selector)) found.push(m[2]);
    }
    return found;
}

// Returns the last declared value of `prop` for `selector`, or undefined.
// Last wins, matching the cascade for rules of equal specificity.
function declaration(css, selector, prop) {
    const blocks = rules(css, selector);
    let value;
    for (const block of blocks) {
        for (const decl of block.split(';')) {
            const idx = decl.indexOf(':');
            if (idx === -1) continue;
            if (decl.slice(0, idx).trim() === prop) value = decl.slice(idx + 1).trim();
        }
    }
    return value;
}

// Returns the body of the first `@<name>` block, e.g. atRuleBlock(css, 'font-face').
function atRuleBlock(css, name) {
    const clean = stripCssComments(css);
    const start = clean.indexOf('@' + name);
    if (start === -1) return '';
    const open = clean.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < clean.length; i++) {
        if (clean[i] === '{') depth++;
        else if (clean[i] === '}') {
            depth--;
            if (depth === 0) return clean.slice(open + 1, i);
        }
    }
    return '';
}

// Returns the body of an @media block whose query contains `queryFragment`.
function mediaBlock(css, queryFragment) {
    const clean = stripCssComments(css);
    const start = clean.indexOf('@media');
    let idx = start;
    while (idx !== -1) {
        const open = clean.indexOf('{', idx);
        const query = clean.slice(idx, open);
        if (query.includes(queryFragment)) {
            // Walk braces to find the matching close for this at-rule.
            let depth = 0;
            for (let i = open; i < clean.length; i++) {
                if (clean[i] === '{') depth++;
                else if (clean[i] === '}') {
                    depth--;
                    if (depth === 0) return clean.slice(open + 1, i);
                }
            }
        }
        idx = clean.indexOf('@media', idx + 1);
    }
    return '';
}

// Returns the body of `function <name>(...)` or `<name> = function(...)` from JS
// source, brace-matched. Lets a test scope its assertions to one function.
function functionBody(js, name) {
    let start = js.indexOf('function ' + name);
    if (start === -1) start = js.indexOf(name + ' = function');
    if (start === -1) throw new Error('function not found: ' + name);
    const open = js.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < js.length; i++) {
        if (js[i] === '{') depth++;
        else if (js[i] === '}') {
            depth--;
            if (depth === 0) return js.slice(open + 1, i);
        }
    }
    throw new Error('unbalanced braces in: ' + name);
}

// WCAG 2.1 relative luminance and contrast ratio.
function luminance(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const channels = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
    const [r, g, b] = channels.map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg, bg) {
    const a = luminance(fg);
    const b = luminance(bg);
    const [light, dark] = a > b ? [a, b] : [b, a];
    return (light + 0.05) / (dark + 0.05);
}

module.exports = {
    ROOT,
    read,
    rules,
    declaration,
    atRuleBlock,
    mediaBlock,
    functionBody,
    contrastRatio,
};
