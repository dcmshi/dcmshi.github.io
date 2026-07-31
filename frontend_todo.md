# Frontend & Design Audit

Audit of `index.html`, `404.html`, `styles.css`, `script.js` (2026-07-31).
Overall the site is in good shape: consistent retro aesthetic, semantic HTML,
reduced-motion handling, and tidy dependency-free code. Findings below are
grouped by area, ordered roughly by priority.

## Accessibility

- [ ] **Collapsed project cards leave links keyboard-focusable** (bug).
      `.project-body` is hidden with `max-height: 0; overflow: hidden`, but the
      links inside remain in the tab order while invisible. Keyboard users can
      tab onto links they can't see. Fix: also toggle `visibility: hidden`
      (transitions cleanly) or set `inert`/`hidden` via JS when collapsed.
      (`styles.css:317`, `script.js:14`)
- [ ] **Gauntlet overlay dialog has no focus management.** It uses
      `role="dialog" aria-modal="true"` but focus is never moved into it, never
      trapped, and background content isn't made inert — screen reader / keyboard
      users can still reach the page behind the overlay. Move focus on open,
      restore on close, consider `inert` on the rest of the page.
      (`script.js:363-366`)
- [ ] **Dog canvases are not `aria-hidden`.** Each `Dog` appends a bare
      `<canvas>` to `<body>`; add `aria-hidden="true"` (or `role="presentation"`)
      to the wrapper so assistive tech ignores the decorative sprite.
      (`script.js:140-151`)
- [ ] **Fake buttons.** `.press-start` is a `<p role="button">` and each
      `.project-name` is an `<h3 role="button">`. They work (Enter/Space handled),
      but real `<button>` elements give focus, key handling, and semantics for
      free. For the accordion, the standard pattern is `<h3><button
      aria-expanded aria-controls>...</button></h3>`. (`index.html:44,86`)
- [ ] **Low-contrast text.** Fails WCAG AA (4.5:1) for small text on black:
      `.expand-indicator` `#555555` (~2.8:1, `styles.css:308`) and
      `.footer-credit` `#666666` (~3.7:1, `styles.css:395`). Bump to ≥ `#888`.
      The `#333` dismiss hint in the gauntlet is decorative but nearly invisible
      (~1.8:1) — fine if intentional, otherwise brighten.
- [ ] **Skip link skips the primary nav.** "Skip to main content" jumps to
      `#main-content`, bypassing the title-screen menu — which *is* the site's
      main navigation. Either keep the menu reachable or rethink the target.
      (`index.html:27,48`)
- [ ] **Accordion animation ignores reduced-motion.** The CSS media query
      disables the cursor/selector/arrow animations but not the `.project-body`
      max-height transition. Add it to the `prefers-reduced-motion` block.
      (`styles.css:495`)
- [ ] **Enter-key hijack.** Pressing Enter with nothing focused (scrollY < 100)
      force-scrolls to About. Unexpected for screen-reader and keyboard users;
      consider dropping it or narrowing the trigger. (`script.js:45-55`)

## Performance

- [ ] **Cache-buster on the gauntlet sprite.** `script.js:650` appends
      `?v=${Date.now()}`, forcing a re-download on every page load. Remove it —
      the file is static and GitHub Pages sets cache headers.
- [ ] **Font loading.** `DTM-Mono.ttf` is 148 KB, TTF-only, and not preloaded.
      Convert to WOFF2 (typically 50-70% smaller), keep the TTF fallback, and add
      `<link rel="preload" as="font" type="font/woff2" crossorigin>`.
      (`styles.css:9-15`)
- [ ] **VT323 is loaded but effectively unused.** It's only a mid-stack fallback
      behind the local Determination Mono (`styles.css:32`). Either use it
      somewhere deliberately or drop it from the Google Fonts request to save a
      download. (`index.html:22`)
- [ ] **Dog timers keep running in background tabs.** `setInterval` frame ticks
      continue (throttled) when the tab is hidden; `rAF` steps pause. Harmless at
      this scale, but a `document.visibilitychange` pause would be tidy.

## Design / UX

- [ ] **Sleeping dog can cover text.** Dogs spawn in the top/bottom third at
      `z-index: 9999` and can sit asleep for up to 5 s over readable content.
      Part of the charm, but consider biasing spawn bands toward empty space or
      shortening the sleep window. (`script.js:173-177,298-301`)
- [ ] **`min-height: 100vh` on mobile.** `.section` uses `100vh`, which includes
      the mobile browser chrome and can cause a slightly-too-tall first screen.
      Prefer `min-height: 100svh`/`100dvh` with the `vh` fallback.
      (`styles.css:44`)
- [ ] **Skip link vs. dog z-index overlap.** `.skip-link` is `z-index: 100`, the
      dog is `9999` — a passing dog can render over the focused skip link.
      Pointer-events are off so it's cosmetic, but raising the skip link above
      the dog is one line. (`styles.css:466`)
- [ ] Small-screen tap targets are borderline: `.project-link` / `.contact-link`
      are inline 14-16 px text with no padding. Consider a little vertical
      padding or `inline-block` spacing for thumbs. (already `inline-block` for
      project links; contact links are not)

## SEO / Meta

- [ ] Add `og:image:width` / `og:image:height` (1200x630) and `og:image:alt` so
      crawlers don't need a second fetch. (`index.html:14`)
- [ ] Add `<meta name="theme-color" content="#000000">` for mobile browser chrome.
- [ ] Add an `apple-touch-icon` (the 66x66 favicon is small for iOS home screen).
- [ ] Optional: `<link rel="canonical" href="https://dcmshi.github.io/">`.
- [x] Good already: `description`, OG/Twitter cards, `noindex` on 404,
      `lang="en"`, absolute paths on 404 assets.

## Code Quality (minor)

- [ ] `Dog.prototype.draw` recomputes `Math.max(...frames)` on every frame and
      resets `canvas.width` each draw (clears context state). Precompute max
      widths once; cosmetic at this scale. (`script.js:154-165`)
- [ ] Duplicated rule: `.about-section .content p` redeclares `.content p`'s
      margin. (`styles.css:244-246`)
- [ ] `console.log` easter egg messages are intentional — keep.

## What's Working Well

- Cohesive Undertale aesthetic; disciplined palette and typography scale.
- `prefers-reduced-motion` respected in both CSS and JS (dog cameos disabled,
  user-triggered gauntlet kept).
- Semantic landmarks, skip link, visible focus outlines, `aria-expanded` on the
  accordion, `aria-hidden` on decorative glyphs.
- Zero dependencies, no build step; sprite frame tables are cleanly data-driven.
- Tiny image assets (all under 16 KB); `rel="noopener"` on external links;
  correct absolute paths on the 404 page.
