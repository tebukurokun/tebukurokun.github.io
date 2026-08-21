# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal site deployed via GitHub Pages at `https://tebukuro.me/` (custom domain via `CNAME`; `tebukurokun.github.io` 301-redirects there). The main page is `index.html`, plus a standalone `privacy.html` (privacy policy, required for AdSense) and `cram/` (資格試験一夜漬けシート: `cram/index.html` is the hub, one HTML per exam subject alongside it). There is no build system, no framework, no package manager — just static HTML files. All CSS lives inline in each file's `<style>` block, all JS in a `<script>` block at the end of `<body>`.

The `master` branch is the deployment branch. Pushing to `origin/master` publishes the site.

Traffic to the apex domain is proxied through Cloudflare (DNS zone lives there). `https://tebukuro.me/blog/*` is **not** served by this repo — a Cloudflare Worker route (`tebukuro.me/blog*`, repo `../tebukuro-blog`) handles it. The old `blog.tebukuro.me` 301s to `/blog/` via a Cloudflare Redirect Rule. Keep root-page links to the blog as `/blog/` (same origin).

## Commands

```bash
# Local preview
open index.html

# Regenerate OGP image after editing og-image.svg (requires rsvg-convert from librsvg)
rsvg-convert -w 1200 -h 630 og-image.svg -o og-image.png

# Regenerate app icons after editing icon.svg or icon-glyph.png (requires rsvg-convert + ImageMagick)
rsvg-convert -w 512 -h 512 icon.svg -o /tmp/bg512.png
magick /tmp/bg512.png \( icon-glyph.png -resize 380x380 \) -gravity center -composite \
  -background "#08060f" -flatten /tmp/icon512.png
magick /tmp/bg512.png \( icon-glyph.png -resize 272x272 \) -gravity center -composite \
  -background "#08060f" -flatten icon-maskable-512x512.png
magick /tmp/icon512.png -resize 512x512 -strip android-chrome-512x512.png
magick /tmp/icon512.png -resize 192x192 -strip android-chrome-192x192.png
magick /tmp/icon512.png -resize 180x180 -strip apple-touch-icon.png
magick /tmp/icon512.png -define icon:auto-resize=48,32,16 favicon.ico
```

There is no linter, formatter, test suite, or CI configured. The repo formatter (Prettier-style) appears to be applied externally by the user's editor — preserve the existing whitespace style when editing.

## Architecture notes

- **No `index.md`.** GitHub Pages serves `index.html` when both exist; the legacy `index.md` was removed deliberately. Don't reintroduce it — edit `index.html` for content changes (self-intro, works list, etc.).
- **Design system** lives in CSS custom properties at the top of the `<style>` block: `--bg`, `--fg`, `--muted`, `--neon-1` (purple), `--neon-2` (cyan), `--neon-3` (pink). Use these tokens instead of hard-coding colors so the dark/neon theme stays coherent.
- **Background is three stacked fixed layers** (`.bg-gradient`, `.bg-grid`, `.bg-noise`) behind everything with negative `z-index`. New foreground elements don't need their own background.
- **External CDNs:** Google Fonts (Space Grotesk + JetBrains Mono) and FontAwesome v6 via cdnjs. The original FA kit script was removed because its v5 icon names didn't match the v6 markup; keep using v6 class syntax (`fa-brands fa-github`, `fa-solid fa-...`).
- **The Blog section's latest-post links (`.posts`) are hardcoded and must be updated by hand.** They exist to give crawlers real `<a href>` links to individual articles: Google's URL inspection reported `参照元ページ: 検出されませんでした` for every article, which is why they were not being indexed. Fetching `/blog/rss.xml` with JS would auto-update but would defeat the purpose, since the links must be in the initial HTML. **When you publish a new article, replace the top entry here** (the three newest, newest first). Article IDs and dates come from `https://tebukuro.me/blog/sitemap-0.xml` or the microCMS `blogs` endpoint.
- **Cards animate in via staggered `animation-delay`** on `:nth-child()` selectors. When adding a new work card, extend `.works .card:nth-child(N)` with a delay roughly 0.10s after the previous one.

## `cram/` (一夜漬けシート)

Self-contained study sheets, one HTML file per exam subject, indexed by `cram/index.html` (`https://tebukuro.me/cram/`). Each sheet carries its own inline `<style>` and does **not** share the root page's dark neon design system — they are light, print-oriented documents with their own accent color (green = 中小企業政策, blue = 経営法務, teal = 統計検定2級).

- Every sheet links back to the hub twice: `.home` in the hero and `.home-foot` before `<footer>`. Both are hidden in `@media print`.
- Adding a sheet means adding a `.card` to `cram/index.html` (pick an accent class) and the two back links to the new file.
- The pages moved out of the repo root on 2026-08-21. `chushokigyo_seisaku.html` and `keiei_houmu.html` were published at the root beforehand, so a Cloudflare Redirect Rule is needed if those old URLs are still shared.

## Icon policy

Two sources: `icon.svg` (the dark neon background, pure vector, same palette as `og-image.svg`) and `icon-glyph.png` (the 🧤 glyph, background already cut to transparent). Everything else is generated — don't hand-edit `apple-touch-icon.png`, `android-chrome-*.png`, `icon-maskable-512x512.png`, or `favicon.ico`.

- **Home-screen icons must be opaque.** iOS composites alpha onto black and Android onto white, so the generated PNGs are flattened onto `#08060f`.
- **`icon-maskable-512x512.png` carries a smaller glyph** so it survives Android's adaptive-icon crop (safe zone is the inner 80% circle). It's declared `"purpose": "maskable"` in `site.webmanifest`, separate from the `"any"` entries.
- **`favicon.svg` stays the transparent emoji SVG** — it's the browser-tab icon and should sit on the tab bar without a dark box. `favicon.ico` is the fallback for browsers without SVG favicon support.
- Both `index.html` and `privacy.html` carry the full head block (icons + manifest + `apple-mobile-web-app-*`). Keep them in sync.

## OGP image policy

`og-image.svg` is the source; `og-image.png` is generated from it. Keep the OGP image **content-agnostic** — only durable elements (site name, URL, decoration). Do **not** bake in self-intro lines, tech stack, or works lists, because those change frequently in `index.html` and would otherwise force a regeneration on every edit.
