# Fonts Directory

## Determination Mono Font Setup

To use the authentic Undertale font, download **Determination Mono** and place the files here.

### Download Links

1. **FontSpace** (recommended): https://www.fontspace.com/determination-mono-font-f40795
2. **dafont.com**: Search for "Determination Mono"
3. **GitHub**: Search for "Determination Mono font" repositories

### Installation

1. Download the font files (you need at least one of these formats):
   - `DTM-Mono.ttf` or `DeterminationMono.ttf` (TrueType - works great!)
   - `DTM-Mono.otf` (OpenType)
   - `DeterminationMonoWebRegular.woff` (Web Font)
   - `DeterminationMonoWebRegular.woff2` (Web Font 2 - best compression)

2. Place the downloaded files in this `fonts/` directory

3. The CSS is already configured to load the font with these filenames

### Fallback Fonts

If Determination Mono isn't loaded, the site will fall back to:
1. VT323 (Google Fonts - similar style)
2. System monospace font

### File Structure After Download

```
fonts/
├── README.md (this file)
└── DTM-Mono.ttf (or any of the other formats)
```

Note: You only need to download the files - the CSS `@font-face` declaration is already set up!
