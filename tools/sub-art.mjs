// 下層ページの見出しに置く「小さな島」（トップKVの島と同じ描き方・同じ線と塗り）。
// 島ごとに一部だけが動く。動きのクラスは top.css（bob / sway / flag / coin / kv-*）と sub.css（sa-*）。
import { iso, person, tree, L, n } from "./kv-art.mjs";

const T = (x, y, s, size, fill = L, extra = "") => `<text x="${n(x)}" y="${n(y)}" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="${size}" fill="${fill}"${extra}>${s}</text>`;

// 島の土台（楕円の天面＋厚み）と草むら
function base(I, { tufts = [[-92, 40], [88, 52], [-30, -96], [96, -30]] } = {}) {
  let s = `<ellipse cx="200" cy="304" rx="120" ry="10" fill="var(--shade-2)" opacity=".45"/>`;
  s += `<path d="M50 210A150 75 0 0 0 350 210V236A150 75 0 0 1 50 236Z" fill="var(--island-side)" stroke="${L}" stroke-width="2"/>`;
  s += `<path d="M50 221A150 75 0 0 0 350 221" fill="none" stroke="var(--shade-2)" stroke-width="3" opacity=".7"/>`;
  s += `<ellipse cx="200" cy="210" rx="150" ry="75" fill="var(--island-top)" stroke="${L}" stroke-width="2"/>`;
  for (const [x, y] of tufts) { const [a, b] = I.P(x, y); s += `<path d="M${n(a - 6)} ${n(b)}q2-7 4 0q2-9 4 0q2-6 4 0" fill="none" stroke="${L}" stroke-width="1.3" stroke-linecap="round"/>`; }
  return s;
}
const open = (vb = "0 0 400 320") => `<svg class="sa" viewBox="${vb}" aria-hidden="true">`;
// 吹き出し（左下にしっぽ）
const bubble = (x, y, w, h, fill, txt, size, tc, tail = "l") => {
  const b = y + h, tx = tail === "l" ? x + 20 : x + w - 34, tip = tail === "l" ? tx - 6 : tx + 20;
  return `<path d="M${x + 10} ${y}H${x + w - 10}a10 10 0 0 1 10 10V${b - 10}a10 10 0 0 1 -10 10H${tx + 14}L${tip} ${b + 13}L${tx} ${b}H${x + 10}a10 10 0 0 1 -10 -10V${y + 10}a10 10 0 0 1 10 -10z" fill="${fill}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>` + T(x + w / 2, y + h / 2 + size * .36, txt, size, tc);
};

/* ---------- ご利用の流れ：飛び石を渡って旗まで ---------- */
export function saFlow() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, -70, -60, .9));
  const pts = [[92, 222], [140, 250], [200, 256], [256, 238], [296, 206]];
  o.push(`<path d="M${pts.map((p) => p.join(" ")).join("L")}" fill="none" stroke="${L}" stroke-width="1.6" stroke-dasharray="2 7" stroke-linecap="round"/>`);
  pts.forEach(([x, y], i) => {
    o.push(`<ellipse cx="${x}" cy="${y + 5}" rx="19" ry="9.5" fill="var(--shade-2)" stroke="${L}" stroke-width="1.6"/><ellipse cx="${x}" cy="${y}" rx="19" ry="9.5" fill="${i === 4 ? "var(--accent)" : "#fff"}" stroke="${L}" stroke-width="1.8"/>`);
    o.push(T(x, y + 4, String(i + 1), 11, i === 4 ? "#fff" : "var(--accent)"));
  });
  // ゴールの旗
  o.push(`<path d="M306 204V116" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><circle cx="306" cy="113" r="3.5" fill="var(--accent)" stroke="${L}" stroke-width="1.4"/>`);
  o.push(`<g transform="translate(307 118)"><g class="flag"><path d="M0 0h46l-8 12 8 12H0z" fill="var(--accent)" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>${T(20, 16, "OPEN", 9, "#fff")}</g></g>`);
  // 石を渡る人（行って戻る）
  o.push(`<g>${person("translate(0 -6)", { body: "var(--accent-2)", s: .62 })}<animateMotion dur="9s" repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;.42;.5;.92;1" calcMode="linear" path="M${pts.map((p) => p.join(" ")).join("L")}"/></g>`);
  // 奥のカレンダー看板
  o.push(I.box(-8, -78, 0, 4, 4, 44, { l: "#fff", r: "var(--shade-1)" }));
  o.push(`<g class="bob">${I.poly([[-40, -76, 44], [30, -76, 44], [30, -76, 88], [-40, -76, 88]], "#fff", 1.8)}${I.poly([[-40, -76, 76], [30, -76, 76], [30, -76, 88], [-40, -76, 88]], "var(--accent)", 1.6)}${I.textY(-5, -76, 50, "2-6W", 13, "var(--accent)")}</g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- よくある質問：テーブルと Q・A の吹き出し ---------- */
export function saFaq() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, 70, -70, .95));
  // 椅子とテーブル
  o.push(I.box(-52, 22, 0, 16, 16, 18, { l: "#fff", r: "var(--shade-2)", t: "var(--accent-2)" }));
  o.push(I.box(-52, 22, 18, 3, 16, 22, { l: "#fff", r: "var(--shade-1)", t: "#fff" }));
  o.push(I.cyl(0, 30, 0, 6, 26, "#fff", "var(--shade-1)"));
  o.push(I.cyl(0, 30, 26, 30, 5, "#fff", "var(--shade-2)"));
  { const [a, b] = I.P(0, 30, 31); o.push(`<g transform="translate(${n(a)} ${n(b)})"><ellipse cx="-12" cy="0" rx="12" ry="5" fill="#fff" stroke="${L}" stroke-width="1.4"/><path d="M8 -12h9v12h-9z" fill="var(--accent-3)" stroke="${L}" stroke-width="1.4"/><path d="M17 -8a4 4 0 0 1 0 6" fill="none" stroke="${L}" stroke-width="1.4"/><g class="kv-steam"><path d="M11 -16q-3 -5 0 -9q3 -4 0 -8" fill="none" stroke="${L}" stroke-width="1.3" stroke-linecap="round"/></g></g>`); }
  o.push(person(I.at(-44, 30, 18), { body: "var(--accent)", s: .6 }));
  // 吹き出し
  o.push(`<g class="bob">${bubble(70, 58, 88, 66, "#fff", "Q", 34, "var(--accent)", "r")}</g>`);
  o.push(`<g class="bob d2">${bubble(214, 92, 74, 56, "var(--accent)", "A", 28, "#fff", "l")}</g>`);
  o.push(`<g class="kv-twinkle" style="animation-delay:-.6s"><path d="M318 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--accent-2)" stroke="${L}" stroke-width="1.2"/></g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- 無料相談：ポストに手紙が届く ---------- */
export function saContact() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, -74, -54, 1)); o.push(tree(I, 66, 50, .8));
  // ベンチ
  o.push(I.box(-70, 30, 10, 40, 12, 4, { l: "#fff", r: "var(--shade-2)", t: "var(--accent-2)" }));
  o.push(I.box(-66, 30, 0, 3, 12, 10, { l: "#fff", r: "var(--shade-1)" })); o.push(I.box(-34, 30, 0, 3, 12, 10, { l: "#fff", r: "var(--shade-1)" }));
  // ポスト（柱＋箱＋旗）
  o.push(I.box(8, -8, 0, 7, 7, 58, { l: "#fff", r: "var(--shade-1)", t: "#fff" }));
  o.push(I.box(-8, -22, 58, 38, 34, 30, { l: "var(--accent)", r: "var(--dome-3)", t: "var(--dome-1)", sw: 2 }));
  o.push(I.poly([[-8, 12, 70], [30, 12, 70], [30, 12, 74], [-8, 12, 74]], "var(--ink)", 1.2));
  { const [a, b] = I.P(30, -12, 80); o.push(`<g transform="translate(${n(a)} ${n(b)})"><g class="sa-mailflag"><path d="M0 0v-22" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><path d="M0 -22h14v9H0z" fill="#fff" stroke="${L}" stroke-width="1.6"/></g></g>`); }
  o.push(I.textY(11, 12, 60, "MAIL", 9, "#fff"));
  // 飛んでくる手紙
  o.push(`<g class="sa-letter"><g transform="rotate(-8)"><rect x="-15" y="-10" width="30" height="20" rx="2" fill="#fff" stroke="${L}" stroke-width="1.8"/><path d="M-15 -10l15 11 15-11" fill="none" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9" cy="4" r="3" fill="var(--accent)"/></g><animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.55;1" calcMode="spline" keySplines=".3 .1 .3 1;0 0 1 1" path="M40 40C120 10 170 70 196 118"/></g>`);
  o.push(`<g class="kv-ripple"><ellipse cx="196" cy="120" rx="30" ry="15" fill="none" stroke="var(--accent)" stroke-width="2"/></g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- お役立ち記事：ページがめくれる本 ---------- */
export function saColumn() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, 76, -60, .9)); o.push(tree(I, -84, 20, .75));
  // 本（見開き）。背は(200,236)、左右のページが持ち上がる
  const lines = (x0, dir) => [0, 1, 2, 3, 4].map((k) => `<path d="M${x0 + dir * 12} ${150 + k * 13 - (dir > 0 ? 0 : 0)}q${dir * 30} ${-8} ${dir * 62} ${-2}" fill="none" stroke="var(--accent-2)" stroke-width="3" stroke-linecap="round"/>`).join("");
  o.push(`<path d="M200 244C170 226 130 226 104 236V142C130 132 170 132 200 150z" fill="var(--shade-2)" stroke="${L}" stroke-width="2" stroke-linejoin="round" transform="translate(-4 8)"/>`);
  o.push(`<path d="M200 244C230 226 270 226 296 236V142C270 132 230 132 200 150z" fill="var(--shade-2)" stroke="${L}" stroke-width="2" stroke-linejoin="round" transform="translate(4 8)"/>`);
  o.push(`<path d="M200 238C170 220 130 220 104 230V136C130 126 170 126 200 144z" fill="#fff" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`);
  o.push(`<path d="M200 238C230 220 270 220 296 230V136C270 126 230 126 200 144z" fill="#fff" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`);
  o.push(`<g>${lines(200, -1)}</g><g>${lines(200, 1)}</g>`);
  o.push(`<rect x="120" y="196" width="44" height="26" rx="3" fill="var(--accent-3)" stroke="${L}" stroke-width="1.4" transform="skewY(-6)"/>`);
  // めくれるページ（右ページの上に重ね、背を軸に左へ）
  o.push(`<path class="sa-flip" d="M200 238C230 220 270 220 296 230V136C270 126 230 126 200 144z" fill="#fff" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`);
  o.push(`<path d="M200 144V238" stroke="${L}" stroke-width="2"/>`);
  // しおり
  o.push(`<g transform="translate(270 132)"><g class="sway"><path d="M0 0v34l-6 -6-6 6V0" fill="var(--accent)" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/></g></g>`);
  o.push(`<g class="kv-twinkle"><path d="M320 96l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--accent-2)" stroke="${L}" stroke-width="1.2"/></g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- 会社概要：小さなオフィスビル ---------- */
export function saCompany() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, -80, -30, .9)); o.push(tree(I, 72, 44, .85));
  o.push(I.box(-36, -40, 0, 64, 52, 104, { l: "#fff", r: "var(--shade-1)", t: "var(--shade-2)", sw: 2 }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const x = -30 + c * 15, z = 18 + r * 21;
    o.push(I.poly([[x, 12, z], [x + 9, 12, z], [x + 9, 12, z + 13], [x, 12, z + 13]], (r + c) % 3 === 0 ? "var(--accent-2)" : "var(--accent-3)", 1.2, (r * c) % 5 === 1 ? ` class="kv-glow" style="animation-delay:-${r + c}s"` : ""));
  }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const y = -32 + c * 15, z = 18 + r * 21; o.push(I.poly([[28, y, z], [28, y + 9, z], [28, y + 9, z + 13], [28, y, z + 13]], "var(--shade-2)", 1.2)); }
  o.push(I.poly([[-8, 12, 0], [8, 12, 0], [8, 12, 14], [-8, 12, 14]], "var(--accent)", 1.4));
  // 屋上の旗
  { const [a, b] = I.P(-2, -14, 104); o.push(`<path d="M${n(a)} ${n(b)}v-40" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/><g transform="translate(${n(a)} ${n(b - 40)})"><g class="flag"><path d="M0 0h40v20H0z" fill="var(--accent)" stroke="${L}" stroke-width="1.5"/>${T(20, 14, "TABLE", 8, "#fff")}</g></g>`); }
  o.push(`<g>${person("translate(0 0)", { body: "var(--accent-2)", s: .55 })}<animateMotion dur="8s" repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;.45;.5;.95;1" calcMode="linear" path="M120 262L196 240"/></g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- 代理店：お店どうしをつなぐルート ---------- */
export function saPartner() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  const shop = (x, y, roof) => I.box(x, y, 0, 30, 26, 30, { l: "#fff", r: "var(--shade-1)", t: "#fff" }) + I.poly([[x - 3, y + 29, 28], [x + 33, y + 29, 28], [x + 33, y + 13, 44], [x - 3, y + 13, 44]], roof, 1.6) + I.poly([[x + 6, y + 26, 0], [x + 16, y + 26, 0], [x + 16, y + 26, 16], [x + 6, y + 26, 16]], "var(--accent-3)", 1.2);
  o.push(shop(-96, -56, "var(--accent)"));
  o.push(shop(52, -74, "var(--accent-2)"));
  o.push(tree(I, 84, 40, .8));
  const route = "M130 206C170 250 240 250 262 186";
  o.push(`<path d="${route}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="6 6" class="kv-route"/>`);
  o.push(`<g><circle r="7" fill="#fff" stroke="${L}" stroke-width="1.8"/><circle r="3" fill="var(--accent)"/><animateMotion dur="3.6s" repeatCount="indefinite" path="${route}"/></g>`);
  // 2人と、あいだに浮かぶ資料
  o.push(person(I.at(-20, 50), { body: "var(--accent)", s: .66 }));
  o.push(person(I.at(26, 36), { body: "#fff", hair: "var(--dome-3)", s: .66 }));
  o.push(`<g class="bob"><g transform="translate(206 176) rotate(-6)"><rect x="-14" y="-18" width="28" height="36" rx="2" fill="#fff" stroke="${L}" stroke-width="1.8"/><path d="M-8 -8h16M-8 -1h16M-8 6h10" stroke="var(--accent-2)" stroke-width="2.4" stroke-linecap="round"/></g></g>`);
  o.push(`<g class="kv-twinkle"><path d="M236 140l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--accent-2)" stroke="${L}" stroke-width="1.2"/></g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- 規約・表記：書類にハンコ ---------- */
export function saLegal() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, -84, -30, .85));
  o.push(`<g transform="translate(200 214)"><path d="M-78 0l70 34 88 -44 -70 -34z" fill="var(--shade-2)" stroke="${L}" stroke-width="1.6" stroke-linejoin="round" transform="translate(0 5)"/><path d="M-78 0l70 34 88 -44 -70 -34z" fill="#fff" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`);
  for (let k = 0; k < 5; k++) o.push(`<path d="M${-54 + k * 9} ${-4 + k * 4.5}l${44 - (k === 4 ? 16 : 0)} -22" stroke="var(--accent-2)" stroke-width="3" stroke-linecap="round"/>`);
  o.push(`<ellipse class="sa-stampmark" cx="22" cy="6" rx="14" ry="7" fill="none" stroke="var(--accent)" stroke-width="2.6"/></g>`);
  // ハンコ
  o.push(`<g transform="translate(222 190)"><g class="sa-stamp"><path d="M-10 0v-26h20V0z" fill="var(--accent-3)" stroke="${L}" stroke-width="1.6"/><ellipse cx="0" cy="-26" rx="10" ry="5" fill="#fff" stroke="${L}" stroke-width="1.6"/><ellipse cx="0" cy="-36" rx="7" ry="10" fill="var(--accent)" stroke="${L}" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="10" ry="5" fill="var(--accent)" stroke="${L}" stroke-width="1.6"/></g></g>`);
  // ペン
  o.push(`<g transform="translate(118 176) rotate(-28)"><g class="bob d2"><rect x="-4" y="-40" width="8" height="40" rx="3" fill="var(--accent-2)" stroke="${L}" stroke-width="1.6"/><path d="M-4 0l4 9 4-9z" fill="#fff" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/></g></g>`);
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- オプション：テーブルの上に「足せるもの」がのぼる ---------- */
export function saOptions() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, -80, -40, .85)); o.push(tree(I, 80, 30, .8));
  o.push(I.cyl(0, 0, 0, 8, 30, "#fff", "var(--shade-1)"));
  o.push(I.cyl(0, 0, 30, 44, 6, "#fff", "var(--shade-2)"));
  for (const [x, y, c] of [[-20, -8, "var(--accent-3)"], [16, -16, "#fff"], [0, 18, "var(--accent-2)"]]) { o.push(I.disc(x, y, 36, 11, "#fff", 1.6)); o.push(I.disc(x, y, 37, 6, c, 1.2)); }
  // のぼっていく「＋」とアイコン
  const chip = (x, y, cls, label) => `<g transform="translate(${x} ${y})"><g class="${cls}"><circle r="15" fill="#fff" stroke="${L}" stroke-width="1.8"/>${label}</g></g>`;
  o.push(chip(150, 150, "coin", `<path d="M-6 0h12M0 -6v12" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>`));
  o.push(chip(250, 146, "coin d2", T(0, 4.5, "EN", 11, "var(--accent)")));
  o.push(chip(200, 128, "coin", `<rect x="-7" y="-7" width="14" height="14" rx="4" fill="none" stroke="var(--accent)" stroke-width="2.2"/><circle r="3.2" fill="none" stroke="var(--accent)" stroke-width="2"/>`).replace('class="coin"', 'class="coin" style="animation-delay:-.85s"'));
  o.push(chip(284, 176, "coin", T(0, 4.5, "Q", 13, "var(--accent)")).replace('class="coin"', 'class="coin" style="animation-delay:-2.5s"'));
  o.push(person(I.at(-50, 40), { body: "var(--accent)", s: .62 }));
  o.push(`</svg>`);
  return o.join("");
}

/* ---------- 404：誰もいない席と「？」 ---------- */
export function saLost() {
  const I = iso(200, 210), o = [open()];
  o.push(base(I));
  o.push(tree(I, 76, -56, .9));
  o.push(I.box(-44, 8, 0, 14, 14, 16, { l: "#fff", r: "var(--shade-2)", t: "var(--accent-2)" }));
  o.push(I.box(30, -22, 0, 14, 14, 16, { l: "#fff", r: "var(--shade-2)", t: "var(--accent-2)" }));
  o.push(I.cyl(0, 0, 0, 6, 28, "#fff", "var(--shade-1)"));
  o.push(I.cyl(0, 0, 28, 30, 5, "#fff", "var(--shade-2)"));
  o.push(I.disc(0, 0, 33, 10, "#fff", 1.6));
  o.push(`<g class="bob">${bubble(222, 70, 60, 58, "var(--accent)", "?", 34, "#fff", "l")}</g>`);
  o.push(`<g transform="translate(118 250)"><g class="sa-look">${person("translate(0 0)", { body: "var(--accent-2)", s: .66 })}</g></g>`);
  o.push(`</svg>`);
  return o.join("");
}
