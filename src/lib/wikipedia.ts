/* Wikipedia 日本語版の「選り抜き記事」（メインページに日替わりで出る記事）を、ビルド時に取る。
   記事は Template:秀逸スケジュール が日本時間の 0 時に切り替えるので、日付も日本時間で決める。
   トップページの飾りなので、取れなくてもビルドは止めず、null を返してウィジェットごと出さない。 */

const API = 'https://api.wikimedia.org/feed/v1/wikipedia/ja/featured';
// Wikimedia の API は、連絡先の分かる User-Agent を求めている
const USER_AGENT = 'tebukuro.me-build (https://tebukuro.me/)';

export interface WikiArticle {
  title: string;
  /** 冒頭の要約（プレーンテキスト） */
  extract: string;
  /** ja.wikipedia.org の記事 URL */
  url: string;
  thumbnail?: { src: string; width: number; height: number };
}

interface Feed {
  tfa?: {
    titles?: { normalized?: string };
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    thumbnail?: { source?: string; width?: number; height?: number };
  };
}

const jstParts = (now: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return { y: get('year'), m: get('month'), d: get('day') };
};

async function fetchFeed(url: string): Promise<Feed> {
  let error: unknown;
  // 一時的な失敗で毎日の分が抜けないよう、2 回まで試す
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Feed;
    } catch (e) {
      error = e;
    }
  }
  throw error;
}

const isHttpsOn = (raw: string | undefined, ok: (host: string) => boolean) => {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && ok(u.hostname);
  } catch {
    return false;
  }
};

let cache: Promise<WikiArticle | null> | undefined;

export function getFeaturedArticle(): Promise<WikiArticle | null> {
  cache ??= (async () => {
    const { y, m, d } = jstParts(new Date());
    const url = `${API}/${y}/${m}/${d}`;
    try {
      const tfa = (await fetchFeed(url)).tfa;
      const title = tfa?.titles?.normalized ?? tfa?.title;
      const extract = tfa?.extract?.trim();
      const page = tfa?.content_urls?.desktop?.page;
      if (!title || !extract || !isHttpsOn(page, h => h === 'ja.wikipedia.org')) {
        throw new Error('tfa の title / extract / URL がない');
      }
      const t = tfa?.thumbnail;
      const thumbnail =
        t?.width && t.height && isHttpsOn(t.source, h => h.endsWith('.wikimedia.org'))
          ? { src: t.source as string, width: t.width, height: t.height }
          : undefined;
      return { title, extract, url: page as string, thumbnail };
    } catch (e) {
      console.warn(`[wikipedia] ${url} を取得できないので、ウィジェットを出さない:`, e);
      return null;
    }
  })();
  return cache;
}
