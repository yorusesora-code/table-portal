/* Table トップ — illustrated-stage-site スキルの実装を移植（依存なし） */
(() => {
const E = {
  p1out:'cubic-bezier(.25,.46,.45,.94)',
  p2out:'cubic-bezier(.215,.61,.355,1)',
  p2in :'cubic-bezier(.55,.055,.675,.19)',
  sine :'cubic-bezier(.445,.05,.55,.95)',
  back2: CSS.supports('transition-timing-function','linear(0, 1)')
    ? 'linear(0, 0.121, 0.233, 0.337, 0.433, 0.521, 0.603, 0.677, 0.744, 0.805, 0.859, 0.908, 0.951, 0.989, 1.021, 1.049, 1.072, 1.091, 1.106, 1.117, 1.125, 1.13, 1.132, 1.131, 1.128, 1.123, 1.116, 1.108, 1.099, 1.089, 1.078, 1.067, 1.056, 1.045, 1.035, 1.025, 1.017, 1.01, 1.005, 1.001, 1)'
    : 'cubic-bezier(.34,1.8,.5,1)'
};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAN_HOVER = matchMedia('(hover:hover) and (pointer:fine)').matches;
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

/* 1文字 = 外側(.ch 位置/透明度) + 内側(.ch-in 回転) */
$$('[data-split]').forEach(el => {
  const t = el.textContent; el.textContent = ''; el.setAttribute('aria-label', t);
  for (const c of t){
    const o = document.createElement('span'); o.className = 'ch'; o.setAttribute('aria-hidden', 'true');
    const i = document.createElement('span'); i.className = 'ch-in'; i.textContent = c === ' ' ? ' ' : c;
    o.append(i); el.append(o);
  }
});
function labelIn(lb){
  lb.classList.add('is-in');
  stagger($$('.ch', lb), {translate:'0px 0px', opacity:'1'}, {duration:800, easing:E.p2out}, 50);
  stagger($$('.ch-in', lb), {rotate:'y 0deg', translate:'0px 0px 0px'}, {duration:1200, easing:E.back2}, 50);
  tween($('.sub', lb), {translate:'0px 0px', opacity:'1'}, {duration:900, easing:E.p2out});
}
function labelOut(lb){
  lb.classList.remove('is-in');
  stagger($$('.ch', lb), {translate:'300px 0px', opacity:'0'}, {duration:400, easing:E.p2in}, 10);
  stagger($$('.ch-in', lb), {rotate:'y 80deg', translate:'0px 0px -10px'}, {duration:400, easing:E.p2in}, 10);
  const sub = $('.sub', lb);
  const a = tween(sub, {translate:'-100px 0px', opacity:'0'}, {duration:600, easing:E.p2in});
  const reset = () => { if (sub.style.opacity === '0') sub.style.translate = '300px 0px'; };
  a ? a.finished.then(reset).catch(() => {}) : reset();
}

/* ---- KV：ホバーで浮上＋他を減光＋見出し ---- */
const kvEl = $('#top'), stageset = $('#stageset'), stages = $$('.stage'), sky = $('#sky');
let busy = false;
const hoverOn = st => {
  if (busy) return;
  st.classList.add('is-on');
  stages.forEach(o => o !== st && o.classList.add('is-out'));
  sky.classList.add('is-out'); stageset.classList.add('stageset-hover'); kvEl.classList.add('is-hover');
  $$('[data-tag]').forEach(t => { t.classList.toggle('is-on', t.dataset.tag === st.dataset.id); t.classList.toggle('is-out', t.dataset.tag !== st.dataset.id); });
  labelIn($('#lb-' + st.dataset.id));
};
const hoverOff = st => {
  st.classList.remove('is-on');
  stages.forEach(o => o.classList.remove('is-out'));
  sky.classList.remove('is-out'); stageset.classList.remove('stageset-hover'); kvEl.classList.remove('is-hover');
  $$('[data-tag]').forEach(t => t.classList.remove('is-on', 'is-out'));
  labelOut($('#lb-' + st.dataset.id));
};
/* 当たり判定の層：各島の .hit 図形を複製し、動かない層に重ねる */
const NS = 'http://www.w3.org/2000/svg';
const hitz = stages.map(st => {
  const src = $('svg', st), z = document.createElement('a');
  z.className = 'hitz'; z.dataset.for = st.dataset.id;
  z.href = $('.stage__inner', st).getAttribute('href');
  z.tabIndex = -1; z.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', src.getAttribute('viewBox'));
  svg.append($('.hit', src).cloneNode(true));
  z.append(svg); stageset.append(z);
  return z;
});
if (CAN_HOVER){
  hitz.forEach((z, i) => {
    const hit = $('.hit', z), st = stages[i];
    hit.addEventListener('mouseenter', () => hoverOn(st));
    hit.addEventListener('mouseleave', () => hoverOff(st));
  });
  // 行き先タグに乗ったときも対応する島を持ち上げる
  $$('[data-tag]').forEach(tag => {
    const st = $('#st-' + tag.dataset.tag);
    tag.addEventListener('mouseenter', () => hoverOn(st));
    tag.addEventListener('mouseleave', () => hoverOff(st));
  });
}

/* ---- クリック：他の島が吹き飛ぶ → 下層へ ---- */
const DIR = {
  'y':s => [0, -s], 'y-plus':s => [0, s], 'x-plus':s => [4 * s, 0],
  'xy-minus':s => [-s, -s], 'xy-plus':s => [s, s],
  'x-plus-y-minus':s => [s, -s], 'x-minus-y-plus':s => [-s, s]
};
function blowAndGo(st, href){
  if (busy) return; busy = true;
  const s = innerHeight;
  st.classList.remove('is-on'); stages.forEach(o => o.classList.remove('is-out')); sky.classList.remove('is-out');
  labelOut($('#lb-' + st.dataset.id));
  stages.forEach(o => {
    if (o === st) return;
    const [x, y] = DIR[o.dataset.dir](s);
    const dur = o.dataset.dir === 'x-plus' ? 500 : 300;
    const delay = /x-plus-y-minus|x-minus-y-plus/.test(o.dataset.dir) ? 200 : 0;
    tween(o, {translate:`${x}px ${y}px`}, {duration:dur, easing:E.p1out, delay});
  });
  $$('.tag').forEach(t => tween(t, {opacity:'0'}, {duration:300}));
  tween(sky, {opacity:'0'}, {duration:300});
  const XVT = 'onpageswap' in window;   // ページをまたぐ View Transitions に対応
  if (!XVT) tween(st, {scale:'1.08', opacity:'0'}, {duration:500, easing:E.p2in, delay:350});
  setTimeout(() => { location.href = href; }, RM ? 0 : XVT ? 380 : 820);
}
const onStageClick = (st, e) => {
  e.preventDefault();
  const href = $('.stage__inner', st).getAttribute('href');
  // ページ内リンクの島（プラン）は吹き飛ばさずにスクロール
  if (href.startsWith('#')){ hoverOff(st); $(href).scrollIntoView({behavior: RM ? 'auto' : 'smooth'}); return; }
  blowAndGo(st, href);
};
stages.forEach((st, i) => {
  $('.stage__inner', st).addEventListener('click', e => onStageClick(st, e));   // キーボード操作
  hitz[i].addEventListener('click', e => onStageClick(st, e));                  // マウス・タップ
});

/* ---- #plan などで来たときは、画像・フォントの読み込み後に位置を合わせ直す ---- */
if (location.hash && $(location.hash)){
  const fix = () => $(location.hash).scrollIntoView();
  addEventListener('load', fix, {once:true});
  document.fonts?.ready.then(fix);
}
/* 確認用：?static で KV の固定を外し、ページ全体を1枚で撮れるようにする */
if (/[?&]static\b/.test(location.search)) document.documentElement.classList.add('is-static');

// 戻るボタン（bfcache）で戻ったときは島を元に戻す
addEventListener('pageshow', e => {
  if (!e.persisted) return;
  busy = false;
  [...stages, sky, ...$$('.tag')].forEach(el => { el.getAnimations().forEach(a => a.cancel()); el.style.translate = ''; el.style.opacity = ''; el.style.scale = ''; });
});

const hd = $("#hd");   // メニュー・ヘッダーの白地・手書き線・オプション選択は chrome.js（全ページ共通）

/* ---- 月額 ¥30,000 → ¥0：画面に入ったら数値を減らしていく（桁も減る） ---- */
const zero = $('#zero'), zval = $('[data-zero-val]');
if (zero && zval){
  const render = (v) => { zval.innerHTML = Math.round(v).toLocaleString('ja-JP').split('').map(ch => ch === ',' ? '<b class="c">,</b>' : '<b>' + ch + '</b>').join(''); };
  if (RM){ render(0); }
  else {
    const FROM = 30000, DUR = 1200;
    render(FROM);
    const ease = t => 1 - Math.pow(1 - t, 3);   // 最初は速く、0 に近づくほどゆっくり
    const zio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      zio.disconnect();
      zero.classList.add('is-go');
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / DUR);
        render(FROM * (1 - ease(p)));
        if (p < 1) requestAnimationFrame(tick);
        else { render(0); zero.classList.add('is-done'); }
      };
      requestAnimationFrame(tick);
    }, {threshold:.25});
    zio.observe(zero);
  }
}

/* ---- 写真カード：タップで裏返す（タッチ端末） ---- */
// 複製したカードにも効くよう、行に対してまとめて受ける
const hangRowEl = $('[data-hang] .hang__row');
if (hangRowEl && !CAN_HOVER) hangRowEl.addEventListener('click', e => { const c = e.target.closest('.hang__card'); if (c) c.classList.toggle('is-flip'); });

/* ---- KV が覆われたらループを止める ---- */
const kv = $('#top'), svgs = $$('svg', kv);
const sentinel = document.createElement('div');
sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100vh;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([e]) => {
  kv.style.visibility = e.isIntersecting ? '' : 'hidden';
  svgs.forEach(s => e.isIntersecting ? s.unpauseAnimations?.() : s.pauseAnimations?.());
}).observe(sentinel);
if (RM) svgs.forEach(s => s.pauseAnimations?.());

/* ---- FOOD：吊り下げカードを2周分並べて継ぎ目なく流す ---- */
const hangRow = $('[data-hang] .hang__row');
if (hangRow){
  [...hangRow.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $('img', c).alt = ''; hangRow.append(c); });
  const hang = hangRow.closest('[data-hang]');
  hang.classList.add('is-js');
  let x = 0, extra = 0, last = performance.now(), hovering = false, visible = true;
  const SPEED = () => hangRow.scrollWidth / 2 / 70;   // 1周（半分の幅）を70秒で
  const step = () => { const li = $('.hang__i', hangRow); return li ? li.getBoundingClientRect().width + 26 : 250; };
  hang.addEventListener('mouseenter', () => hovering = true);
  hang.addEventListener('mouseleave', () => hovering = false);
  $$('[data-hang-nav]', hang).forEach(b => b.addEventListener('click', () => { extra += -Number(b.dataset.hangNav) * step(); }));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hang);
  const loop = (t) => {
    const dt = Math.min(64, t - last) / 1000; last = t;
    if (visible){
      const half = hangRow.scrollWidth / 2;
      if (!RM && !hovering) x -= SPEED() * dt;
      if (Math.abs(extra) > .5){ const d = extra * (RM ? 1 : Math.min(1, dt * 7)); x += d; extra -= d; } else { x += extra; extra = 0; }
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      hangRow.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---- 時間帯の切り替え（自動／朝／昼／夜）。選択はブラウザに記憶 ---- */
{
  const btns = $$('.tod [data-tod]');
  const set = (mode) => {
    if (mode === 'auto') delete document.documentElement.dataset.tod; else document.documentElement.dataset.tod = mode;
    btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.tod === mode ? 'true' : 'false'));
    try { localStorage.setItem('table_tod', mode); } catch (e) {}
  };
  let saved = 'auto'; try { saved = localStorage.getItem('table_tod') || 'auto'; } catch (e) {}
  set(saved);
  btns.forEach(b => b.addEventListener('click', () => set(b.dataset.tod)));
}

/* ---- SPLASH（セッション初回のみ・クリックで飛ばせる） ---- */
const splash = $('#splash');
function showKV(){
  tween(hd, {translate:'0px 0px'}, {duration:900, easing:E.p2out});
}
let seen = false;
try { seen = sessionStorage.getItem('table_splash') === '1'; sessionStorage.setItem('table_splash', '1'); } catch (e) {}
if (/[?&]static\b/.test(location.search)) seen = true;
if (RM || seen){ splash.remove(); showKV(); return; }
const num = $('#splashNum'), cover = $('#splashCover'), hello = $('#splashHello');
const t0 = performance.now(), LOAD = 1100;
let skipped = false;
splash.addEventListener('click', () => { skipped = true; splash.remove(); showKV(); }, {once:true});
(function count(t){
  if (skipped) return;
  const p = Math.min(1, (t - t0) / LOAD);
  num.textContent = Math.round(p * 100) + '%';
  if (p < 1) return requestAnimationFrame(count);
  // 各段は finished の Promise ではなくタイマーで繋ぐ（描画が止まる環境でも必ず最後まで進む）
  const at = (ms, fn) => setTimeout(() => { if (!skipped) fn(); }, ms);
  num.animate([{scale:1, opacity:1}, {scale:.7, opacity:0}], {duration:500, delay:200, easing:E.sine, fill:'forwards'});
  at(700, () => {
    cover.animate([{translate:'-100% 0'}, {translate:'0 0'}], {duration:600, easing:E.sine, fill:'forwards'});
    hello.animate([{translate:'-150px 0', opacity:0}, {translate:'0 0', opacity:1}], {duration:600, delay:250, easing:E.sine, fill:'forwards'});
  });
  at(1800, () => {
    splash.style.background = 'transparent';
    cover.animate([{opacity:1}, {opacity:0}], {duration:600, easing:E.sine, fill:'forwards'});
    hello.animate([{scale:1, opacity:1}, {scale:4.2, opacity:0}], {duration:500, delay:200, easing:E.sine, fill:'forwards'});
  });
  at(2550, () => { splash.remove(); showKV(); });
})(t0);
})();
