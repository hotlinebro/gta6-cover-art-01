# Neon Harbor Cover Studio — GTA-style cover art maker

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/hotlinebro/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/hotlinebro/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your own photos and a caption into GTA-style cover art: a 7-panel slanted collage poster with a pop-out hero close-up, slanted role tags, a striped retro-chrome title, script subtitle, press-quote masthead, ribbon tagline, sunset skyline, gold seal, billing block and barcode — exported as PNG in 1080x1080, 1080x1350 and 1920x1080.

Entry for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01).

## How it works

Four steps from photo to PNG, all in the browser, all offline:

1. **Load photos** — pick your own photos from your machine (they never leave it) or tap a bundled sample portrait. Each photo fills one of the 7 panels.
2. **Pick a layout and a grade** — 8 layouts (the 7-panel collage plus 7 alternates) and 7 sunset/neon colour grades, applied consistently across every panel.
3. **Crop each panel** — select a panel, then zoom and position its photo; the hero panel defaults to a tight face close-up. Edit the role tag, title, subtitle, ribbon tagline and press quote.
4. **Export** — one click writes the PNG in the size you picked: 1080x1080, 1080x1350 or 1920x1080.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

`app/` is plain static files with no build step and no network requests: `index.html`, `style.css`, `src/cover.js` (the poster renderer), `src/main.js` (the editor), `src/shots.js` (fixed screenshot scenes), the vendored Anton font under `app/fonts/`, and six sample portraits under `app/samples/` (four made with an image model in the build session, two from the kit starter, all free to use).

## Originality

All artwork, lettering and fonts are original or openly licensed. Anton is shipped under the SIL Open Font License (see `app/fonts/OFL.txt`). No Rockstar Games logo, artwork, character or font is used anywhere.
