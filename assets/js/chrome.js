/* Table 全ページ共通 — メニュー・ヘッダー・文字の出方・手書き線・オプション選択（依存なし）
   トップ（top.js）と下層ページの両方で読み込む。動きの数値は illustrated-stage-site スキルの実測値。 */
(() => {
const E = {
  p1out:'cubic-bezier(.25,.46,.45,.94)',
  p2out:'cubic-bezier(.215,.61,.355,1)',
  p2in :'cubic-bezier(.55,.055,.675,.19)',
  back2: CSS.supports('transition-timing-function','linear(0, 1)')
    ? 'linear(0, 0.121, 0.233, 0.337, 0.433, 0.521, 0.603, 0.677, 0.744, 0.805, 0.859, 0.908, 0.951, 0.989, 1.021, 1.049, 1.072, 1.091, 1.106, 1.117, 1.125, 1.13, 1.132, 1.131, 1.128, 1.123, 1.116, 1.108, 1.099, 1.089, 1.078, 1.067, 1.056, 1.045, 1.035, 1.025, 1.017, 1.01, 1.005, 1.001, 1)'
    : 'cubic-bezier(.34,1.8,.5,1)'
};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAN_HOVER = matchMedia('(hover:hover) and (pointer:fine)').matches;
const IS_TOP = document.body.classList.contains('top');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* 現在値から目標値へ（途中で逆方向に切り替えても飛ばない） */
function tween(el, to, {duration = 600, easing = E.p2out, delay = 0} = {}){
  if (RM){ Object.assign(el.style, to); return null; }
  const cs = getComputedStyle(el), from = {};
  for (const k in to) from[k] = cs[k];
  el.getAnimations().forEach(a => a.cancel());
  Object.assign(el.style, to);
  return el.animate([from, to], {duration, easing, delay, fill:'backwards'});
}
const stagger = (els, to, opt, step) => [...els].map((el, i) => tween(el, to, {...opt, delay:(opt.delay || 0) + i * step}));

/* ---- MENU：左上・右上の円ワイプ＋項目スタッガー＋背景の漂流 ---- */
const hd = $('#hd'), trigger = $('#trigger'), navi = $('#navi');
if (hd && trigger && navi){
  const items = $$('.mainnavi li, .subnavi li', navi);
  let open = false, openTimer;
  const setCircleOrigin = () => navi.style.setProperty('--r', Math.ceil(Math.hypot(innerWidth / 2, innerHeight) + 24) + 'px');
  const bgs = {}; $$('.navi-bg svg', navi).forEach(s => bgs[s.dataset.bg] = s);
  const showBg = (key) => {
    const el = bgs[key]; if (!el) return;
    if (RM){ el.style.opacity = 1; el.style.translate = '0 -50%'; return; }
    el.getAnimations().forEach(a => a.cancel());
    el.animate([
      {translate:'300px -50%', opacity:0, easing:E.p2out},
      {offset:.9 / 10.8, translate:'0px -50%', opacity:1, easing:E.p1out},
      {translate:'-100px -50%', opacity:1}
    ], {duration:10800, fill:'forwards'});
  };
  const hideBg = (all, key) => (all ? Object.values(bgs) : [bgs[key]]).forEach(el => { if (!el) return;
    const a = tween(el, {translate:'-100px -50%', opacity:'0'}, {duration:600, easing:E.p2in});
    if (a) a.finished.then(() => { el.style.translate = '300px -50%'; }).catch(() => {});
  });
  const openMenu = () => {
    open = true; setCircleOrigin();
    navi.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-label', 'メニューを閉じる');
    clearTimeout(openTimer);
    openTimer = setTimeout(() => {
      hd.classList.add('is-open'); trigger.classList.add('is-open');
      stagger(items, {translate:'0px 0px', opacity:'1'}, {duration:700, easing:E.p2out}, 50);
    }, RM ? 0 : 320);
    document.documentElement.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    open = false; clearTimeout(openTimer);
    navi.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-label', 'メニューを開く');
    const anims = stagger(items, {translate:'-100px 0px', opacity:'0'}, {duration:600, easing:E.p2in}, 50);
    const last = anims[anims.length - 1];
    const reset = () => { if (!open) items.forEach(li => li.style.translate = '300px 0px'); };
    last ? last.finished.then(reset).catch(() => {}) : reset();
    hideBg(true);
    setTimeout(() => { hd.classList.remove('is-open'); trigger.classList.remove('is-open'); }, RM ? 0 : 500);
    document.documentElement.style.overflow = '';
  };
  trigger.addEventListener('click', e => { e.stopPropagation(); open ? closeMenu() : openMenu(); });
  $$('a', navi).forEach(a => a.addEventListener('click', () => open && closeMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeMenu(); });
  addEventListener('resize', () => open && setCircleOrigin());
  if (CAN_HOVER) $$('.mainnavi a', navi).forEach(a => {
    a.addEventListener('mouseenter', () => showBg(a.dataset.bg));
    a.addEventListener('mouseleave', () => hideBg(false, a.dataset.bg));
  });
  // 今いるページのメニュー項目に印
  $$('a', navi).forEach(a => { if (a.getAttribute('href') !== '/' && location.pathname.startsWith(a.getAttribute('href'))) a.setAttribute('aria-current', 'page'); });

  /* ---- ヘッダー：本文に入ったら白地。下層ページは読み込み時に上から降りてくる ---- */
  const onScrollHd = () => hd.classList.toggle('is-solid', scrollY > (IS_TOP ? innerHeight - 120 : 24));
  addEventListener('scroll', onScrollHd, {passive:true}); onScrollHd();
  if (!IS_TOP) tween(hd, {translate:'0px 0px'}, {duration:900, easing:E.p2out, delay:100});
}

/* ---- 大きな英字見出し：1文字ずつ横に回りながら入る（下層ページの見出し） ---- */
$$('[data-chars]').forEach(el => {
  const t = el.textContent.trim(); el.textContent = ''; el.setAttribute('aria-label', t);
  // 単語ごとにまとめて、単語の途中では折り返さない
  t.split(/\s+/).forEach((word, wi) => {
    if (wi) el.append(' ');
    const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
    for (const c of word){
      const o = document.createElement('span'); o.className = 'ch';
      const i = document.createElement('span'); i.className = 'ch-in'; i.textContent = c;
      o.append(i); w.append(o);
    }
    el.append(w);
  });
  const go = () => {
    stagger($$('.ch', el), {translate:'0px 0px', opacity:'1'}, {duration:800, easing:E.p2out, delay:250}, 50);
    stagger($$('.ch-in', el), {rotate:'y 0deg', translate:'0px 0px 0px'}, {duration:1200, easing:E.back2, delay:250}, 50);
  };
  if (RM) go();
  else new IntersectionObserver((es, o) => { if (es[0].isIntersecting){ o.disconnect(); go(); } }).observe(el);
});

/* ---- スクロール：ボタンなど .js-show は右から入る ---- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  tween(e.target, {translate:'0px 0px', opacity:'1'}, {duration:700, easing:E.p2out});
  io.unobserve(e.target);
}), {rootMargin:'0px 0px -8% 0px'});
$$('.js-show, .c-btn').forEach(el => { if (!el.closest('.contact')){ el.classList.add('js-show'); io.observe(el); } });

/* ---- 手書き風の強調線：言葉の下に手描きの線を2本引く ---- */
{
  const hls = $$('.hl');
  hls.forEach((el, i) => {
    const w = [[3, 12, 60, 7, 120, 14, 197, 9], [8, 16, 70, 12, 140, 18, 192, 13]];
    const j = (k) => +(Math.sin(i * 7.3 + k) * 2).toFixed(1);   // 1つずつ少し形を変える
    el.insertAdjacentHTML('beforeend', `<svg class="hl__line" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M${w[0][0]} ${w[0][1] + j(1)}C${w[0][2]} ${w[0][3] + j(2)},${w[0][4]} ${w[0][5] + j(3)},${w[0][6]} ${w[0][7] + j(4)}"/><path pathLength="1" d="M${w[1][0]} ${w[1][1] + j(5)}C${w[1][2]} ${w[1][3] + j(6)},${w[1][4]} ${w[1][5] + j(7)},${w[1][6]} ${w[1][7] + j(8)}"/></svg>`);
  });
  if (RM) hls.forEach(el => el.classList.add('is-drawn'));
  else {
    const hio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('is-drawn'); hio.unobserve(e.target); } }), {threshold:1, rootMargin:'0px 0px -12% 0px'});
    hls.forEach(el => hio.observe(el));
  }
}

/* ---- OPTIONS：クリックで選ぶ（価格は出さない） ---- */
$$('[data-picker]').forEach(picker => {
  const sum = $('[data-pick-sum]', picker), cta = $('[data-pick-cta]', picker);
  const update = () => {
    const plan = $('input[name="pick-plan"]:checked', picker);
    const inc = plan.dataset.inc, planName = $('b', plan.nextElementSibling).textContent;
    const added = [], included = [];
    $$('.pick__o', picker).forEach(lab => {
      const cb = $('input', lab), idx = cb.dataset.incIdx;
      const isInc = idx !== undefined && inc.charAt(+idx) === '1';
      lab.classList.toggle('is-inc', isInc);
      cb.disabled = isInc;
      if (isInc) cb.checked = false;
      lab.classList.toggle('is-on', !isInc && cb.checked);
      $('[data-s]', lab).textContent = isInc ? 'プランに含む' : cb.checked ? '追加する' : '';
      if (isInc) included.push(cb.dataset.name);
      else if (cb.checked) added.push(cb.dataset.name);
    });
    sum.innerHTML = `<b>${planName}</b>を選択中。` +
      (included.length ? `プランに含まれるもの：${included.join('・')}。` : 'デリバリー連携・Googleマップ・スマホ最適化などの基本機能を含みます。') +
      (added.length ? `<br>追加するオプション：<b>${added.join('・')}</b>` : '');
    const q = new URLSearchParams({plan: plan.value});
    if (added.length) q.set('options', added.join('|'));
    cta.href = '/contact/?' + q.toString();
  };
  picker.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.exclusive && t.checked) $$(`[data-exclusive="${t.dataset.exclusive}"]`, picker).forEach(x => { if (x !== t) x.checked = false; });
    update();
  });
  update();
});

/* ---- 下層ページの見出し：トップKVと同じ雲をゆっくり流す ---- */
{
  const cloud = '<svg viewBox="0 0 120 50" aria-hidden="true"><path d="M14 44c-10 0-12-14-2-16-2-12 14-18 22-9 4-12 24-14 30-2 8-8 24-2 22 10 12 0 14 17 2 17z" fill="#fff" stroke="var(--line)" stroke-width="2" stroke-linejoin="round"/></svg>';
  $$('.sh').forEach(sh => sh.insertAdjacentHTML('afterbegin',
    `<div class="sh__sky" aria-hidden="true"><span class="sh__cloud drift" style="animation-duration:70s;animation-delay:-20s">${cloud}</span><span class="sh__cloud drift" style="animation-duration:88s;animation-delay:-60s">${cloud}</span><span class="sh__cloud drift" style="animation-duration:104s;animation-delay:-8s">${cloud}</span></div>`));
}

/* ---- 下層ページ見出しのイラスト：画面外ではループを止める ---- */
$$('.sh__ill svg, .sh__ill2 svg').forEach(svg => {
  if (RM){ svg.pauseAnimations?.(); return; }
  new IntersectionObserver(([e]) => e.isIntersecting ? svg.unpauseAnimations?.() : svg.pauseAnimations?.()).observe(svg);
});

// 戻るボタン（bfcache）で戻ったときにメニューが開いたままにならないように
addEventListener('pageshow', e => { if (e.persisted && navi?.classList.contains('is-open')) trigger.click(); });
})();
