/* sitemap.xml を src/pages の全ページから作る。ページを足せば自動で載る。
   lastmod は「そのページの元ファイルを最後に変えたコミット」の日付。ただし見た目を変えない
   コミット（件名が refactor: / build: / chore: / docs: / ci: / style: で始まるものと IGNORED_COMMITS）は数えない。
   目次ページとトップは、カードの元データ（src/data/）の変更も含める。トップは最新記事の日付も見る。
   git の履歴が要るので、Actions の checkout は fetch-depth: 0 にしている。 */

import { execFileSync } from 'node:child_process';
import type { APIRoute } from 'astro';
import { getLatestPosts } from '../lib/blog';

/** ページ本体以外に、内容に効くファイル */
const EXTRA: Record<string, string[]> = {
  '/': ['src/data/links.ts'],
  '/cram/': ['src/data/cram.ts'],
  '/shindanshi-2ji/': ['src/data/shindanshi.ts'],
};

/** 書き換えが大きく、git が名前の変更として追えないファイルの移行前のパス */
const RENAMED_FROM: Record<string, string> = {
  'src/pages/shindanshi-2ji/index.astro': 'public/shindanshi-2ji/index.html',
};

const NOT_CONTENT = /^(refactor|build|chore|docs|ci|style)(\(.+\))?:/;

/** 件名では見分けられないが、ページの内容を変えていないコミット */
const IGNORED_COMMITS = new Set([
  '64118d4c227e23d999c1399bc2863707d84fe92e', // 全ページに canonical・OGP を足しただけ
]);

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/** ファイルの内容が最後に変わった日（YYYY-MM-DD）。名前の変更もたどる */
function lastChanged(file: string): string | undefined {
  // --follow と --invert-grep は併用できないので、件名での除外はここでする
  return [file, RENAMED_FROM[file]]
    .filter(Boolean)
    .flatMap(f => git('log', '--follow', '--format=%cs %H %s', '--', f).split('\n'))
    .filter(Boolean)
    .map(line => line.split(' '))
    .filter(([, hash, ...subject]) => !IGNORED_COMMITS.has(hash) && !NOT_CONTENT.test(subject.join(' ')))
    .map(([date]) => date)
    .sort()
    .at(-1);
}

/** src/pages からの相対パス（./cram/index.astro）を URL のパスにする */
const toPath = (key: string) => {
  const p = key.slice(1).replace(/\.astro$/, '');
  return p.endsWith('/index') ? p.slice(0, -'index'.length) : `${p}.html`;
};

export const GET: APIRoute = async ({ site }) => {
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    throw new Error('sitemap の lastmod に git の全履歴が要る（checkout の fetch-depth: 0）');
  }
  const [newest] = await getLatestPosts(1);
  const urls = Object.keys(import.meta.glob('./**/*.astro'))
    .map(key => {
      const path = toPath(key);
      const dates = [`src/pages${key.slice(1)}`, ...(EXTRA[path] ?? [])].map(lastChanged);
      if (path === '/') dates.push(newest.date.replaceAll('.', '-'));
      const lastmod = dates.filter(Boolean).sort().at(-1);
      if (!lastmod) throw new Error(`${path} の lastmod を決められない（内容を変えたコミットがない）`);
      return { loc: new URL(path, site).href, lastmod };
    })
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const body = urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
