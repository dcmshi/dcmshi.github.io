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
├── fonts/               # Determination Mono font files
│   └── README.md        # Font setup instructions
├── images/
│   ├── annoying-dog.png              # Dog sprite sheet (transparent PNG)
│   ├── gauntlet-of-deadly-terror.png # Obstacle sprite sheet
│   ├── favicon.png                   # Pixel heart favicon
│   └── og-banner.png                 # Link-preview banner
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
