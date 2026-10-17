# ITYes — static website

## Project structure

- `index.html` — page markup and content.
- `css/` — stylesheets (`styles.css`, `mobile.css`, `path.css`).
- `js/` — JavaScript split by responsibility:
  - `navigation.js` — mobile navigation.
  - `path.js` — learning-path SVG connectors and animation.
  - `cursor.js` — custom cursor.
  - `reveal.js` — scroll reveal effects.
- `images/` — logo and SVG illustrations.

Open `index.html` through a local static server for the most reliable behavior of ES modules. All page content remains in the original HTML; this refactor only moves JavaScript into separate files.
