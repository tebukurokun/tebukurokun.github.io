# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page personal site (`index.html`) deployed via GitHub Pages at `https://tebukurokun.github.io/`. There is no build system, no framework, no package manager — just a static HTML file. All CSS lives inline in a `<style>` block, all JS in a `<script>` block at the end of `<body>`. Edits go directly into `index.html`.

The `master` branch is the deployment branch. Pushing to `origin/master` publishes the site.

## Commands

```bash
# Local preview
open index.html

# Regenerate OGP image after editing og-image.svg (requires rsvg-convert from librsvg)
rsvg-convert -w 1200 -h 630 og-image.svg -o og-image.png
```

There is no linter, formatter, test suite, or CI configured. The repo formatter (Prettier-style) appears to be applied externally by the user's editor — preserve the existing whitespace style when editing.

## Architecture notes

- **No `index.md`.** GitHub Pages serves `index.html` when both exist; the legacy `index.md` was removed deliberately. Don't reintroduce it — edit `index.html` for content changes (self-intro, works list, etc.).
- **Design system** lives in CSS custom properties at the top of the `<style>` block: `--bg`, `--fg`, `--muted`, `--neon-1` (purple), `--neon-2` (cyan), `--neon-3` (pink). Use these tokens instead of hard-coding colors so the dark/neon theme stays coherent.
- **Background is three stacked fixed layers** (`.bg-gradient`, `.bg-grid`, `.bg-noise`) behind everything with negative `z-index`. New foreground elements don't need their own background.
- **External CDNs:** Google Fonts (Space Grotesk + JetBrains Mono) and FontAwesome v6 via cdnjs. The original FA kit script was removed because its v5 icon names didn't match the v6 markup; keep using v6 class syntax (`fa-brands fa-github`, `fa-solid fa-...`).
- **Cards animate in via staggered `animation-delay`** on `:nth-child()` selectors. When adding a new work card, extend `.works .card:nth-child(N)` with a delay roughly 0.10s after the previous one.

## OGP image policy

`og-image.svg` is the source; `og-image.png` is generated from it. Keep the OGP image **content-agnostic** — only durable elements (site name, URL, decoration). Do **not** bake in self-intro lines, tech stack, or works lists, because those change frequently in `index.html` and would otherwise force a regeneration on every edit.
