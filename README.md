# Personal Website

A retro pixel-art inspired personal portfolio website with an Undertale/Deltarune aesthetic.

**Live site:** https://dcmshi.github.io/

## Features

- **Pure HTML/CSS/JavaScript** - No frameworks, no build step
- **Pixel-perfect design** - Press Start 2P font, retro game menu vibes
- **Static hosting** - Ready for GitHub Pages deployment
- **Responsive** - Works on desktop, tablet, and mobile
- **Accessible** - WCAG AA contrast, keyboard navigation, skip-link, semantic landmarks, aria attributes, reduced-motion support
- **Collapsible project cards** - Each project expands/collapses on click with smooth, lag-free animation
- **Annoying dog animations** - Sprite-based cameos across the page (respects `prefers-reduced-motion`)
- **Easter egg** - Gauntlet of Deadly Terror (click "Press Start" to find out)
- **Custom 404 page** - But nobody came.
- **Link previews** - Open Graph tags and a pixel-art banner for social shares

## Local Development

Simply open `index.html` in your browser. No build process required.

## Tests

```
node --test
```

Requires Node 18+ and nothing else — the suite uses the built-in test runner,
so the project stays dependency-free. The tests read `index.html`, `styles.css`
and `script.js` as text and assert on the things that are easy to break by
accident: WCAG contrast ratios computed from the declared colours, touch-target
sizes, ARIA wiring on the accordion, `og:image` dimensions checked against the
real PNG header, and a lint for CSS rules that restate what they inherit.

They do not cover animation timing or anything else that needs a live browser.

## Making Changes

- **Projects** live in the projects section of `index.html` — each is a self-contained `.project-item` block; copy one to add a new project.
- **Colors** are plain hex values in `styles.css`: black `#000000` background, white text, red `#ff0000` / yellow `#ffff00` / cyan `#00ffff` accents.
- **Sprite behaviour** (dog animations, gauntlet obstacles) is configured in the constant tables at the top of the IIFE in `script.js`.

## Deployment

Hosted on GitHub Pages. Pushing to `main` deploys automatically to https://dcmshi.github.io/.

## File Structure

```
personal_website/
├── index.html           # Main HTML structure
├── 404.html             # Custom GitHub Pages 404
├── styles.css           # All styling
├── script.js            # Project accordion, annoying dog, easter egg
├── fonts/
│   ├── DTM-Mono.woff2   # Determination Mono (what the site loads)
│   ├── DTM-Mono.ttf     # Fallback, and the source for the WOFF2
│   └── README.md        # Font setup instructions
├── images/
│   ├── annoying-dog.png              # Dog sprite sheet (transparent PNG)
│   ├── gauntlet-of-deadly-terror.png # Obstacle sprite sheet
│   ├── favicon.png                   # Annoying dog favicon
│   ├── apple-touch-icon.png          # 180x180 iOS home screen icon
│   └── og-banner.png                 # Link-preview banner
├── tests/               # node --test suite (no dependencies)
└── README.md            # This file
```

## Design Philosophy

This site prioritizes:
- **Intentionality** over flashiness
- **Simplicity** over complexity
- **Personality** over polish
- **Craft** over corporate

Inspired by Undertale/Deltarune's UI design - nostalgic, minimal, and full of character.

## Browser Compatibility

Tested on modern browsers. IE11 is not supported.

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 90+            |
| Firefox | 88+            |
| Safari  | 14+            |
| Edge    | 90+            |

## License

Feel free to use this template for your own personal website. Attribution appreciated but not required.

---

*Made with intention. No frameworks harmed in the making of this site.*
