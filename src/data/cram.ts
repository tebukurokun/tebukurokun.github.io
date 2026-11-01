/* 一夜漬けシートの一覧。目次ページ（cram/index）のカードはここから作る。
   シートを追加したらここに 1 件足す。 */

export interface Sheet {
  /** ファイル名（拡張子なし）。src/pages/cram/<page>.astro */
  page: string;
  /** カードの色（cram/index の .green などのクラス） */
  accent: 'green' | 'blue' | 'teal' | 'orange';
  exam: string;
  title: string;
  note: string;
  tags: string[];
}

export const SHEETS: Sheet[] = [
  {
    page: 'chushokigyo_seisaku',
    accent: 'green',
    exam: '中小企業診断士 1次試験',
    title: '中小企業経営・中小企業政策',
    note: '最終チェックシート／60点狙い増補版。白書の数値は大小・増減・順位で押さえ、政策は「対象・作成者・認定者・支援内容」の4点セットで整理。全35セクション。',
    tags: ['中小企業者の定義', '白書の代表数値', '計画制度', '補助金・共済'],
  },
  {
    page: 'keiei_houmu',
    accent: 'blue',
    exam: '中小企業診断士 1次試験',
    title: '経営法務',
    note: '最終チェックシート／60点狙い増補版。法令基準日2026年5月1日で整理。会社法・知的財産権・契約・倒産処理まで、条文の要件を表で比較。全21セクション。',
    tags: ['会社法', '知的財産権', '契約・債権', '組織再編'],
  },
  {
    page: 'statistics_grade2',
    accent: 'teal',
    exam: '統計検定 2級',
    title: '学習ナビ＆解説シート',
    note: '出題範囲を「どの場面で、なぜ、その手法を選ぶか」の流れに再編。推測統計と線形モデルを厚めに。シート内検索と理解度チェック付き、全12セクション。',
    tags: ['確率分布', '推定・検定', '回帰', '分散分析'],
  },
  {
    page: 'shindanshi_2ji',
    accent: 'orange',
    exam: '中小企業診断士 2次試験',
    title: '事例I〜IV 解法プロセス＆知識シート',
    note: '令和8年度対応。80分のタイムマネジメント、与件文マーキング、設問解釈、解答骨子のテンプレ文型を前半に、事例I〜IVの必要知識を後半に。公式の「出題の趣旨」令和5〜7年度を読んで設問構成の型を整理。事例IVは式の意味と導出つきで厚めに。全13セクション。',
    tags: ['80分の型', '設問解釈', '事例別ナレッジ', '事例IV計算'],
  },
];
