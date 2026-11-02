# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal site deployed via GitHub Pages at `https://tebukuro.me/` (custom domain set in the repo's Pages settings, with `public/CNAME` kept as a record; `tebukurokun.github.io` 301-redirects there). The main page is `index.html` (`src/pages/index.astro`), plus a standalone `privacy.html` (privacy policy, required for AdSense), `cram/` (資格試験一夜漬けシート) and `shindanshi-2ji/` (2次試験 過去問解説).

**Built with Astro** (`astro` is the only dependency; the last pure-static version is tagged `pre-astro`). Astro builds `src/pages/` and copies `public/` as-is into `dist/`; `public/` now holds only static assets (icons, OGP image, `link-icons/`, `robots.txt`, `ads.txt`, `site.webmanifest`, `CNAME`, `shindanshi-2ji/style.css` and `site.js`). `astro.config.mjs` uses `build.format: 'preserve'` so the URLs (`/cram/`, `/cram/keiei_houmu.html`, `/privacy.html`) stay exactly as before, and `compressHTML: false` so output can be diffed against the old HTML. Layouts are in `src/layouts/` (`Root.astro` for the top page and privacy, `CramSheet.astro`, `Shindanshi.astro`), page lists in `src/data/`. Page CSS stays inline in a `<style is:inline>` and page JS in a `<script is:inline>` at the end of `<body>` — keep `is:inline`, or Astro scopes the CSS and bundles the JS. Exceptions: `shindanshi-2ji/` shares `style.css` and `site.js`, and the cram sheets' table-card script comes from their layout.

The `master` branch is the deployment branch. Pushing to `origin/master` runs `.github/workflows/deploy.yml` (Pages Source = GitHub Actions), which runs `npm ci && npm run build` and publishes `dist/`. It also runs twice a day, at 00:05 and 03:10 JST (Wikipedia's 選り抜き記事 switches at 00:00 JST, and GitHub's scheduled runs can start hours late, so the second run is a backstop; it also puts a new blog article on the top page's latest-post list overnight), and on manual dispatch. The checkout uses `fetch-depth: 0` because the sitemap reads git history.

Traffic to the apex domain is proxied through Cloudflare (DNS zone lives there). `https://tebukuro.me/blog/*` is **not** served by this repo — a Cloudflare Worker route (`tebukuro.me/blog*`, repo `../tebukuro-blog`) handles it. The old `blog.tebukuro.me` 301s to `/blog/` via a Cloudflare Redirect Rule. Keep root-page links to the blog as `/blog/` (same origin).

## Adding content

| To add | Touch | Details |
| --- | --- | --- |
| A 2次試験 case | one page + one entry in `src/data/shindanshi.ts` | "`shindanshi-2ji/`" below |
| A cram sheet | one page + one entry in `src/data/cram.ts` | "`cram/`" below |
| A link card (Links / Neighbors) | one entry in `src/data/links.ts` (+ favicon in `public/link-icons/`) | "Architecture notes" |
| A blog article on the top page | nothing — the next build (00:05 / 03:10 JST daily) reads the RSS | "Architecture notes" |

Sidebars, hub cards, head tags and the sitemap are generated from these; don't edit them by hand.

## Commands

```bash
npm install          # first time
npm run dev          # local preview with live reload (http://localhost:4321)
npm run build        # build to dist/
npm run preview      # serve dist/
npm run lint         # Biome: lint + format check (no writes)
npm run format       # Biome: apply formatting and safe fixes

# Regenerate OGP image after editing og-image.svg (requires rsvg-convert from librsvg)
rsvg-convert -w 1200 -h 630 og-image.svg -o public/og-image.png

# Regenerate app icons after editing icon.svg or icon-glyph.png (requires rsvg-convert + ImageMagick)
rsvg-convert -w 512 -h 512 icon.svg -o /tmp/bg512.png
magick /tmp/bg512.png \( icon-glyph.png -resize 380x380 \) -gravity center -composite \
  -background "#08060f" -flatten /tmp/icon512.png
magick /tmp/bg512.png \( icon-glyph.png -resize 272x272 \) -gravity center -composite \
  -background "#08060f" -flatten public/icon-maskable-512x512.png
magick /tmp/icon512.png -resize 512x512 -strip public/android-chrome-512x512.png
magick /tmp/icon512.png -resize 192x192 -strip public/android-chrome-192x192.png
magick /tmp/icon512.png -resize 180x180 -strip public/apple-touch-icon.png
magick /tmp/icon512.png -define icon:auto-resize=48,32,16 public/favicon.ico
```

**Biome** (`biome.json`, pinned in `devDependencies`) lints and formats TS/JS/JSON/YAML and the frontmatter of `.astro` files; run `npm run format` after editing them. Deliberately left out: `.astro` templates (Biome's HTML support is experimental, and reflowing the Japanese page bodies would rewrite ~25k lines and can insert visible spaces between CJK characters), CSS formatting (the compact one-rule-per-line style of `style.css` and the inline `<style>`s is intentional; CSS is still linted), Markdown and standalone `.svg` files. The unused-import/variable rules are off for `.astro` because Biome can't see what the template uses. There is no test suite. `.github/workflows/lint.yml` runs `biome ci` (read-only, annotates PR diffs) on every push to `master` and on pull requests; it is separate from the deploy workflow, so a lint failure doesn't block publishing. For the parts Biome doesn't format, preserve the existing whitespace style.

## Architecture notes

- **Top page = `src/pages/index.astro` + `src/layouts/Root.astro`.** Edit the page for content (self-intro, hero, sections); the layout writes the shared head (`components/Head.astro` plus manifest, `theme-color`, `apple-mobile-web-app-*` and Google Fonts), and the page adds the AdSense meta, FontAwesome and its `<style>` through `<Fragment slot="head">`. Don't reintroduce the legacy `index.md`.
- **Design system** lives in CSS custom properties at the top of the `<style>` block: `--bg`, `--fg`, `--muted`, `--neon-1` (purple), `--neon-2` (cyan), `--neon-3` (pink). Use these tokens instead of hard-coding colors so the dark/neon theme stays coherent.
- **Background is three stacked fixed layers** (`.bg-gradient`, `.bg-grid`, `.bg-noise`) behind everything with negative `z-index`. New foreground elements don't need their own background.
- **External CDNs:** Google Fonts (Space Grotesk + JetBrains Mono) and FontAwesome v6 via cdnjs. The original FA kit script was removed because its v5 icon names didn't match the v6 markup; keep using v6 class syntax (`fa-brands fa-github`, `fa-solid fa-...`).
- **The Blog section's latest-post links (`.posts`) are generated at build time** from `https://tebukuro.me/blog/rss.xml` by `src/lib/blog.ts` (the three newest by `pubDate`, dated in JST). They exist to give crawlers real `<a href>` links to individual articles: Google's URL inspection reported `参照元ページ: 検出されませんでした` for every article, which is why they were not being indexed. That's why they're fetched at build time, not with JS in the browser — the links must be in the initial HTML. If the feed can't be fetched (two tries) or is malformed, **the build fails on purpose**, so nothing is deployed and the live page keeps its last good list. A new article shows up after the next build (00:05 / 03:10 JST daily, any push, or a manual run of the Deploy workflow).
- **The hero's right column is a "today's Wikipedia" card,** `components/root/WikiCard.astro`, filled at build time by `src/lib/wikipedia.ts` from `https://api.wikimedia.org/feed/v1/wikipedia/ja/featured/YYYY/MM/DD` (`tfa`, the 選り抜き記事 that ja.wikipedia's `Template:秀逸スケジュール` rotates at 00:00 JST; the date is computed in JST). Unlike the blog list it's decoration, so a failed fetch only logs a warning and leaves the card out — the hero falls back to one column (`.has-wiki` is absent) and the build continues. The card reuses `.card`; the thumbnail is hotlinked from `*.wikimedia.org` (some days have none, and the card works without it), the extract is plain text clipped to four lines (below 820px, where the card drops under the intro, it turns into a short horizontal card — 84px square thumbnail on the left, three lines of text — via `.has-thumb`), and the CC BY-SA 4.0 credit under the card is required by the extract's license. Requests send a descriptive `User-Agent`, as Wikimedia asks. The card isn't part of the sitemap's `lastmod`.
- **Link cards (Links and Neighbors) are data:** `WORKS` and `NEIGHBORS` in `src/data/links.ts`, rendered by `components/root/LinkCard.astro`. Array order is display order. Add or edit a card there, not in the page.
- **Links cards show the linked site's favicon** as `<img class="card-icon">` at the start of the `<h3>` (the `icon` field). The icons are local copies in `public/link-icons/` (fetched from each site, or from the extension repo's icon), not hotlinks, so a down site can't break the card. `cram/` and `shindanshi-2ji/` share `study.svg`, a hand-drawn open-book icon made for them (they have no favicon of their own besides the site's 🧤). Cards whose target has no icon of its own (alert-loop) omit `icon`. Replace the copy when a site's icon changes.
- **The Neighbors section (`#neighbors`, 相互リンクなど) is the last section in `<main>`**, after BBS, and reuses the `.works` grid and `LinkCard`; its favicons also go in `public/link-icons/`. It's deliberately not in the top nav: one more item cuts off CONTACT at 360px.
- **Cards animate in via staggered `animation-delay`:** `LinkCard` passes its position as `style="--i: N"` and the page CSS computes `calc(0.35s + var(--i) * 0.1s)`, so new cards need no CSS. The COMING SOON placeholder gets `--i: WORKS.length`.

## `cram/` (一夜漬けシート)

Self-contained study sheets, one page per exam subject (`https://tebukuro.me/cram/`). **Migrated to Astro:** `src/pages/cram/index.astro` is the hub, one file per sheet (e.g. `keiei_houmu.astro`), built to the same `.html` URLs. Each sheet carries its own inline `<style>` and does **not** share the root page's dark neon design system — they are light, print-oriented documents with their own accent color (green = 中小企業政策, blue = 経営法務, teal = 統計検定2級, orange = 2次試験).

- **Layout:** every sheet wraps its content in `src/layouts/CramSheet.astro`, passing `page` (the file's slug), `title`, `description` and `footer` (the footer sentence). The page's `<style is:inline slot="head">` goes into `<head>`; the hero and `.layout` go in the default slot; sheet-specific JS (search, progress, quiz) goes in `<script is:inline slot="script">`. The layout writes the head tags (`components/Head.astro`), the `.home-foot` back link, the footer and the table-card script. Keep `is:inline` on `<style>` and `<script>` — without it Astro scopes the CSS and bundles the JS.
- **The hub's cards come from `SHEETS` in `src/data/cram.ts`** (`accent` picks the card color class). The "COMING SOON" placeholder card stays literal in the hub.
- Every sheet links back to the hub twice: `.home` in the hero (in the page) and `.home-foot` before `<footer>` (from the layout). Both point at `./` and are hidden in `@media print`.
- Dark mode follows the OS setting: each sheet ends its `<style>` with a `@media screen and (prefers-color-scheme: dark)` block that redefines the `:root` tokens and overrides the hard-coded colors (the `screen` guard keeps printing light). When you add a rule with a literal color, add its dark override there too.
- Tables go inside `<div class="table-wrap">` with a `<thead>`. At ≤640px the layout's script turns them into one card per row: it adds `.stack`, marks each row's first cell `.stack-head`, copies the column header into the other cells' `data-label`, and each sheet's `@media screen and (max-width: 640px)` block at the end of `<style>` lays them out. The CSS block differs per sheet (token names), so a new sheet copies it from an existing one and adjusts the tokens.
- Page bodies are plain HTML inside `.astro`: write a literal brace as `{'{'}` / `{'}'}` (the 統計検定 formulas use many).
- Adding a sheet means: copy an existing sheet page (change `page`, `title`, `description`, `footer`, the hero and the colors), and add an entry to `SHEETS` in `src/data/cram.ts`. The sitemap picks the page up by itself.
- The pages moved out of the repo root on 2026-08-21. `chushokigyo_seisaku.html` and `keiei_houmu.html` were published at the root beforehand, so a Cloudflare Redirect Rule is needed if those old URLs are still shared.

## `shindanshi-2ji/` (2次試験 過去問解説)

Per-case explanation pages for the 中小企業診断士2次試験, kept separate from the cram sheets (`https://tebukuro.me/shindanshi-2ji/`). **Migrated to Astro:** `src/pages/shindanshi-2ji/index.astro` is the hub, one file per case named `rNN-jireiN.astro` (e.g. `r06-jirei1.astro`), built to the same `.html` URLs.

- **Layout is shared, not copied.** Every page wraps its content in `src/layouts/Shindanshi.astro`, passing `page` (`hub` or the file's slug), `title` and `description`; the hero goes in `slot="hero"`, the rest of `<main>` in the default slot. The layout writes the head (`src/components/Head.astro`), `<body data-page data-case>`, the sidebar, the prev/next `.case-nav`, the back link and the footer. Styling stays in `public/shindanshi-2ji/style.css` and behaviour in `public/shindanshi-2ji/site.js` (practice toggle and TOC highlighting only); they are served as-is, not bundled.
- **Case colors** are the `[data-case="N"]` blocks in `style.css` (light and dark), overriding `--main`, `--main-soft`, `--deep`, `--hero-*`; blue = 事例Ⅰ, rose = 事例Ⅱ, teal = 事例Ⅲ, violet = 事例Ⅳ. The base `:root` tokens are the hub's slate. The hub's cards reuse the same attribute (`<a class="case" data-case="1">`).
- **The page list lives only in `YEARS` in `src/data/shindanshi.ts`.** It renders, at build time, the left sidebar (`components/shindanshi/Sidebar.astro`), the prev/next `.case-nav` (`CaseNav.astro`; it only links cases within the same year, since its labels carry no year) and the hub's year headings and cards (`title`, `note`, `tags`). Each case's sidebar TOC is the `toc` array there — keep it in sync with the page's `<section id>`s. The current page's TOC is highlighted on scroll; below 980px only the current page's TOC is shown, and the hub hides the sidebar because its cards already list the cases.
- **Page bodies are plain HTML inside `.astro`.** Astro reads `{` `}` as expressions, so write a literal brace as `{'{'}`. Inline SVG is fine, but self-closing tags come out as open/close pairs (`<line></line>`), which browsers treat the same.
- Charts and diagrams are inline SVG inside `<figure class="fig">` (caption, then a `.fig-legend` list, then the SVG in `.fig-scroll`). Color marks only through the `fig-c0`〜`fig-c3` / `fig-l1`〜`fig-l3` / `fig-dot*` classes, never literal colors, so dark mode works: `--fig-1`〜`--fig-3` are a palette checked for color-vision deficiency in both light and dark, `--fig-0` is the gray for "other". Labels use the text classes (`fig-cat`, `fig-val`, `fig-tick`, `fig-note`). First used in `r03-jirei4.astro`.
- Each answer example (`.ans-text`) shows its length in `.count` as `N／上限字`. Recount when editing an answer — every character, including punctuation, is one square on the answer sheet. 事例Ⅳ's numeric answers have no `.count`; its calculation steps go in `<pre class="calc">`, and numeric table cells use `class="num"`.
- Answers are original study examples, not official model answers. 設問 text is paraphrased (要旨), with links to the official 問題PDF and 出題の趣旨. Prep-school comparisons carry the date they were checked against the published sources.
- "答案例を隠して解く" toggles `body.practice`; the state is kept in `localStorage` key `shindanshi-2ji-practice-v1`. Print always shows the answers.
- Adding a case means: copy an existing case page (change `page`, `title`, `description` and the hero; add a `[data-case]` color block to `style.css` if it's a new number) and add an entry to `YEARS` in `src/data/shindanshi.ts`. The sidebar, prev/next links and hub card follow from the data, head tags from the props, and the sitemap entry from the file itself.

## Icon policy

Two sources, kept at the repo root (not published): `icon.svg` (the dark neon background, pure vector, same palette as `og-image.svg`) and `icon-glyph.png` (the 🧤 glyph, background already cut to transparent). Everything else is generated — don't hand-edit `apple-touch-icon.png`, `android-chrome-*.png`, `icon-maskable-512x512.png`, or `favicon.ico`.

- **Home-screen icons must be opaque.** iOS composites alpha onto black and Android onto white, so the generated PNGs are flattened onto `#08060f`.
- **`icon-maskable-512x512.png` carries a smaller glyph** so it survives Android's adaptive-icon crop (safe zone is the inner 80% circle). It's declared `"purpose": "maskable"` in `site.webmanifest`, separate from the `"any"` entries.
- **`favicon.svg` stays the transparent emoji SVG** — it's the browser-tab icon and should sit on the tab bar without a dark box. `favicon.ico` is the fallback for browsers without SVG favicon support.
- **`cram/` and `shindanshi-2ji/` use their own book icon** in the tab and on the top page's cards. Its source is `public/link-icons/study.svg` (hand-drawn vector, used as is for the SVG favicon and the card). `Head.astro` switches the three icon links with `icon="study"`, which `CramSheet.astro`, `Shindanshi.astro` and `cram/index.astro` pass. Regenerate the other two after editing the SVG:
  ```bash
  rsvg-convert -w 256 -h 256 public/link-icons/study.svg -o /tmp/study256.png
  magick /tmp/study256.png -define icon:auto-resize=48,32,16 public/study-favicon.ico
  rsvg-convert -w 180 -h 180 public/link-icons/study.svg | magick - -background "#2c4f96" -flatten -strip public/study-apple-touch-icon.png
  ```
- `index.html` and `privacy.html` get the full head block (icons + manifest + `apple-mobile-web-app-*`) from `src/layouts/Root.astro`, so they stay in sync.

## Head and sitemap

- **Every page carries canonical, favicon, OGP and Twitter Card tags,** all written by `src/components/Head.astro` from the layout's `title` / `description` / `path` props: canonical, the three icon links (the site's 🧤, or the book with `icon="study"`), `og:*` and `twitter:card` (X falls back to `og:*`, so there are no other `twitter:*` tags). `og:title` / `og:description` / `og:url` repeat the title, description and canonical. Hubs, the top page and privacy use `og:type` `website`; sheets and cases use `article`. Only `Root.astro` adds manifest and `theme-color`, since those belong to the dark root site. All pages share `og-image.png`.
- **Canonical URLs:** directory index pages end in `/` (`/cram/`, `/shindanshi-2ji/`), every other page keeps `.html`, matching the internal links.
- **`sitemap.xml` is generated** by `src/pages/sitemap.xml.ts` from every `.astro` file under `src/pages/` — a new page is listed automatically. `lastmod` is the date of the last commit that changed the page's source file (renames are followed), plus its card data for the hubs (`src/data/cram.ts`, `shindanshi.ts`) and the top page (`links.ts`, and the newest blog post's date). Commits whose subject starts with `refactor:` `build:` `chore:` `docs:` `ci:` or `style:` don't count, and neither do the hashes in `IGNORED_COMMITS`, **so use one of those prefixes for changes that leave the page content as it was** (markup restructuring, head tags, tooling); use `feat:` / `fix:` for content. The build fails rather than guess if git history is shallow or a page has no content commit. `robots.txt` lists the sitemap next to the blog's `sitemap-index.xml`, which the blog Worker serves.

## OGP image policy

`og-image.svg` (repo root, not published) is the source; `public/og-image.png` is generated from it. Keep the OGP image **content-agnostic** — only durable elements (site name, URL, decoration). Do **not** bake in self-intro lines, tech stack, or works lists, because those change frequently on the top page and would otherwise force a regeneration on every edit.
