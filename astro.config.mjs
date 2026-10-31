import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tebukuro.me',
  output: 'static',
  build: {
    // src/pages の構成どおりに出力する。`cram/index.astro` → `cram/index.html`、
    // `cram/keiei_houmu.astro` → `cram/keiei_houmu.html`。
    // 'file' だと `/cram/` が `cram.html` に、'directory' だと `.html` の URL が
    // `keiei_houmu/` に変わり、公開中の URL が壊れる。
    format: 'preserve',
  },
  // `.html` 付きの URL と `/cram/` のようなディレクトリ URL が混在するため。
  trailingSlash: 'ignore',
  // 移行前の HTML と差分を取りやすくするため、空白の圧縮はしない。
  // <pre class="calc"> の改行や .count の字数にも影響させない。
  compressHTML: false,
});
