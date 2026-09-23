// 静的サイトビルド：src/pages/**.html（先頭行にJSONメタ）を共通レイアウトで包み、ルート直下に書き出す。
//   src/pages/index.html            -> index.html
//   src/pages/service/table-web.html -> service/table-web/index.html
//   src/pages/x/index.html           -> x/index.html
// 本文中の {{name arg=val}} は下の C（コンポーネント）で展開する。
// 制作事例の詳細ページは data.mjs の WORKS から自動生成する。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as D from "./data.mjs";
import * as KV from "./kv-art.mjs";
import * as SA from "./sub-art.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src", "pages");
const { SITE } = D;

const yen = (n) => "¥" + n.toLocaleString("ja-JP");
const man = (n) => (n % 10000 === 0 ? n / 10000 + "万円" : yen(n));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const planOf = (k) => D.PLANS.find((p) => p.key === k);
const genreLabel = (k) => D.GENRES.find((g) => g.key === k).label;
const purposeLabel = (k) => D.PURPOSES.find((g) => g.key === k).label;
const svcLabel = (s) => (s === "web" ? "Table Web" : "Table Shift");
// 矢印の代わりに食事用ナイフ（右向き）
const arrow = `<svg class="i-arw" viewBox="0 0 44 13" aria-hidden="true"><path d="M3 3.5h11a3 3 0 0 1 0 6H3a3 3 0 0 1 0-6z" fill="currentColor"/><path d="M16 4.4h1.6V3.2H33c6 0 10.5 1.3 10.5 3 0 1.9-3.8 3.4-10 3.4H17.6V8.6H16z" fill="currentColor"/></svg>`;
const knife = `<svg class="knife" viewBox="0 0 44 13" aria-hidden="true"><path d="M3 3.5h11a3 3 0 0 1 0 6H3a3 3 0 0 1 0-6z"/><path d="M16 4.4h1.6V3.2H33c6 0 10.5 1.3 10.5 3 0 1.9-3.8 3.4-10 3.4H17.6V8.6H16z"/></svg>`;
const check = `<svg class="i-chk" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- components ---------- */
const C = {
  // トップKVの島（tools/kv-art.mjs）
  kvWeb: () => KV.kvWeb(),
  kvShift: () => (KV.kvShift ? KV.kvShift() : ""),
  kvPrice: () => (KV.kvPrice ? KV.kvPrice() : ""),
  kvCamp: () => (KV.kvCamp ? KV.kvCamp() : ""),
  // 下層ページ見出しの小さな島（tools/sub-art.mjs）
  ill: (a) => { const f = SA["sa" + a.k[0].toUpperCase() + a.k.slice(1)]; if (!f) throw new Error("unknown ill: " + a.k); return f(); },
  // READ MORE 型ボタン（トップと同じ。文字と下線が横に回る）
  btn: (a) => `<div class="c-btn${a.inv ? " c-btn--inv" : ""}${a.wide ? " c-btn--wide" : ""}"><a href="${a.href}"><span class="c-btn-content"><span class="c-btn-text">${a.t || "READ MORE"}</span><span class="c-btn-arrow">${knife}</span></span><span class="c-btn-line"><span></span></span></a></div>`,
  arrow: () => arrow,
  check: () => check,

  // トップの2導線分岐
  fork: () => `
<div class="fork" data-fork>
  <a class="fork__card fork__card--web" href="/service/table-web/">
    <span class="fork__q">HPが<em>ない</em>お店</span>
    <span class="fork__brand">Table <b>Web</b></span>
    <span class="fork__desc">はじめてのHPを、買い切りで。<br>デリバリー・SNS・地図まで最初からそろえます。</span>
    <span class="fork__meta">買い切り・月額0円</span>
    ${C.miniBrowser("web")}
    <span class="fork__go">新規制作を見る ${arrow}</span>
  </a>
  <a class="fork__card fork__card--shift" href="/service/table-shift/">
    <span class="fork__q">HPはあるが<em>古い</em>お店</span>
    <span class="fork__brand">Table <b>Shift</b></span>
    <span class="fork__desc">月額を払い続けている古いHPを、<br>買い切りで作り替えて“卒業”します。</span>
    <span class="fork__meta">解約・移行の段取りまでご案内</span>
    ${C.miniBrowser("shift")}
    <span class="fork__go">リプレースを見る ${arrow}</span>
  </a>
</div>`,

  miniBrowser: (kind) => kind === "web"
    ? `<span class="mini mini--web" aria-hidden="true"><i class="mini__bar"><b></b><b></b><b></b></i><i class="mini__empty"><span>＋</span></i></span>`
    : `<span class="mini mini--shift" aria-hidden="true"><i class="mini__bar"><b></b><b></b><b></b></i><i class="mini__old"></i><i class="mini__new"></i></span>`,

  // 料金早見表（コンパクト）
  priceQuick: () => `
<div class="pq">
  ${D.PLANS.map((p) => `
  <div class="pq__col${p.recommended ? " is-rec" : ""}">
    ${p.recommended ? `<span class="pq__badge">人気</span>` : ""}
    <span class="pq__en">${p.en}</span>
    <strong class="pq__name">${p.name}</strong>
    <span class="pq__price">${yen(p.price)}<small>税別</small></span>
    <span class="pq__pages"><b>${p.pages}</b>ページ${p.pages > 1 ? "まで" : ""}・メニュー${p.menu}品</span>
    <span class="pq__camp">デリバリー2社申込で <b>${p.price - 100000 <= 0 ? "¥0" : yen(p.price - 100000)}</b></span>
  </div>`).join("")}
</div>`,

  // プラン比較表（フル）
  planTable: (a = {}) => `
<div class="tbl-wrap"><table class="ptable">
  <thead><tr><th scope="col"><span class="sr">項目</span></th>${D.PLANS.map((p) => `<th scope="col" class="${p.recommended ? "is-rec" : ""}"><span class="ptable__en">${p.en}</span>${p.name}${p.recommended ? `<span class="pq__badge">人気</span>` : ""}</th>`).join("")}</tr></thead>
  <tbody>
        <tr class="ptable__zero"><th scope="row">月額費用</th>${D.PLANS.map(() => `<td>0円</td>`).join("")}</tr>
    <tr><th scope="row">ページ数</th>${D.PLANS.map((p) => `<td>${p.pages}ページ${p.pages > 1 ? "まで" : ""}</td>`).join("")}</tr>
    <tr><th scope="row">メニュー掲載</th>${D.PLANS.map((p) => `<td>${p.menu}品まで</td>`).join("")}</tr>
    ${D.INCLUDES.map((r) => `<tr><th scope="row">${r.label}</th>${r.v.map((v) => `<td>${typeof v === "string" ? `<span class="txt">${v}</span>` : v ? `<span class="dot" aria-label="含む">●</span>` : `<span class="dash" aria-label="含まない">−</span>`}</td>`).join("")}</tr>`).join("")}
    <tr><th scope="row">公開前の修正</th>${D.PLANS.map((p) => `<td>${p.revisions}回まで</td>`).join("")}</tr>
    <tr><th scope="row">公開後の無償修正</th>${D.PLANS.map((p) => `<td>${p.freeDays}日間</td>`).join("")}</tr>
    <tr><th scope="row">制作期間の目安</th>${D.PLANS.map((p) => `<td>${p.period}</td>`).join("")}</tr>
  </tbody>
</table></div>
<p class="note">全プラン共通で含まれるもの：${D.ALL_PLANS_INCLUDE.join("・")}。</p>`,

  // オプション一覧（価格は出さない。プランごとに「含む／追加できる」）
  optionTable: () => {
    const groups = [...new Set(D.OPTIONS.map((o) => o.group))];
    const cell = (v) => v ? `<span class="dot" aria-label="プランに含む">●</span><small class="otable__s">含む</small>` : `<span class="otable__add" aria-label="追加できる">＋</span><small class="otable__s">追加可</small>`;
    return `
<div class="tbl-wrap"><table class="ptable otable">
  <thead><tr><th scope="col"><span class="sr">オプション</span></th>${D.PLANS.map((p) => `<th scope="col" class="${p.recommended ? "is-rec" : ""}"><span class="ptable__en">${p.en}</span>${p.name}</th>`).join("")}</tr></thead>
  <tbody>${groups.map((g) => `
    <tr class="otable__g"><th scope="rowgroup" colspan="4">${g}</th></tr>
    ${D.OPTIONS.filter((o) => o.group === g).map((o) => `<tr><th scope="row">${o.name}${o.note && !/円/.test(o.note) ? `<small>${o.note}</small>` : ""}</th>${D.PLANS.map((p, i) => `<td>${cell(o.inc && o.inc[i])}</td>`).join("")}</tr>`).join("")}`).join("")}
  </tbody>
</table></div>
<p class="note">「含む」はそのプランに最初から入っているもの、「追加可」はオプションとして足せるものです。多言語対応はメインLP＋下層3ページまでが対象です。ロゴ制作・動画の埋め込みなど、一覧にないご要望もご相談ください。</p>`;
  },

  notIncluded: () => `
<ul class="ng">
  ${D.NOT_INCLUDED.map((n) => `<li class="ng__item"><span class="ng__x" aria-hidden="true">×</span><div><strong>${n.t}</strong><p>${n.d}</p><p class="ng__alt">${check}<span>${n.alt}</span></p></div></li>`).join("")}
</ul>`,


  // キャンペーン（写真背景の帯。割引額だけを出し、販売金額は出さない）
  campaign: (a = {}) => `
<section class="camp" id="campaign">
  <div class="camp__bg" aria-hidden="true"><img src="/assets/img/photos/m/berry-cheesecake.webp" srcset="/assets/img/photos/m/berry-cheesecake.webp 800w, /assets/img/photos/berry-cheesecake.webp 1448w" sizes="100vw" alt="" loading="lazy" decoding="async" width="1448" height="1086"></div>
  <div class="camp__in">
    <p class="camp__tag en">CAMPAIGN</p>
    <h2 class="camp__t">デリバリー新規申込割引</h2>
    <p class="camp__d">HPと一緒に Uber Eats または Rocket Now を新規でお申込みいただくと、初期費用から割引します。</p>
    <div class="camp__nums">
      <div><span>1社申込</span><b class="en">5<small>万円引</small></b></div>
      <div><span>2社申込</span><b class="en">10<small>万円引</small></b></div>
    </div>
    ${a.full ? `<ol class="camp__cond">${D.CAMPAIGN.conditions.map((c) => `<li>${c}</li>`).join("")}</ol>` : `<p class="camp__ex">対象：Uber Eats／Rocket Now の新規お申込み（開店で割引が確定）</p>
    ${C.btn({ href: "/price/#campaign", t: "CONDITIONS", inv: 1 })}`}
  </div>
</section>`,

  // オプションを選べる部品（価格は出さない。トップ用）
  optionPicker: () => {
    const opts = D.OPTIONS.filter((o) => o.group !== "ボリューム" && o.group !== "その他");
    const incOf = (i) => opts.map((o) => o.inc[i]).join("");
    return `
<div class="pick" data-picker>
  <fieldset class="pick__f"><legend class="pick__lg">プラン</legend>
    <div class="pick__seg" role="radiogroup">${D.PLANS.map((p, i) => `<label class="pick__p"><input type="radio" name="pick-plan" value="${p.key}" data-inc="${incOf(i)}" ${p.recommended ? "checked" : ""}><span><b>${p.name}</b><small>${p.pages}ページ${p.pages > 1 ? "まで" : ""}・メニュー${p.menu}品</small></span></label>`).join("")}</div>
  </fieldset>
  <fieldset class="pick__f"><legend class="pick__lg">オプション</legend>
    <div class="pick__opts">${opts.map((o, idx) => {
      const note = /円/.test(o.note) ? "" : o.note;
      return `<label class="pick__o"><input type="checkbox" data-name="${esc(o.name)}" data-inc-idx="${idx}" ${o.name.startsWith("多言語") ? 'data-exclusive="lang"' : ""}><span class="pick__box" aria-hidden="true">${check}</span><span class="pick__n">${o.name}${note ? `<small>${note}</small>` : ""}</span><span class="pick__s" data-s></span></label>`;
    }).join("")}</div>
  </fieldset>
  <div class="pick__out"><p class="pick__sum" data-pick-sum aria-live="polite"></p><div class="c-btn"><a href="/contact/" data-pick-cta><span class="c-btn-content"><span class="c-btn-text">この内容で相談する</span><span class="c-btn-arrow"><svg class="knife" viewBox="0 0 44 13" aria-hidden="true"><path d="M3 3.5h11a3 3 0 0 1 0 6H3a3 3 0 0 1 0-6z"/><path d="M16 4.4h1.6V3.2H33c6 0 10.5 1.3 10.5 3 0 1.9-3.8 3.4-10 3.4H17.6V8.6H16z"/></svg></span></span><span class="c-btn-line"><span></span></span></a></div></div>
</div>`;
  },

  // 見積りシミュレーター（料金ページ）
  estimator: () => {
    const opts = D.OPTIONS.filter((o) => o.group !== "ボリューム" && o.group !== "その他" && o.price != null);
    const incOf = (i) => opts.map((o) => o.inc[i]).join("");
    return `
<div class="est" data-estimator>
  <div class="est__form">
    <fieldset class="est__f"><legend>プラン</legend>
      <div class="seg" role="radiogroup">${D.PLANS.map((p, i) => `<label class="seg__o"><input type="radio" name="est-plan" value="${p.key}" data-price="${p.price}" data-inc="${incOf(i)}" ${p.recommended ? "checked" : ""}><span>${p.name}<small>${yen(p.price)}</small></span></label>`).join("")}</div>
    </fieldset>
    <fieldset class="est__f"><legend>オプション</legend>
      <div class="est__opts">${opts.map((o, incIdx) => {
        return `<label class="chk"><input type="checkbox" value="${o.price}" data-name="${esc(o.name)}" data-inc-idx="${incIdx}" ${o.name.startsWith("多言語") ? `data-exclusive="lang"` : ""}><span class="chk__box" aria-hidden="true">${check}</span><span class="chk__n">${o.name}</span><span class="chk__p">+${yen(o.price)}</span></label>`;
      }).join("")}</div>
    </fieldset>
    <fieldset class="est__f"><legend>デリバリー新規申込</legend>
      <div class="seg seg--3" role="radiogroup">
        <label class="seg__o"><input type="radio" name="est-camp" value="0" checked><span>なし</span></label>
        <label class="seg__o"><input type="radio" name="est-camp" value="50000"><span>1社<small>−5万円</small></span></label>
        <label class="seg__o"><input type="radio" name="est-camp" value="100000"><span>2社<small>−10万円</small></span></label>
      </div>
    </fieldset>
  </div>
  <div class="est__out" aria-live="polite">
    <dl class="est__lines">
      <div><dt>プラン</dt><dd data-o="plan">—</dd></div>
      <div><dt>オプション</dt><dd data-o="opt">¥0</dd></div>
      <div class="est__disc"><dt>デリバリー割引</dt><dd data-o="disc">¥0</dd></div>
    </dl>
    <div class="est__total"><span>お見積り（税別）</span><strong data-o="total">—</strong><small data-o="tax"></small></div>
    <p class="est__incl" data-o="incl" hidden></p>
    <a class="btn btn--primary btn--block" data-o="cta" href="/contact/">この内容で相談する ${arrow}</a>
    <p class="note">概算です。ページ追加・メニュー追加・BASE作成代行は含めていません。月額費用は0円です。</p>
  </div>
</div>`;
  },

  // 月額シミュレーター（Table Shift）。いまの月額の累計だけを出し、当社の販売金額は出さない
  simulator: () => `
<div class="simx" id="simulator" data-simulator>
  <div class="simx-inputs">
    <div class="simx-field">
      <div class="simx-flabel"><label for="sim-fee">現在のHP月額</label><span class="simx-fval en" data-s="feeText">¥30,000</span></div>
      <input type="range" id="sim-fee" min="5000" max="80000" step="1000" value="30000">
      <div class="range-scale"><span>¥5,000</span><span>¥80,000</span></div>
    </div>
    <div class="simx-field">
      <div class="simx-flabel"><label for="sim-years">契約してからの年数</label><span class="simx-fval en" data-s="yearsText">7年</span></div>
      <input type="range" id="sim-years" min="1" max="20" step="1" value="7">
      <div class="range-scale"><span>1年</span><span>20年+</span></div>
    </div>
    <div class="simx-field">
      <div class="simx-flabel"><span>これから試算する期間</span></div>
      <div class="simx-toggle" role="group" aria-label="試算期間">
        <button type="button" data-h="3">3年</button><button type="button" data-h="5" class="on" aria-pressed="true">5年</button><button type="button" data-h="10">10年</button>
      </div>
    </div>
    <div class="simx-plan">
      <div class="simx-plan-k en">RECOMMENDED</div>
      <div class="simx-plan-v" data-s="planName">アップグレード</div>
      <div class="simx-plan-sub" data-s="planReason"></div>
    </div>
  </div>
  <div class="simx-results">
    <div class="simx-hero">
      <div class="simx-hero-lab">このまま<span data-s="hLabel">5年</span>払い続けると</div>
      <div class="simx-hero-num en" data-s="keep">¥0</div>
      <div class="simx-hero-sub"><span data-s="dayWaste"></span>が、HPの月額として出ていきます。</div>
    </div>
    <div class="simx-bars">
      <div><div class="simx-bar-head"><span class="k">いまの月額HP（<span data-s="hN">5年</span>）</span><span class="v waste en" data-s="barKeepVal">¥0</span></div><div class="simx-bar-track"><div class="simx-bar-fill keep" data-s="barKeep"></div></div></div>
      <div><div class="simx-bar-head"><span class="k">Table Shift で乗り換えたあとの月額</span><span class="v good en">¥0</span></div><div class="simx-bar-track"><div class="simx-bar-fill shift" style="width:0"></div></div></div>
    </div>
    <div class="simx-tiles">
      <div class="simx-tile"><div class="t-lab">これまでに支払った累計</div><div class="t-val en" data-s="sunk">¥0</div><div class="t-sub">契約から<span data-s="sunkYears">7年</span>で</div></div>
      <div class="simx-tile"><div class="t-lab">乗り換え後、毎月手元に残る</div><div class="t-val en" data-s="perMonth">¥0</div><div class="t-sub">固定費がそのまま利益に</div></div>
    </div>
    ${C.btn({ href: "/contact/?service=shift&amp;topic=diagnosis", t: "この試算で無料診断する", wide: 1 })}
    <p class="note">※ 1年＝12ヶ月で単純計算しています。乗り換えには買い切りの制作費（初回のみ）がかかります。いまの契約に合わせた金額と、何ヶ月で元が取れるかは無料診断でご案内します。</p>
  </div>
</div>`,

  // 事例フィルタUI
  worksFilter: (a = {}) => {
    if (!SITE.showWorks) return "";
    const chip = (name, k, l) => `<button type="button" class="chip" data-f="${name}" data-v="${k}" aria-pressed="false">${l}</button>`;
    return `
<div class="wf" data-works-filter>
  <div class="wf__row"><span class="wf__k">業態</span><div class="wf__chips">${D.GENRES.map((g) => chip("genre", g.key, g.label)).join("")}</div></div>
  <div class="wf__row"><span class="wf__k">プラン</span><div class="wf__chips">${D.PLANS.map((p) => chip("plan", p.key, p.name)).join("")}${chip("service", "web", "Table Web")}${chip("service", "shift", "Table Shift")}</div></div>
  <div class="wf__row"><span class="wf__k">目的</span><div class="wf__chips">${D.PURPOSES.map((p) => chip("purpose", p.key, p.label)).join("")}</div></div>
  <div class="wf__foot"><span class="wf__count" aria-live="polite"><b data-count>${D.WORKS.length}</b>件</span><button type="button" class="wf__reset" data-reset>条件をクリア</button></div>
</div>`;
  },

  works: (a = {}) => {
    if (!SITE.showWorks) return "";
    let list = D.WORKS;
    if (a.genre) list = list.filter((w) => w.genre === a.genre);
    if (a.service) list = list.filter((w) => w.service === a.service);
    if (a.purpose) list = list.filter((w) => w.purposes.includes(a.purpose));
    if (a.slugs) list = a.slugs.split(",").map((s) => D.WORKS.find((w) => w.slug === s)).filter(Boolean);
    if (a.limit) list = list.slice(0, +a.limit);
    return `<ul class="wgrid${a.small ? " wgrid--sm" : ""}" data-works-list>${list.map(C.workCard).join("")}</ul><p class="wgrid__empty" data-empty hidden>条件に合う事例がありません。条件を減らしてみてください。</p>`;
  },

  workCard: (w) => {
    const p = planOf(w.plan);
    return `<li class="wcard" data-genre="${w.genre}" data-plan="${w.plan}" data-service="${w.service}" data-purpose="${w.purposes.join(" ")}">
  <a href="/works/${w.slug}/">
    <span class="wcard__img" style="--c:${w.color};--bg:${w.bg}"><img src="/assets/img/works/${w.slug}.jpg" alt="${esc(w.name)}のデモサイト" loading="lazy" width="800" height="560" onerror="this.remove()"><span class="wcard__ph" aria-hidden="true">${esc(w.name)}</span></span>
    <span class="wcard__tags"><span class="tag tag--${w.service}">${svcLabel(w.service)}</span><span class="tag">${genreLabel(w.genre)}</span><span class="tag">${p.name}</span>${w.demo ? `<span class="tag tag--demo">制作デモ</span>` : ""}</span>
    <strong class="wcard__name">${esc(w.name)}</strong>
    <span class="wcard__catch">${esc(w.catch)}</span>
    <span class="wcard__purp">${w.purposes.map((k) => `#${purposeLabel(k)}`).join(" ")}</span>
  </a>
</li>`;
  },

  faq: (a = {}) => {
    let list = D.FAQ;
    if (a.top) list = list.filter((f) => f.top);
    if (a.cat) list = list.filter((f) => a.cat.split(",").includes(f.cat));
    if (a.limit) list = list.slice(0, +a.limit);
    return `<div class="faq">${list.map((f) => `
  <details class="faq__i" data-cat="${f.cat}"><summary><span class="faq__q">Q</span><span class="faq__t">${f.q}</span><span class="faq__pm" aria-hidden="true"></span></summary><div class="faq__a"><div><p>${f.a}</p></div></div></details>`).join("")}</div>`;
  },

  faqAll: () => {
    const cats = [...new Set(D.FAQ.map((f) => f.cat))];
    return `<nav class="faq-cats" aria-label="カテゴリ">${cats.map((c) => `<a class="chip" href="#faq-${c}">${c}</a>`).join("")}</nav>
${cats.map((c) => `<section class="faq-sec" id="faq-${c}"><h2 class="h3">${c}</h2>${C.faq({ cat: c })}</section>`).join("")}`;
  },

  flow: (a = {}) => `
<ol class="flow flow--full" data-flow>${D.FLOW.map((st, i) => `<li><span class="en">${String(i + 1).padStart(2, "0")}</span><strong>${st.t}</strong><em>${st.time}</em>${a.compact ? "" : `<p>${st.d}</p>`}</li>`).join("")}</ol>`,

  flowPeriod: () => `
<div class="gantt" role="img" aria-label="プラン別の制作期間の目安">
  ${D.PLANS.map((p) => {
    const [a, b] = p.period.replace("週間", "").split("〜").map(Number);
    return `<div class="gantt__r"><span class="gantt__k">${p.name}</span><span class="gantt__track"><i class="gantt__min" style="--w:${(a / 6) * 100}%"></i><i class="gantt__max" style="--w:${(b / 6) * 100}%"></i></span><span class="gantt__v">${p.period}</span></div>`;
  }).join("")}
  <div class="gantt__axis" aria-hidden="true"><span></span><span class="gantt__ticks"><i>0</i><i>2週</i><i>4週</i><i>6週</i></span><span></span></div>
</div>`,

  columns: (a = {}) => {
    let list = D.COLUMNS;
    if (a.limit) list = list.slice(0, +a.limit);
    return `<ul class="cgrid">${list.map((c) => `<li class="ccard"><a href="/column/${c.slug}/"><span class="ccard__img"><img src="/assets/img/photos/m/${c.img}.webp" alt="" loading="lazy" decoding="async" width="800" height="600"></span><span class="ccard__tag">${c.tag}</span><strong>${c.short}</strong><span class="ccard__lead">${c.lead}</span><time datetime="${c.date}">${c.date.replace(/-/g, ".")}</time></a></li>`).join("")}</ul>`;
  },

  relatedWorks: (a = {}) => !SITE.showWorks ? "" : `<aside class="related"><h2 class="related__t">この記事に関連する制作事例</h2>${C.works({ slugs: a.slugs, small: 1 })}</aside>`,

  cta: (a = {}) => `
<section class="contact" id="contact">
  <a class="contact__a" href="${a.href || "/contact/"}">
    <span class="contact__en en">CONTACT</span>
    <span class="contact__jp">${a.t || "まずは無料相談から。HPがなくても、古いHPがあっても。"}</span>
    ${a.d ? `<span class="contact__d">${a.d}</span>` : ""}
    <span class="contact__go" aria-hidden="true">${knife}</span>
  </a>
</section>`,

  industries: () => `<ul class="ind">${D.INDUSTRIES.map((i) => i.active
    ? `<li class="ind__i"><a href="/industry/${i.key}/"><span class="ind__en">${i.en}</span><strong>${i.label}</strong><span>${i.lead}</span><span class="ind__go">${arrow}</span></a></li>`
    : `<li class="ind__i is-soon"><div><span class="ind__en">${i.en}</span><strong>${i.label}</strong><span>準備中</span></div></li>`).join("")}</ul>`,

  company: () => SITE.company,
  email: () => `<a href="mailto:${SITE.email}">${SITE.email}</a>`,
  year: () => String(SITE.year),

  partnerReward: () => SITE.showPartnerReward
    ? `<div class="reward"><span>代理店報酬</span><strong>${SITE.partnerReward}</strong><small>成約（初期費用の入金確認、またはキャンペーンで0円の場合は適用条件の確認）時点で確定します。</small></div>`
    : `<div class="reward reward--hidden"><span>代理店報酬</span><strong>資料にてご案内します</strong><small>報酬率・支払条件は、募集資料または個別の面談でお伝えしています。</small></div>`,
};

/* ---------- layout ---------- */
// 全ページ共通：左上の円形トリガー＋円ワイプのメニュー（トップと同じ部品）
const svgBg = {
  web: `<path d="M70 250V120l130-60 130 60v130z"/><path d="M70 120h260M110 250v-70h60v70M220 150h80v50h-80z"/><path d="M60 250h280"/>`,
  shift: `<rect x="40" y="70" width="150" height="120" rx="10"/><path d="M80 190l-10 40h90l-10-40"/><rect x="250" y="60" width="100" height="180" rx="16"/><path d="M200 130h40l-12-12M240 130l-12 12"/>`,
  price: `<ellipse cx="200" cy="220" rx="170" ry="34"/><path d="M60 214a140 130 0 0 1 280 0z"/><circle cx="200" cy="76" r="12"/>`,
  flow: `<circle cx="70" cy="150" r="30"/><circle cx="200" cy="150" r="30"/><circle cx="330" cy="150" r="30"/><path d="M100 150h70M230 150h70"/>`,
  faq: `<path d="M80 60h240a20 20 0 0 1 20 20v110a20 20 0 0 1-20 20H170l-50 40v-40H80a20 20 0 0 1-20-20V80a20 20 0 0 1 20-20z"/><path d="M180 110a20 20 0 1 1 30 18c-8 5-10 9-10 18M200 170v2"/>`,
};
const MAIN_NAV = [
  { k: "web", href: "/service/table-web/", en: "TABLE WEB", jp: "HPがないお店へ｜新規制作" },
  { k: "shift", href: "/service/table-shift/", en: "TABLE SHIFT", jp: "HPが古いお店へ｜リプレイス" },
  { k: "price", href: "/price/", en: "PLAN", jp: "プラン・オプション" },
  { k: "flow", href: "/flow/", en: "FLOW", jp: "ご利用の流れ" },
  { k: "faq", href: "/faq/", en: "FAQ", jp: "よくある質問" },
];
const SUB_NAV = [
  ["/service/options/", "OPTIONS", "オプション"], ["/industry/restaurant/", "INDUSTRY", "業種別"], ["/column/", "COLUMN", "お役立ち記事"],
  ["/contact/", "CONTACT", "無料相談"], ["/partner/", "PARTNER", "代理店の方へ"], ["/company/", "COMPANY", "会社概要"],
];
C.navi = () => `
<nav class="navi" id="navi" aria-label="グローバルナビゲーション">
  <div class="navi-bg" aria-hidden="true">${Object.entries(svgBg).map(([k, d]) => `<svg data-bg="${k}" viewBox="0 0 400 300"><g fill="none" stroke="#fff" stroke-width="2" opacity=".6">${d}</g></svg>`).join("")}</div>
  <div class="navi-in">
    <ul class="mainnavi">${MAIN_NAV.map((m) => `<li><a href="${m.href}" data-bg="${m.k}"><span class="en">${m.en}</span><span class="jp">${m.jp}</span></a></li>`).join("")}</ul>
    <ul class="subnavi">${SUB_NAV.map(([h, e, j]) => `<li><a href="${h}"><span class="en">${e}</span><span class="jp">${j}</span></a></li>`).join("")}</ul>
  </div>
</nav>`;
C.foot = () => `
<footer class="ft">
  <div class="ft__cols">
    <ul><li><a href="/service/table-web/">Table Web</a></li><li><a href="/service/table-shift/">Table Shift</a></li><li><a href="/service/options/">オプション</a></li><li><a href="/price/">プラン</a></li></ul>
    <ul><li><a href="/flow/">ご利用の流れ</a></li><li><a href="/faq/">よくある質問</a></li><li><a href="/column/">お役立ち記事</a></li><li><a href="/industry/">業種別</a></li></ul>
    <ul><li><a href="/contact/">無料相談</a></li><li><a href="/partner/">代理店の方へ</a></li><li><a href="/company/">会社概要</a></li></ul>
    <ul><li><a href="/legal/tokushoho/">特定商取引法に基づく表記</a></li><li><a href="/legal/privacy/">プライバシーポリシー</a></li><li><a href="/legal/terms/">利用規約</a></li></ul>
  </div>
  <p class="ft__c"><span class="en">© ${SITE.year}</span> ${SITE.company}　<small>掲載写真はイメージです。</small></p>
</footer>`;
function header() {
  return `
<a class="skip" href="#main">本文へスキップ</a>
<div class="progress" aria-hidden="true"></div>
<header class="hd" id="hd">
  <button class="trigger" id="trigger" aria-label="メニューを開く" aria-expanded="false" aria-controls="navi">
    <span class="circle"></span><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span>
  </button>
  <a class="hd-logo" href="/" aria-label="Table トップ">
    <svg viewBox="0 0 44 26" aria-hidden="true"><path d="M3 9h38M9 9v14M35 9v14M14 4h16" fill="none" stroke-width="3.5" stroke-linecap="round"/></svg>
    <span class="en">TABLE</span><small>飲食店のHP制作</small>
  </a>
</header>
${C.navi()}`;
}

function layout(meta, body, relPath) {
  const url = SITE.url + "/" + relPath.replace(/index\.html$/, "");
  const title = meta.title ? `${meta.title}｜Table 飲食店のHP制作` : `Table｜飲食店のHP制作（Table Web・Table Shift）`;
  const desc = meta.desc || "HPがない飲食店には新規制作の Table Web、古いHPがある店には買い切りでリプレイスする Table Shift。買い切り・月額0円。デリバリー新規申込で最大10万円引き。";
  const crumbs = meta.crumbs ? `<nav class="crumbs" aria-label="パンくず"><ol><li><a href="/">TOP</a></li>${meta.crumbs.map((c, i) => i === meta.crumbs.length - 1 ? `<li aria-current="page">${c[0]}</li>` : `<li><a href="${c[1]}">${c[0]}</a></li>`).join("")}</ol></nav>` : "";
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${SITE.noindex ? "" : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="${meta.ogType || "website"}">
<meta property="og:site_name" content="Table 飲食店のHP制作">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}/assets/img/ogp.png">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
${meta.noindex || SITE.noindex ? `<meta name="robots" content="noindex, nofollow">` : ""}
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@700;900&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
${meta.legacy ? `<link rel="stylesheet" href="/assets/css/site.css">` : meta.bare ? "" : `<link rel="stylesheet" href="/assets/css/top.css"><link rel="stylesheet" href="/assets/css/sub.css">`}
${(meta.css || []).map((h) => '<link rel="stylesheet" href="' + h + '">').join("")}
${meta.jsonld ? `<script type="application/ld+json">${meta.jsonld}</script>` : ""}
</head>
<body class="${meta.bare ? "" : "sub "}${meta.bodyClass || ""}">
${meta.bare ? body : `${header()}
<main id="main" class="sub-main">
${crumbs}
${body}
${/class="contact"/.test(body) || meta.nocta ? "" : C.cta()}
${C.foot()}
</main>`}
<script>window.TABLE_CONFIG=${JSON.stringify({ formEndpoint: SITE.formEndpoint })};</script>
<script src="/assets/js/site.js" defer></script>
${meta.bare ? "" : `<script src="/assets/js/chrome.js" defer></script>`}
${(meta.js || []).map((h) => '<script src="' + h + '" defer></script>').join("")}
</body>
</html>
`;
}

/* ---------- render ---------- */
function parseArgs(s = "") {
  const o = {};
  s.replace(/(\w+)=("([^"]*)"|\S+)|(\w+)/g, (_, k, v, q, flag) => { if (flag) o[flag] = 1; else o[k] = q ?? v; });
  return o;
}
function expand(html) {
  if (!SITE.showWorks) html = html.replace(/<!--works-->[\s\S]*?<!--\/works-->/g, "");
  return html.replace(/\{\{(\w+)((?:\s+[^}]*)?)\}\}/g, (m, name, args) => {
    if (!C[name]) throw new Error("unknown component: " + name);
    return C[name](parseArgs(args.trim()));
  });
}
function readPage(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) throw new Error("meta missing: " + file);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length) };
}
function outPathFor(rel) {
  if (rel === "index.html" || rel === "404.html" || rel.endsWith("/index.html")) return rel;
  return rel.replace(/\.html$/, "/index.html");
}
function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  built.push(rel);
}
const built = [];
// 事例を非表示にしたときは、前回生成した /works/ 配下（デモ以外）を消す
if (!SITE.showWorks && fs.existsSync(path.join(ROOT, "works"))) for (const d of fs.readdirSync(path.join(ROOT, "works"))) { if (d !== "demo") fs.rmSync(path.join(ROOT, "works", d), { recursive: true, force: true }); }

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
for (const f of walk(SRC).filter((f) => f.endsWith(".html"))) {
  const rel = path.relative(SRC, f).split(path.sep).join("/");
  if (!SITE.showWorks && rel.startsWith("works/")) continue;
  const { meta, body } = readPage(f);
  const o = outPathFor(rel);
  write(o, layout(meta, expand(body), o));
}

/* ---------- works detail pages ---------- */
import { workDetail } from "./work-detail.mjs";
for (const w of SITE.showWorks ? D.WORKS : []) {
  const rel = `works/${w.slug}/index.html`;
  const { meta, body } = workDetail(w, { C, D, yen, esc, planOf, genreLabel, purposeLabel, svcLabel, arrow, check });
  write(rel, layout(meta, expand(body), rel));
}

/* ---------- sitemap・robots ---------- */
const urls = built.filter((r) => r !== "404.html").map((r) => SITE.url + "/" + r.replace(/index\.html$/, ""));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
// 検索に出さない間は、全ページに noindex のヘッダーを付け、robots.txt でもクロールを断る
const robots = SITE.noindex ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`;
const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${SITE.noindex ? "  X-Robots-Tag: noindex, nofollow\n" : ""}\n/assets/*\n  Cache-Control: public, max-age=604800\n`;

/* ---------- 公開用フォルダ dist/（Cloudflare Pages はここを公開する） ---------- */
// src・tools・docs・README など公開しないものは含めない
const DIST = path.join(ROOT, "dist");
fs.rmSync(DIST, { recursive: true, force: true });
for (const rel of built) { const to = path.join(DIST, rel); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(ROOT, rel), to); }
fs.cpSync(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });
if (SITE.showWorks && fs.existsSync(path.join(ROOT, "works", "demo"))) fs.cpSync(path.join(ROOT, "works", "demo"), path.join(DIST, "works", "demo"), { recursive: true });
fs.writeFileSync(path.join(DIST, "robots.txt"), robots);
fs.writeFileSync(path.join(DIST, "_headers"), headers);
if (!SITE.noindex) fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
console.log(`built ${built.length} pages → dist/${SITE.noindex ? "（noindex：検索に出さない設定）" : ""}`);
