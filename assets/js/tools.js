/* Table 触って試すコラムの道具（依存なし）
   - [data-deli-calc]  デリバリーで赤字にならない値段の計算機
   - [data-challenge]  「お客さんになって、営業時間を探してみて」30秒チャレンジ */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const yen = (n) => (n < 0 ? '−¥' : '¥') + Math.round(Math.abs(n)).toLocaleString('ja-JP');

/* ================= デリバリー価格計算機 ================= */
$$('[data-deli-calc]').forEach(root => {
  const inp = (k) => $(`[data-in="${k}"]`, root), out = (k) => $(`[data-out="${k}"]`, root);
  let fee = 0.30;
  // 数値を表示するときは、前の値から0.5秒かけて数え上げる
  const shown = new Map();
  const put = (el, v, fmt = yen) => {
    const from = shown.has(el) ? shown.get(el) : v; shown.set(el, v);
    if (RM || from === v){ el.textContent = fmt(v); return; }
    const t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(from + (v - from) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const num = (k) => Math.max(0, +inp(k).value || 0);
  const sync = (k) => { const r = $(`[data-range="${k}"]`, root); if (r){ r.value = inp(k).value; r.style.setProperty('--pct', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); } };
  const update = () => {
    const price = num('price'), cost = num('cost'), box = num('box'), orders = num('orders');
    const tr = $('[data-range="target"]', root); if (tr) tr.max = Math.max(0, price - cost);
    const target = Math.min(num('target'), Math.max(0, price - cost));
    ['price', 'cost', 'box', 'orders', 'target'].forEach(sync);
    // 1. 店内と同じ値段で出したときの1品の利益
    const profit = price - cost - box - price * fee;
    put(out('profit'), profit);
    out('profit').classList.toggle('is-minus', profit < 0);
    out('rate').textContent = price ? `利益率 ${Math.round(profit / price * 100)}%` : '';
    // 2. 1品で残したい利益から逆算したデリバリー価格（10円単位で切り上げ）
    const need = fee >= 1 ? 0 : Math.ceil((target + cost + box) / (1 - fee) / 10) * 10;
    put(out('need'), need);
    out('needDiff').textContent = price ? (need > price ? `店内より ${yen(need - price)} 高く` : need < price ? `店内より ${yen(price - need)} 安くても大丈夫` : '店内と同じ値段') : '';
    out('same').textContent = yen(Math.ceil((price + box) / (1 - fee) / 10) * 10);   // 店内と同じ利益（価格−原価）を残す値段
    // 3. 手数料ごとの1品の利益（店内と同じ値段で出した場合）
    const rows = [0.30, 0.15, 0].map(f => price - cost - box - price * f);
    const max = Math.max(1, ...rows.map(Math.abs));
    $$('[data-bar]', root).forEach((b, i) => {
      b.style.width = Math.max(2, Math.abs(rows[i]) / max * 100) + '%';
      b.classList.toggle('is-minus', rows[i] < 0);
      put($(`[data-barv="${i}"]`, root), rows[i]);
    });
    // 4. 特典期間に通常（30%）より多く残る額（1日の注文数 × 30日 × 期間）
    const perMonth = (f) => price * (0.30 - f) * orders * 30;
    put(out('keep0'), perMonth(0) * 3);
    put(out('keep15'), perMonth(0.15) * 6);
    out('target').textContent = yen(target);
  };
  // 数値入力とスライダーを連動
  $$('[data-in]', root).forEach(i => i.addEventListener('input', update));
  $$('[data-range]', root).forEach(r => r.addEventListener('input', () => { inp(r.dataset.range).value = r.value; update(); }));
  $$('[data-fee]', root).forEach(b => b.addEventListener('click', () => {
    fee = +b.dataset.fee;
    $$('[data-fee]', root).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    update();
  }));
  update();
});

/* ================= 30秒チャレンジ ================= */
$$('[data-challenge]').forEach(root => {
  const rounds = $$('[data-round]', root), result = $('[data-result]', root);
  const times = [];
  const LIMIT = 30;
  rounds.forEach((rd, idx) => {
    const phone = $('.chal__phone', rd), screen = $('.chal__screen', rd), clock = $('[data-clock]', rd), start = $('[data-start]', rd), give = $('[data-give]', rd), miss = $('[data-miss]', rd), next = $('[data-next]', rd);
    let t0 = 0, raf = 0, running = false, misses = 0;
    const show = (s) => { clock.textContent = s.toFixed(1); };
    const finish = (sec, found) => {
      running = false; cancelAnimationFrame(raf);
      times[idx] = {sec, found, misses};
      rd.classList.remove('is-run'); rd.classList.add('is-done', found ? 'is-found' : 'is-lost');
      show(sec);
      $('[data-msg]', rd).textContent = found ? `${sec.toFixed(1)}秒で見つかりました` + (misses ? `（ちがう所を${misses}回タップ）` : '') : '見つかりませんでした。答えはここです';
      const target = $('[data-target]', screen);
      target.classList.add('is-answer');
      if (!found) target.scrollIntoView({block:'center', behavior: RM ? 'auto' : 'smooth'});
      if (next) next.hidden = false;
      if (idx === rounds.length - 1) showResult();
    };
    const tick = () => {
      const sec = (performance.now() - t0) / 1000;
      show(Math.min(sec, LIMIT));
      if (sec >= LIMIT) return finish(LIMIT, false);
      raf = requestAnimationFrame(tick);
    };
    start.addEventListener('click', () => {
      rd.classList.add('is-run'); screen.scrollTop = 0; misses = 0; miss.textContent = '0';
      running = true; t0 = performance.now(); raf = requestAnimationFrame(tick);
      screen.focus({preventScroll:true});
    });
    give.addEventListener('click', () => running && finish((performance.now() - t0) / 1000, false));
    screen.addEventListener('click', e => {
      if (!running) return;
      e.preventDefault();
      if (e.target.closest('[data-target]')) return finish((performance.now() - t0) / 1000, true);
      misses++; miss.textContent = String(misses);
      phone.classList.remove('is-miss'); void phone.offsetWidth; phone.classList.add('is-miss');
    });
    // 見本の中のリンクやボタンで画面が動かないように
    screen.addEventListener('keydown', e => { if (running && (e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-target]')){ e.preventDefault(); finish((performance.now() - t0) / 1000, true); } });
    if (next) next.addEventListener('click', () => { const n = rounds[idx + 1]; n.hidden = false; n.scrollIntoView({block:'start', behavior: RM ? 'auto' : 'smooth'}); next.hidden = true; });
  });
  function showResult(){
    const [a, b] = times; if (!a || !b) return;
    result.hidden = false;
    $('[data-r="old"]', result).textContent = a.found ? a.sec.toFixed(1) + '秒' : '見つからず';
    $('[data-r="new"]', result).textContent = b.found ? b.sec.toFixed(1) + '秒' : '見つからず';
    $('[data-bar="old"]', result).style.width = Math.min(100, a.sec / LIMIT * 100) + '%';
    $('[data-bar="new"]', result).style.width = Math.max(2, Math.min(100, b.sec / LIMIT * 100)) + '%';
    const ratio = b.found && b.sec > 0 && a.found ? a.sec / b.sec : 0;
    $('[data-r="msg"]', result).textContent = !a.found
      ? '古いHPでは、30秒たっても営業時間が見つかりませんでした。お客さまなら、ここで別のお店を探し始めます。'
      : ratio >= 1.5 ? `新しいHPのほうが、約${ratio.toFixed(1)}倍早く見つかりました。来店を決める30秒のうち、探すだけで${a.sec.toFixed(0)}秒使っていたことになります。`
      : '今回はどちらも早く見つかりました。それでも、小さな文字や探す手間は、スマホの小さな画面ではお客さまの負担になります。';
    result.scrollIntoView({block:'nearest', behavior: RM ? 'auto' : 'smooth'});
  }
});
})();
