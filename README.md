# Personal Website

A retro pixel-art inspired personal portfolio website with an Undertale/Deltarune aesthetic.

## Features

- **Pure HTML/CSS/JavaScript** - No frameworks, no build step
- **Pixel-perfect design** - Press Start 2P font, retro game menu vibes
- **Static hosting** - Ready for GitHub Pages deployment
- **Responsive** - Works on desktop, tablet, and mobile
- **Accessible** - Keyboard navigation, sufficient contrast, semantic HTML

## Local Development

Simply open `index.html` in your browser. No build process required.

## Customization

### Update Your Information

1. Open `index.html`
2. Replace the following placeholders:
   - `[Your Name]` - Your full name or display name
   - `@[your-handle]` - Your username/handle
   - `[your-username]` - Your GitHub username
   - `[repo-name]` - Your repository names
   - `[your-linkedin]` - Your LinkedIn profile ID
   - `[your-email]@example.com` - Your email address

### Add Your Projects

Edit the projects section in `index.html`:
- Update project names, descriptions, and tech stacks
- Replace GitHub links with your actual repositories
- Add or remove projects as needed

### Customize Colors

Edit `styles.css` to change the color scheme:
- Background: `#000000` (black)
- Text: `#ffffff` (white)
- Accent Red: `#ff0000`
- Accent Yellow: `#ffff00`
- Accent Cyan: `#00ffff`

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit: Undertale-inspired personal website"
git branch -M main
git remote add origin https://github.com/[your-username]/[repo-name].git
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Set Source to "Deploy from a branch"
   - Select `main` branch and `/ (root)` folder
   - Click Save

4. Your site will be live at: `https://[your-username].github.io/[repo-name]/`

## File Structure

```
personal_website/
├── index.html       # Main HTML structure
├── styles.css       # All styling
├── script.js        # Minimal interactivity
├── README.md        # This file
└── CLAUDE.md        # Project brief and guidelines
```

## Design Philosophy

This site prioritizes:
- **Intentionality** over flashiness
- **Simplicity** over complexity
- **Personality** over polish
- **Craft** over corporate

Inspired by Undertale/Deltarune's UI design - nostalgic, minimal, and full of character.

## License

Feel free to use this template for your own personal website. Attribution appreciated but not required.

---

*Made with intention. No frameworks harmed in the making of this site.*
