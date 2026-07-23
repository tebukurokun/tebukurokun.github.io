# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal site deployed via GitHub Pages at `https://tebukuro.me/` (custom domain via `CNAME`; `tebukurokun.github.io` 301-redirects there). The main page is `index.html`, plus a standalone `privacy.html` (privacy policy, required for AdSense). There is no build system, no framework, no package manager — just static HTML files. All CSS lives inline in each file's `<style>` block, all JS in a `<script>` block at the end of `<body>`.

The `master` branch is the deployment branch. Pushing to `origin/master` publishes the site.

Traffic to the apex domain is proxied through Cloudflare (DNS zone lives there). `https://tebukuro.me/blog/*` is **not** served by this repo — a Cloudflare Worker route (`tebukuro.me/blog*`, repo `../tebukuro-blog`) handles it. The old `blog.tebukuro.me` 301s to `/blog/` via a Cloudflare Redirect Rule. Keep root-page links to the blog as `/blog/` (same origin).

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
