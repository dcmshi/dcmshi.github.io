# Fonts Directory

## Determination Mono Font Setup

To use the authentic Undertale font, download **Determination Mono** and place the files here.

### Download Links

1. **FontSpace** (recommended): https://www.fontspace.com/determination-mono-font-f40795
2. **dafont.com**: Search for "Determination Mono"
3. **GitHub**: Search for "Determination Mono font" repositories

### Installation

1. Download `DTM-Mono.ttf` (TrueType format)

2. Place it in this `fonts/` directory

3. Generate the WOFF2 the site actually loads (roughly 10x smaller):

   ```
   pip install fonttools brotli
   python -c "from fontTools.ttLib import TTFont; f=TTFont('fonts/DTM-Mono.ttf'); f.flavor='woff2'; f.save('fonts/DTM-Mono.woff2')"
   ```

4. The CSS `@font-face` is already configured to load the WOFF2 with the TTF
   as a fallback

### Fallback Fonts

If Determination Mono isn't loaded, the site falls back to the system
monospace font. (VT323 used to sit in between, but it was a Google Fonts
download that the local font almost always beat, so it was dropped.)

### File Structure After Download

```
fonts/
├── README.md (this file)
├── DTM-Mono.woff2
└── DTM-Mono.ttf
```
