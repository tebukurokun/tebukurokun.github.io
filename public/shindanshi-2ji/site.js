/* 2次試験 過去問解説の共通スクリプト。
   サイドバーと前後ナビは Astro がビルド時に HTML に書き出す（src/data/shindanshi.ts）。
   ここでは練習モードの切り替えと、サイドバーの目次の強調だけを行う。 */
(() => {
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
