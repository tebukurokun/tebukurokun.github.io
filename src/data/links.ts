/* トップページのリンクカード。Links（作ったもの）と Neighbors（相互リンクなど）。
   カードの並び順がそのまま表示順になり、出現アニメーションの遅延もこの順で決まる。
   icon は public/link-icons/ のファイル名（サイトの favicon のローカルコピー）。持たないサイトは省く。 */

export interface LinkCard {
  href: string;
  /** カード上部の小さなラベル（英大文字） */
  label: string;
  title: string;
  desc: string;
  icon?: string;
}

/** Links：作ったもの */
export const WORKS: LinkCard[] = [
  {
    href: 'https://hyakumeiten-map.tebukuro.me/',
    label: 'MAP',
    title: '百名店マップ',
    icon: 'hyakumeiten-map.png',
    desc: '食べログ百名店の情報をマップで見ることができるサイト。',
  },
  {
    href: 'https://wordle-hint.tebukuro.me/',
    label: 'GAME',
    title: 'wordle hint',
    icon: 'wordle-hint.svg',
    desc: '5文字の英単語を推測するパズルゲーム "wordle" のヒントを出してくれるサイト。',
  },
  {
    href: 'https://art-memory-game.tebukuro.me/',
    label: 'GAME',
    title: '絵画神経衰弱ゲーム',
    icon: 'art-memory-game.svg',
    desc: '同じ作者の絵画でペアを作る神経衰弱。',
  },
  {
    href: 'https://tebukurokun.github.io/alert-loop/',
    label: 'JOKE',
    title: '無限アラートループ',
    desc: 'アラートが無限に出るので閲覧注意。',
  },
  {
    href: 'https://github.com/tebukurokun/rj-link-converter',
    label: 'EXTENSION',
    title: 'DLsite Link Converter',
    icon: 'rj-link-converter.svg',
    desc: 'ページ内のDLsite作品番号を自動検出し、作品ページへのリンクに変換するChrome/Firefox拡張機能。',
  },
  {
    href: 'https://github.com/tebukurokun/amazon-url-minimizer',
    label: 'EXTENSION',
    title: 'Amazon URL Minimizer',
    icon: 'amazon-url-minimizer.svg',
    desc: 'Amazonの長い商品URLを最小形にし、右クリックからコピーできるChrome拡張機能。',
  },
  {
    href: 'https://nosh-log.tebukuro.me/',
    label: 'LIFE',
    title: 'nosh log',
    icon: 'nosh-log.svg',
    desc: 'noshのメニューに自分の評価・コメントを記録できるツール。',
  },
  {
    href: 'https://uranai.tebukuro.me/',
    label: 'FORTUNE',
    title: '運命観測所',
    icon: 'uranai.png',
    desc: 'あなただけの運勢を鑑定する占いサイト。',
  },
  {
    href: '/cram/',
    label: 'STUDY',
    title: '資格試験 一夜漬けシート',
    icon: 'study.svg',
    desc: '中小企業診断士1次・2次試験、統計検定2級の直前チェックシート集。',
  },
  {
    href: '/shindanshi-2ji/',
    label: 'STUDY',
    title: '診断士2次試験 過去問解説',
    icon: 'study.svg',
    desc: '中小企業診断士2次試験の過去問を事例ごとに解説。',
  },
  {
    href: 'https://harmonic-bench.tebukuro.me/',
    label: 'MUSIC',
    title: 'Harmonic Bench',
    icon: 'harmonic-bench.svg',
    desc: '鍵盤で音を鳴らしながら、和音名・周波数・音程を確かめられる音楽理論の実験アプリ。',
  },
  {
    href: 'http://vigo56of62tvv2tkkqu5rtarkwsyrd4kkj267ijkouh7wjftk2h25oid.onion/',
    label: 'ONION',
    title: 'onionてぶくろ',
    desc: '.onion サイト。',
  },
];

/** Neighbors：相互リンクなど */
export const NEIGHBORS: LinkCard[] = [
  {
    href: 'https://taisa.site/',
    label: 'TAISA',
    title: 'Bibliotheca Pan Magica',
    icon: 'taisa.png',
    desc: '大佐さんの個人サイト。',
  },
  {
    href: 'https://scn-adm1n.f5.si/',
    label: 'PREHAX',
    title: "prehax's Homepage",
    desc: 'prehaxさんの個人サイト。',
  },
  {
    href: 'https://avrop50.hatenablog.com/',
    label: 'AVROP50',
    title: 'avrop50’s diary',
    icon: 'avrop50.png',
    desc: 'avrop50さんのブログ。',
  },
  {
    href: 'https://akkun.pages.dev/',
    label: 'AKKUN',
    title: 'Akkun1919の部屋',
    icon: 'akkun.png',
    desc: 'Akkun1919さんの個人サイト。',
  },
  {
    href: 'https://moromingo.com/',
    label: 'GENGHIS',
    title: 'moromingo',
    icon: 'moromingo.png',
    desc: '諸見謝ジェンジスさんの個人サイト。',
  },
  {
    href: 'https://dandango.pw/archive/',
    label: 'MACLAURIN',
    title: "Maclaurin's Archive",
    desc: 'Maclaurinさんの個人サイト。',
  },
  {
    href: 'https://riviella.uk/',
    label: 'RIVIELLA',
    title: '小さな寄り道',
    desc: 'Riviellaさんの個人サイト。',
  },
];
