/* ブログの最新記事を、ビルド時に RSS から取る。
   トップページの .posts に、クローラーが辿れる <a href> として書き込むため（JS で取ると最初の HTML に入らない）。
   取れなかったときは例外を投げてビルドを止める。デプロイされないので、公開中の版がそのまま残る。 */

const FEED = 'https://tebukuro.me/blog/rss.xml';

export interface Post {
  /** サイト内のパス（/blog/articles/.../） */
  path: string;
  /** YYYY.MM.DD（日本時間） */
  date: string;
  title: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

const text = (item: string, tag: string) => {
  const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) throw new Error(`RSS の <item> に <${tag}> がない`);
  const raw = m[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  if (cdata) return cdata[1];
  return raw.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, e: string) => {
    if (e[0] === '#')
      return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTITIES[e] ?? all;
  });
};

const ymd = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

async function fetchFeed(): Promise<string> {
  let error: unknown;
  // 一時的な失敗で日次ビルドが落ちないよう、2 回まで試す
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(FEED, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      error = e;
    }
  }
  throw new Error(`${FEED} を取得できない`, { cause: error });
}

let cache: Promise<Post[]> | undefined;

export function getLatestPosts(count = 3): Promise<Post[]> {
  cache ??= fetchFeed().then(xml =>
    [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map(([, item]) => {
        const url = new URL(text(item, 'link'));
        if (url.origin !== 'https://tebukuro.me' || !url.pathname.startsWith('/blog/')) {
          throw new Error(`RSS の記事 URL が想定外: ${url}`);
        }
        const published = new Date(text(item, 'pubDate'));
        if (Number.isNaN(published.getTime())) throw new Error(`RSS の pubDate が読めない: ${url}`);
        return { path: url.pathname, published, title: text(item, 'title') };
      })
      .sort((a, b) => b.published.getTime() - a.published.getTime())
      .map(({ path, published, title }) => ({ path, title, date: ymd.format(published).replaceAll('/', '.') })),
  );
  return cache.then(posts => {
    if (posts.length < count) throw new Error(`RSS の記事が ${posts.length} 件しかない`);
    return posts.slice(0, count);
  });
}
