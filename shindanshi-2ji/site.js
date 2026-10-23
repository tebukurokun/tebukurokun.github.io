/* 2次試験 過去問解説の共通スクリプト。
   サイドバーのページ一覧と、事例ページ末尾の前後ナビは YEARS から組み立てる。
   事例を追加・変更したら YEARS を直す（目次ページのカードは index.html に別途書く）。 */
(() => {
  const YEARS = [
    {
      label: '令和6年度（2024）',
      cases: [
        {
          page: 'r06-jirei1', no: '事例Ⅰ', name: '組織・人事',
          toc: [['overview', '概要'], ['q1', '第1問'], ['q2', '第2問'], ['q3', '第3問'], ['q4-1', '第4問(1)'], ['q4-2', '第4問(2)'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
        {
          page: 'r06-jirei2', no: '事例Ⅱ', name: 'マーケティング・流通',
          toc: [['overview', '概要'], ['q1', '第1問'], ['q2', '第2問'], ['q3', '第3問'], ['q4', '第4問'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
        {
          page: 'r06-jirei3', no: '事例Ⅲ', name: '生産・技術',
          toc: [['overview', '概要'], ['q1', '第1問'], ['q2', '第2問'], ['q3', '第3問'], ['q4', '第4問'], ['q5', '第5問'], ['flow', '設問のつながり'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
        { page: null, no: '事例Ⅳ', name: '財務・会計' },
      ],
    },
    {
      label: '令和4年度（2022）',
      cases: [
        {
          page: 'r04-jirei1', no: '事例Ⅰ', name: '組織・人事',
          toc: [['overview', '概要'], ['q1', '第1問'], ['q2', '第2問'], ['q3', '第3問'], ['q4-1', '第4問(1)'], ['q4-2', '第4問(2)'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
        {
          page: 'r04-jirei2', no: '事例Ⅱ', name: 'マーケティング・流通',
          toc: [['overview', '概要'], ['q1', '第1問'], ['q2', '第2問'], ['q3', '第3問'], ['q4', '第4問'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
        {
          page: 'r04-jirei3', no: '事例Ⅲ', name: '生産・技術',
          toc: [['overview', '概要'], ['process', '工程の全体像'], ['q1', '第1問'], ['q2', '第2問'], ['q3', '第3問'], ['q4', '第4問'], ['q5', '第5問'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
        {
          page: 'r04-jirei4', no: '事例Ⅳ', name: '財務・会計',
          toc: [['overview', '概要'], ['q1', '第1問'], ['q2', '第2問'], ['q3-1', '第3問(1)'], ['q3-2', '第3問(2)'], ['q3-3', '第3問(3)'], ['q4', '第4問'], ['compare', '予備校比較'], ['points', '学習ポイント'], ['sources', '出典']],
        },
      ],
    },
  ];

  const current = document.body.dataset.page;

  // サイドバー
  const side = document.querySelector('.side');
  if (side) {
    const hubCurrent = current === 'hub' ? ' aria-current="page"' : '';
    let html = `<a class="side-home" href="./"${hubCurrent}>中小企業診断士2次試験<br>過去問解説</a>`;
    for (const year of YEARS) {
      html += `<p class="side-year">${year.label}</p><ul class="side-cases">`;
      for (const c of year.cases) {
        if (!c.page) {
          html += `<li><span class="side-case soon"><small>${c.no}</small>${c.name}（準備中）</span></li>`;
          continue;
        }
        const here = c.page === current;
        const toc = c.toc.map(([id, label]) =>
          `<li><a href="${here ? '' : c.page + '.html'}#${id}">${label}</a></li>`).join('');
        html += `<li><a class="side-case" href="${c.page}.html"${here ? ' aria-current="page"' : ''}><small>${c.no}</small>${c.name}</a>`
          + `<ul class="side-toc${here ? ' is-current' : ''}">${toc}</ul></li>`;
      }
      html += '</ul>';
    }
    side.innerHTML = html;
  }

  // 事例ページ末尾の前後ナビ（同じ年度の中だけでたどる。ラベルに年度を出さないため）
  const nav = document.querySelector('.case-nav');
  if (nav) {
    const all = (YEARS.find(y => y.cases.some(c => c.page === current)) || { cases: [] }).cases;
    const i = all.findIndex(c => c.page === current);
    const cell = (c, dir) => {
      const head = dir === 'prev' ? '← 前の事例' : '次の事例 →';
      if (!c) return `<span><small>${dir === 'prev' ? '前の事例' : '次の事例'}</small>—</span>`;
      if (!c.page) return `<span><small>${dir === 'prev' ? '前の事例' : '次の事例'}</small>${c.no}（${c.name}）は準備中</span>`;
      return `<a href="${c.page}.html"><small>${head}</small><b>${c.no}</b> ${c.name}</a>`;
    };
    nav.innerHTML = cell(all[i - 1], 'prev') + cell(all[i + 1], 'next');
  }

  // 答案例を隠して解く
  const toggle = document.querySelector('.practice-toggle');
  if (toggle) {
    const key = 'shindanshi-2ji-practice-v1';
    const apply = on => {
      document.body.classList.toggle('practice', on);
      toggle.setAttribute('aria-pressed', String(on));
      if (!on) document.querySelectorAll('.answer.shown').forEach(a => a.classList.remove('shown'));
    };
    let saved = false;
    try { saved = localStorage.getItem(key) === '1'; } catch (_) {}
    apply(saved);
    toggle.addEventListener('click', () => {
      const on = !document.body.classList.contains('practice');
      apply(on);
      try { localStorage.setItem(key, on ? '1' : '0'); } catch (_) {}
    });
    document.querySelectorAll('.reveal').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.answer').classList.add('shown'));
    });
  }

  // サイドバーの目次で、いま読んでいる節を強調する
  const links = [...document.querySelectorAll('.side-toc.is-current a')];
  if (links.length) {
    const targets = links.map(a => document.querySelector(a.getAttribute('href')));
    let ticking = false;
    const spy = () => {
      ticking = false;
      let active = links[0];
      targets.forEach((t, j) => { if (t && t.getBoundingClientRect().top <= 120) active = links[j]; });
      links.forEach(a => a.classList.toggle('active', a === active));
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(spy); }
    }, { passive: true });
    spy();
  }
})();
