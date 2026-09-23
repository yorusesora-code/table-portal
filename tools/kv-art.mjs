// トップKV「島」のイラスト（インラインSVG）を座標から組み立てる。
// 2:1 の等角（ダイメトリック）投影：x軸は右下(1,.5)、y軸は左下(-1,.5)、z軸は上。
// 面の塗り：上面=明るい／+y面(左手前)=白／+x面(右手前)=影。線はすべて var(--line)。
// 動く部分には class を付け、動きは assets/css/top.css（CSS）と SMIL で付ける。

const L = "var(--line)";
const n = (v) => Math.round(v * 10) / 10;

function iso(cx, cy) {
  const P = (x, y, z = 0) => [cx + (x - y), cy + (x + y) * 0.5 - z];
  const d = (arr) => "M" + arr.map((p) => P(...p)).map(([a, b]) => `${n(a)} ${n(b)}`).join("L") + "Z";
  const poly = (arr, fill, sw = 1.6, extra = "") =>
    `<path d="${d(arr)}" fill="${fill}" stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"${extra}/>`;
  const box = (x, y, z, w, dp, h, c = {}) =>
    poly([[x, y + dp, z], [x + w, y + dp, z], [x + w, y + dp, z + h], [x, y + dp, z + h]], c.l ?? "#fff", c.sw) +
    poly([[x + w, y, z], [x + w, y + dp, z], [x + w, y + dp, z + h], [x + w, y, z + h]], c.r ?? "var(--shade-2)", c.sw) +
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + dp, z + h], [x, y + dp, z + h]], c.t ?? "var(--shade-1)", c.sw);
  const line = (a, b, sw = 1.4, stroke = L, extra = "") => {
    const [x1, y1] = P(...a), [x2, y2] = P(...b);
    return `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" fill="none"${extra}/>`;
  };
  const at = (x, y, z = 0) => { const [a, b] = P(x, y, z); return `translate(${n(a)} ${n(b)})`; };
  // +y面に貼る文字（x方向に読む）／+x面に貼る文字（-y方向に読む）
  const textY = (x, y, z, s, size, fill = L, anchor = "middle") => { const [a, b] = P(x, y, z); return `<text transform="matrix(1 .5 0 1 ${n(a)} ${n(b)})" font-family="Lato,sans-serif" font-weight="900" font-size="${size}" letter-spacing="1" text-anchor="${anchor}" fill="${fill}">${s}</text>`; };
  const textX = (x, y, z, s, size, fill = L, anchor = "middle") => { const [a, b] = P(x, y, z); return `<text transform="matrix(1 -.5 0 1 ${n(a)} ${n(b)})" font-family="Lato,sans-serif" font-weight="900" font-size="${size}" letter-spacing="1" text-anchor="${anchor}" fill="${fill}">${s}</text>`; };
  // 水平の円（上から見た円＝横長楕円）
  const disc = (x, y, z, r, fill, sw = 1.6, extra = "") => { const [a, b] = P(x, y, z); return `<ellipse cx="${n(a)}" cy="${n(b)}" rx="${n(r * Math.SQRT2)}" ry="${n(r * Math.SQRT2 / 2)}" fill="${fill}" stroke="${L}" stroke-width="${sw}"${extra}/>`; };
  // 円柱（テーブル・鉢など）
  const cyl = (x, y, z, r, h, top = "#fff", side = "var(--shade-1)") => {
    const [a, b] = P(x, y, z), rx = r * Math.SQRT2, ry = rx / 2;
    return `<path d="M${n(a - rx)} ${n(b - h)}V${n(b)}A${n(rx)} ${n(ry)} 0 0 0 ${n(a + rx)} ${n(b)}V${n(b - h)}Z" fill="${side}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<ellipse cx="${n(a)}" cy="${n(b - h)}" rx="${n(rx)}" ry="${n(ry)}" fill="${top}" stroke="${L}" stroke-width="1.4"/>`;
  };
  return { P, d, poly, box, line, at, textY, textX, disc, cyl };
}

// ---- 共通の小物 ----
const person = (tf, { body = "#fff", hair = "var(--ink)", cls = "", extra = "", s = .6 } = {}) => `
<g transform="${tf} scale(${s})"><g class="${cls}">
  <path d="M-4 0v-12M4 0v-12" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M-8 -12h16l1.5 -18a4 4 0 0 0 -4 -4h-11a4 4 0 0 0 -4 4z" fill="${body}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cy="-41" r="7" fill="#ffd9b8" stroke="${L}" stroke-width="1.6"/>
  <path d="M-7 -42a7 7 0 0 1 14 0c-3 -3 -10 -3 -14 0z" fill="${hair}"/>
  ${extra}
</g></g>`;

const tree = (I, x, y, s = 1) => {
  const [a, b] = I.P(x, y, 0);
  return `<g transform="translate(${n(a)} ${n(b)}) scale(${s})">
  <ellipse cx="0" cy="0" rx="13" ry="6" fill="var(--shade-2)" opacity=".5"/>
  <path d="M0 0v-26" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
  <g class="kv-leaf">
    <circle cx="-9" cy="-30" r="12" fill="var(--accent-3)" stroke="${L}" stroke-width="1.6"/>
    <circle cx="9" cy="-32" r="12" fill="var(--accent-3)" stroke="${L}" stroke-width="1.6"/>
    <circle cx="0" cy="-44" r="13" fill="#fff" stroke="${L}" stroke-width="1.6"/>
    <path d="M-5 -46q4 -5 9 -2" stroke="${L}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </g>
</g>`;
};

const scooter = `
<g transform="translate(-18 -30)">
  <circle cx="6" cy="24" r="6" fill="#fff" stroke="${L}" stroke-width="1.8"/><circle cx="6" cy="24" r="2" fill="${L}"/>
  <circle cx="30" cy="24" r="6" fill="#fff" stroke="${L}" stroke-width="1.8"/><circle cx="30" cy="24" r="2" fill="${L}"/>
  <path d="M4 22h22l6-10h-6l-4 6H10z" fill="var(--accent)" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M28 12l-3-8h4" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="0" y="2" width="15" height="13" rx="2" fill="var(--accent-2)" stroke="${L}" stroke-width="1.6"/>
  <path d="M2 7h11" stroke="#fff" stroke-width="1.6"/>
  <path d="M17 12l3 -9h6l2 9" fill="#fff" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="23" cy="-3" r="5.5" fill="#fff" stroke="${L}" stroke-width="1.6"/>
  <path d="M18 -3a5.5 5.5 0 0 1 11 0z" fill="var(--accent)" stroke="${L}" stroke-width="1.4"/>
</g>`;

// =========================================================
// TABLE WEB：HPがないお店（新しい飲食店＋HPが組み上がる）
// =========================================================
export function kvWeb() {
  const I = iso(200, 214);
  const road = { rx: 136, ry: 68 };
  const out = [];
  out.push(`<svg viewBox="0 0 400 340"><defs><clipPath id="kvw-plaza"><ellipse cx="200" cy="214" rx="112" ry="56"/></clipPath></defs>`);
  out.push(`<ellipse class="hit" cx="200" cy="200" rx="190" ry="140"/>`);
  // 島
  out.push(`<path d="M35 214A165 82.5 0 0 0 365 214V244A165 82.5 0 0 1 35 244Z" fill="var(--island-side)" stroke="${L}" stroke-width="2"/>`);
  out.push(`<path d="M35 226A165 82.5 0 0 0 365 226" fill="none" stroke="var(--shade-2)" stroke-width="3" opacity=".7"/>`);
  out.push(`<ellipse cx="200" cy="214" rx="165" ry="82.5" fill="var(--island-top)" stroke="${L}" stroke-width="2"/>`);
  // 草むら
  for (const [x, y] of [[-100, 70], [95, 70], [-40, -105], [108, -20], [-112, 5]]) { const [a, b] = I.P(x, y); out.push(`<path d="M${n(a - 6)} ${n(b)}q2-7 4 0q2-9 4 0q2-6 4 0" fill="none" stroke="${L}" stroke-width="1.3" stroke-linecap="round"/>`); }
  // 道路（リング）
  out.push(`<ellipse cx="200" cy="214" rx="${road.rx}" ry="${road.ry}" fill="none" stroke="var(--accent-2)" stroke-width="15"/>`);
  out.push(`<ellipse cx="200" cy="214" rx="${road.rx + 7.5}" ry="${road.ry + 7.5}" fill="none" stroke="${L}" stroke-width="1.2"/>`);
  out.push(`<ellipse cx="200" cy="214" rx="${road.rx - 7.5}" ry="${road.ry - 7.5}" fill="none" stroke="${L}" stroke-width="1.2"/>`);
  out.push(`<ellipse cx="200" cy="214" rx="${road.rx}" ry="${road.ry}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="7 8"/>`);
  // 広場（タイル）
  out.push(`<ellipse cx="200" cy="214" rx="112" ry="56" fill="#fff" stroke="${L}" stroke-width="1.4"/>`);
  let tiles = "";
  for (let k = -80; k <= 80; k += 16) { tiles += I.line([k, -90], [k, 90], 1, "var(--accent-3)") + I.line([-90, k], [90, k], 1, "var(--accent-3)"); }
  out.push(`<g clip-path="url(#kvw-plaza)">${tiles}</g>`);

  // 奥の木
  out.push(tree(I, -74, -76, 1)); out.push(tree(I, 78, -72, .9));

  // 道を走るバイク・歩く人（建物より先に描く＝奥を通るときは建物の後ろに隠れる）
  out.push(`<g><g transform="scale(.82)">${scooter}</g><animateMotion dur="11s" repeatCount="indefinite" path="M64 214a136 68 0 1 0 272 0a136 68 0 1 0 -272 0"/></g>`);
  out.push(`<g>${person("translate(0 0)", { body: "var(--accent-2)", extra: `<rect x="7" y="-24" width="8" height="10" rx="1.5" fill="#fff" stroke="${L}" stroke-width="1.2"/>` })}<animateMotion dur="14s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear" path="M86 250A136 68 0 0 0 250 280"/></g>`);

  // ---- 店舗 ----
  const X0 = -58, X1 = 28, Y0 = -52, Y1 = 6, H = 58, YC = -23, RH = 17;
  // 煙突（屋根より先に描き、下半分は屋根に隠れる）
  out.push(I.box(-44, -46, 60, 11, 11, 28, { l: "#fff", r: "var(--shade-1)", t: "var(--shade-2)" }));
  for (const [dx, dl] of [[0, 0], [4, -1.2], [-3, -2.4]]) { const [a, b] = I.P(-38.5, -40.5, 92); out.push(`<circle class="kv-puff" style="animation-delay:${dl}s" cx="${n(a + dx)}" cy="${n(b)}" r="6" fill="#fff" stroke="${L}" stroke-width="1.3"/>`); }
  // 壁
  out.push(I.box(X0, Y0, 0, X1 - X0, Y1 - Y0, H, { l: "#fff", r: "var(--shade-1)", t: "#fff" }));
  // 腰壁のライン
  out.push(I.poly([[X0, Y1, 0], [X1, Y1, 0], [X1, Y1, 7], [X0, Y1, 7]], "var(--shade-2)", 1.2));
  out.push(I.poly([[X1, Y0, 0], [X1, Y1, 0], [X1, Y1, 7], [X1, Y0, 7]], "var(--accent-2)", 1.2));
  // 切妻屋根：+x 側の妻（三角）→ 手前の屋根面
  out.push(I.poly([[X1, Y0 - 3, H], [X1, Y1 + 3, H], [X1, YC, H + RH]], "var(--shade-1)"));
  out.push(I.textX(X1, YC + 17, H + 3, "TABLE", 6.5, L, "start"));
  out.push(I.poly([[X0 - 5, Y1 + 5, H - 3], [X1 + 5, Y1 + 5, H - 3], [X1 + 5, YC, H + RH], [X0 - 5, YC, H + RH]], "var(--accent)", 2));
  for (let t = 1; t < 5; t++) { const yy = Y1 + 5 - (Y1 + 5 - YC) * t / 5, zz = H - 3 + (RH + 3) * t / 5; out.push(I.line([X0 - 5, yy, zz], [X1 + 5, yy, zz], 1, "rgba(255,255,255,.55)")); }
  for (let t = 1; t < 12; t++) { const xx = X0 - 5 + (X1 - X0 + 10) * t / 12; out.push(I.line([xx, Y1 + 5, H - 3], [xx, YC, H + RH], .8, "rgba(255,255,255,.3)")); }
  out.push(I.line([X0 - 5, YC, H + RH], [X1 + 5, YC, H + RH], 2.4));

  // 正面（+y面）：2階の窓
  for (const x of [-50, -24, 2]) {
    out.push(I.poly([[x, Y1, 38], [x + 16, Y1, 38], [x + 16, Y1, 52], [x, Y1, 52]], "var(--accent-3)", 1.4));
    out.push(`<g class="kv-night">${I.poly([[x, Y1, 38], [x + 16, Y1, 38], [x + 16, Y1, 52], [x, Y1, 52]], "#FFE7A8", 0)}</g>`);
    out.push(I.line([x + 8, Y1, 38], [x + 8, Y1, 52], 1)); out.push(I.line([x + 3, Y1, 49], [x + 7, Y1, 45], 1.2, "#fff"));
    out.push(I.poly([[x - 1, Y1, 36], [x + 17, Y1, 36], [x + 17, Y1 + 3, 35], [x - 1, Y1 + 3, 35]], "#fff", 1.2));
    // 窓辺の花
    const [a, b] = I.P(x + 8, Y1 + 2, 36); out.push(`<circle cx="${n(a - 4)}" cy="${n(b - 2)}" r="2.2" fill="var(--accent)"/><circle cx="${n(a + 1)}" cy="${n(b - 3)}" r="2.2" fill="var(--accent-2)"/><circle cx="${n(a + 5)}" cy="${n(b - 1.5)}" r="2" fill="var(--accent)"/>`);
  }
  // 1階：大きなショーウィンドウと扉
  out.push(I.poly([[-52, Y1, 8], [-28, Y1, 8], [-28, Y1, 28], [-52, Y1, 28]], "var(--accent-3)", 1.4));
  out.push(`<g class="kv-night">${I.poly([[-52, Y1, 8], [-28, Y1, 8], [-28, Y1, 28], [-52, Y1, 28]], "#FFE7A8", 0)}${I.poly([[4, Y1, 8], [22, Y1, 8], [22, Y1, 28], [4, Y1, 28]], "#FFE7A8", 0)}</g>`);
  out.push(I.line([-40, Y1, 8], [-40, Y1, 28], 1)); out.push(I.line([-49, Y1, 25], [-43, Y1, 19], 1.4, "#fff")); out.push(I.line([-46, Y1, 26], [-42, Y1, 22], 1.1, "#fff"));
  // 店内の明かり（ゆっくり明滅）
  out.push(`<g class="kv-glow">${I.poly([[-51, Y1, 9], [-29, Y1, 9], [-29, Y1, 14], [-51, Y1, 14]], "var(--accent-2)", 0)}</g>`);
  out.push(I.poly([[-18, Y1, 0], [-4, Y1, 0], [-4, Y1, 28], [-18, Y1, 28]], "var(--shade-2)", 1.4));
  out.push(I.line([-7, Y1, 13], [-7, Y1, 16], 2));
  // のれん（3枚が揺れる）
  for (let k = 0; k < 3; k++) {
    const x = -18 + k * 4.8;
    out.push(`<g class="kv-noren" style="animation-delay:${-k * .35}s">${I.poly([[x, Y1 + .5, 28], [x + 4.4, Y1 + .5, 28], [x + 4.4, Y1 + .5, 17], [x, Y1 + .5, 17]], k === 1 ? "#fff" : "var(--accent)", 1.2)}</g>`);
  }
  // 右の窓（+y 1階）
  out.push(I.poly([[4, Y1, 8], [22, Y1, 8], [22, Y1, 28], [4, Y1, 28]], "var(--accent-3)", 1.4));
  out.push(I.line([13, Y1, 8], [13, Y1, 28], 1));
  // 日よけ（ストライプ）
  const aw = (x, w) => { let s = ""; const n8 = Math.round(w / 6); for (let k = 0; k < n8; k++) { const xa = x + k * w / n8, xb = x + (k + 1) * w / n8; s += I.poly([[xa, Y1, 34], [xb, Y1, 34], [xb, Y1 + 11, 29], [xa, Y1 + 11, 29]], k % 2 ? "#fff" : "var(--accent)", 1); } return s + I.poly([[x, Y1, 34], [x + w, Y1, 34], [x + w, Y1 + 11, 29], [x, Y1 + 11, 29]], "none", 1.8); };
  out.push(aw(-55, 32)); out.push(aw(0, 25));
  // 右側面（+x面）の窓とメニュー
  for (const y of [-44, -24]) {
    out.push(I.poly([[X1, y, 38], [X1, y + 12, 38], [X1, y + 12, 52], [X1, y, 52]], "var(--accent-3)", 1.4));
    out.push(I.poly([[X1, y, 10], [X1, y + 12, 10], [X1, y + 12, 28], [X1, y, 28]], "var(--accent-3)", 1.4));
    out.push(I.line([X1, y + 6, 10], [X1, y + 6, 28], 1));
  }
  out.push(I.poly([[X1, -8, 12], [X1, 1, 12], [X1, 1, 26], [X1, -8, 26]], "#fff", 1.2));
  for (const z of [22, 19, 16]) out.push(I.line([X1, -6.5, z], [X1, -.5, z], 1));
  // 吊り看板「OPEN」（揺れ）
  out.push(I.line([X1, -2, 48], [X1 + 12, -2, 48], 2));
  { const [a, b] = I.P(X1 + 10, -2, 48); out.push(`<g transform="translate(${n(a)} ${n(b)})"><g class="sway"><path d="M-6 0v5M6 0v5" stroke="${L}" stroke-width="1.2"/><path d="M-12 5h24v12h-24z" fill="#fff" stroke="${L}" stroke-width="1.6"/><text y="14" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="8" letter-spacing=".6" fill="var(--accent)">OPEN</text></g></g>`); }

  // 植木鉢（正面）
  for (const x of [-56, -32]) { out.push(I.box(x, Y1 + 12, 0, 14, 6, 7, { l: "var(--accent-2)", r: "var(--accent)", t: "var(--shade-2)", sw: 1.2 })); const [a, b] = I.P(x + 7, Y1 + 15, 7); out.push(`<g class="kv-leaf"><circle cx="${n(a - 5)}" cy="${n(b - 3)}" r="5" fill="#fff" stroke="${L}" stroke-width="1.3"/><circle cx="${n(a + 4)}" cy="${n(b - 4)}" r="5.5" fill="var(--accent-3)" stroke="${L}" stroke-width="1.3"/><circle cx="${n(a - 1)}" cy="${n(b - 9)}" r="2" fill="var(--accent)"/></g>`); }
  // A型の黒板メニュー
  out.push(I.poly([[-2, 34, 0], [10, 34, 0], [10, 30, 18], [-2, 30, 18]], "#3a3a3a", 1.4));
  for (const z of [13, 10, 7]) out.push(I.line([0, 32.5, z], [8, 32.5, z], 1, "#fff"));
  // テラス席（パラソル）
  out.push(I.cyl(52, 26, 0, 3, 13, "#fff", "var(--shade-1)"));
  out.push(I.disc(52, 26, 14, 9, "#fff", 1.4));
  for (const [x, y] of [[40, 30], [60, 16]]) out.push(I.box(x, y, 0, 7, 7, 8, { l: "#fff", r: "var(--shade-1)", t: "var(--accent-2)", sw: 1.2 }));
  { const [a, b] = I.P(52, 26, 0); out.push(`<path d="M${n(a)} ${n(b - 14)}V${n(b - 44)}" stroke="${L}" stroke-width="1.8"/>`);
    let umb = ""; const rx = 30, ry = 15, cy = b - 40, top = b - 58; for (let k = 0; k < 8; k++) { const t0 = Math.PI * k / 8, t1 = Math.PI * (k + 1) / 8; const x0 = a - rx * Math.cos(t0), y0 = cy + ry * Math.sin(t0), x1 = a - rx * Math.cos(t1), y1 = cy + ry * Math.sin(t1); umb += `<path d="M${n(a)} ${n(top)}L${n(x0)} ${n(y0)}Q${n((x0 + x1) / 2)} ${n((y0 + y1) / 2 + 5)} ${n(x1)} ${n(y1)}Z" fill="${k % 2 ? "#fff" : "var(--accent)"}" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/>`; }
    out.push(`<path d="M${n(a - rx)} ${n(cy)}Q${n(a - rx / 2)} ${n(top - 2)} ${n(a)} ${n(top)}Q${n(a + rx / 2)} ${n(top - 2)} ${n(a + rx)} ${n(cy)}" fill="var(--accent-3)" stroke="${L}" stroke-width="1.3"/>` + umb); }
  // 店主（スマホを見る）
  { const [a, b] = I.P(-26, 44, 0); out.push(person(`translate(${n(a)} ${n(b)})`, { body: "#fff", extra: `<path d="M-9 -26q4 -2 8 0" fill="none" stroke="${L}" stroke-width="1.2"/><rect x="5" y="-30" width="7" height="11" rx="1.5" fill="var(--ink)"/><rect class="kv-blink" x="6.2" y="-28.6" width="4.6" height="7.6" rx="1" fill="var(--accent-2)"/>` })); }
  // 街灯
  { const [a, b] = I.P(-84, 30, 0); out.push(`<g transform="translate(${n(a)} ${n(b)})"><path d="M0 0v-52M0 -52q0 -6 7 -6" stroke="${L}" stroke-width="2" fill="none" stroke-linecap="round"/><circle class="kv-glow" cx="9" cy="-54" r="9" fill="var(--accent-3)" opacity=".8"/><path d="M4 -58h10l-2 6h-6z" fill="#fff" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/></g>`); }
  // 手前の木
  out.push(tree(I, 96, 44, 1.05)); out.push(tree(I, -104, 58, .95));

  // ---- HPが組み上がる（点線の枠 → ヘッダー → 写真 → 文章 → チェック）----
  out.push(`<g transform="translate(310 58)">
    <g class="kv-float">
      <rect x="-48" y="-36" width="96" height="72" rx="7" fill="#fff" opacity=".92"/>
      <rect class="kv-draw" pathLength="1" x="-48" y="-36" width="96" height="72" rx="7" fill="none" stroke="${L}" stroke-width="1.8"/>
      <path class="kv-draw" pathLength="1" d="M-48 -24h96" stroke="${L}" stroke-width="1.4" fill="none"/>
      <g class="kv-b1"><circle cx="-41" cy="-30" r="2" fill="var(--accent)"/><circle cx="-35" cy="-30" r="2" fill="var(--accent-2)"/><circle cx="-29" cy="-30" r="2" fill="var(--accent-3)" stroke="${L}" stroke-width=".8"/></g>
      <g class="kv-b2"><rect x="-41" y="-18" width="82" height="22" rx="3" fill="var(--accent-2)"/><circle cx="-26" cy="-10" r="6" fill="#fff" opacity=".7"/><path d="M-36 2l12-10 9 7 8-5 16 8z" fill="var(--accent)" opacity=".7"/></g>
      <g class="kv-b3"><rect x="-41" y="9" width="50" height="4" rx="2" fill="${L}" opacity=".7"/><rect x="-41" y="16" width="38" height="4" rx="2" fill="var(--accent-3)"/><rect x="-41" y="23" width="44" height="4" rx="2" fill="var(--accent-3)"/></g>
      <g class="kv-b4"><rect x="16" y="11" width="25" height="15" rx="7.5" fill="var(--accent)"/><path d="M22 18.5h13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>
      <g class="kv-b5"><circle cx="44" cy="-34" r="11" fill="var(--accent)" stroke="#fff" stroke-width="2"/><path d="M39 -34l3.5 3.5 6.5 -7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g>
  </g>`);
  out.push(`</svg>`);
  return out.join("\n");
}

// 小さな家・店（屋根つき）
const house = (I, x, y, w, d, h, { roof = "var(--accent-2)", wall = "#fff", side = "var(--shade-1)", rh = 10 } = {}) => {
  const yc = y + d / 2;
  return I.box(x, y, 0, w, d, h, { l: wall, r: side, t: wall, sw: 1.3 }) +
    I.poly([[x + w, y - 1, h], [x + w, y + d + 1, h], [x + w, yc, h + rh]], side, 1.3) +
    I.poly([[x - 2, y + d + 2, h - 1], [x + w + 2, y + d + 2, h - 1], [x + w + 2, yc, h + rh], [x - 2, yc, h + rh]], roof, 1.4) +
    I.poly([[x + w * .3, y + d, 2], [x + w * .5, y + d, 2], [x + w * .5, y + d, h * .6], [x + w * .3, y + d, h * .6]], "var(--accent-3)", 1) +
    `<g class="kv-night">` + I.poly([[x + w * .62, y + d, h * .45], [x + w * .82, y + d, h * .45], [x + w * .82, y + d, h * .75], [x + w * .62, y + d, h * .75]], "#FFE7A8", .8) + `</g>`;
};
const pinSvg = (fill, dot, cls = "pin") => `<g class="${cls}"><path d="M-8 -18a8 8 0 1 1 16 0c0 7-8 15-8 15s-8-8-8-15z" fill="${fill}" stroke="${L}" stroke-width="1.4"/><circle cy="-18" r="3" fill="${dot}"/></g>`;

// =========================================================
// TABLE SHIFT：HPが古いお店（古いPC → 新しいスマホ、月額が貯金に）
// =========================================================
export function kvShift() {
  const I = iso(200, 196);
  const out = [];
  out.push(`<svg viewBox="0 0 400 330"><defs>
    <clipPath id="kvs-old"><path d="${I.d([[-58, -12, 25], [-38, -12, 25], [-38, -12, 41], [-58, -12, 41]])}"/></clipPath>
    <clipPath id="kvs-new"><path d="${I.d([[14, -22, 7], [50, -22, 7], [50, -22, 73], [14, -22, 73]])}"/></clipPath>
  </defs>`);
  out.push(`<path class="hit" d="M14 210l186-94 186 94-186 94zM60 190V20h290v170z"/>`);
  // 島
  out.push(I.box(-92, -92, -22, 184, 184, 22, { t: "var(--island-top)", l: "var(--island-side)", r: "var(--accent-2)", sw: 2 }));
  for (let k = -69; k <= 69; k += 23) { out.push(I.line([k, -92], [k, 92], 1, "var(--accent-3)")); out.push(I.line([-92, k], [92, k], 1, "var(--accent-3)")); }
  // 島の上の物は 1.3 倍で描く（島の中心を基準に拡大）
  out.push(`<g transform="translate(200 196) scale(1.3) translate(-192 -194)">`);
  // 通路（古い → 新しい）
  out.push(I.poly([[-40, 8, 0], [34, 8, 0], [34, 22, 0], [-40, 22, 0]], "#fff", 1.2));
  for (let x = -34; x < 34; x += 12) out.push(I.poly([[x, 13, 0], [x + 6, 13, 0], [x + 6, 17, 0], [x, 17, 0]], "var(--accent-2)", 0));
  // 奥の植木
  out.push(tree(I, -40, -64, .7)); out.push(tree(I, 58, -58, .65));

  // ---- 古い机とブラウン管 ----
  out.push(I.box(-70, -40, 0, 46, 28, 20, { l: "var(--accent-3)", r: "var(--shade-2)", t: "#fff" }));
  out.push(I.line([-66, -12, 14], [-28, -12, 14], 1));
  out.push(I.box(-62, -36, 20, 28, 24, 26, { l: "#f1ece3", r: "#dcd3c5", t: "#f7f3ec" }));
  out.push(I.poly([[-58, -12, 25], [-38, -12, 25], [-38, -12, 41], [-58, -12, 41]], "#e6e0d4", 1.3));
  out.push(`<g clip-path="url(#kvs-old)"><g class="kv-flicker">${I.line([-58, -12, 36], [-44, -12, 36], 2.2, "#c9bfa8")}${I.line([-58, -12, 32], [-40, -12, 32], 2.2, "#c9bfa8")}${I.line([-58, -12, 28], [-48, -12, 28], 2.2, "#c9bfa8")}</g>
    <g class="kv-scan">${I.poly([[-60, -12, 40], [-36, -12, 40], [-36, -12, 42], [-60, -12, 42]], "rgba(255,255,255,.85)", 0)}</g></g>`);
  out.push(I.textY(-48, -12, 38.5, "©2012", 4.2, "#b6ab93"));
  // くもの巣
  { const [a, b] = I.P(-34, -36, 46); out.push(`<path d="M${n(a)} ${n(b)}l-8 2M${n(a)} ${n(b)}l-6 6M${n(a)} ${n(b)}l-1 8M${n(a - 5)} ${n(b + 1.5)}q2 3 1 5M${n(a - 3)} ${n(b + 4)}q2 1 3 3" stroke="#b6ab93" stroke-width=".8" fill="none"/>`); }
  // キーボード
  out.push(I.box(-60, -8, 20, 22, 7, 2, { l: "#e6e0d4", r: "#d2c8b8", t: "#f1ece3", sw: 1 }));

  // ---- 新しいスマホ（大きく立てる） ----
  out.push(I.box(10, -30, 0, 44, 8, 80, { l: "var(--ink)", r: "#2c3236", t: "#3c4348", sw: 1.6 }));
  out.push(I.poly([[14, -22, 7], [50, -22, 7], [50, -22, 73], [14, -22, 73]], "#fff", 1));
  out.push(`<g clip-path="url(#kvs-new)">
    ${I.poly([[14, -22, 63], [50, -22, 63], [50, -22, 73], [14, -22, 73]], "var(--accent)", 0)}
    ${I.poly([[17, -22, 40], [47, -22, 40], [47, -22, 60], [17, -22, 60]], "var(--accent-2)", 0)}
    ${I.poly([[20, -22, 42], [30, -22, 50], [36, -22, 45], [44, -22, 52], [44, -22, 42]], "var(--accent)", 0, " opacity=\".6\"")}
    ${I.line([18, -22, 34], [42, -22, 34], 2.4, "var(--ink)")}${I.line([18, -22, 29], [38, -22, 29], 2, "var(--accent-3)")}${I.line([18, -22, 25], [40, -22, 25], 2, "var(--accent-3)")}
    ${I.poly([[18, -22, 12], [34, -22, 12], [34, -22, 18], [18, -22, 18]], "var(--accent)", 0)}
    <g class="kv-shine">${I.poly([[6, -22, 0], [14, -22, 0], [28, -22, 80], [20, -22, 80]], "rgba(255,255,255,.55)", 0)}</g>
  </g>`);
  // 通知「¥0 / 月」
  { const [a, b] = I.P(40, -26, 96); out.push(`<g transform="translate(${n(a)} ${n(b)})"><g class="kv-pop"><path d="M-22 -12h44a6 6 0 0 1 6 6v10a6 6 0 0 1 -6 6h-18l-6 7 -1 -7h-19a6 6 0 0 1 -6 -6v-10a6 6 0 0 1 6 -6z" fill="var(--accent)" stroke="${L}" stroke-width="1.4"/><text y="3.5" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="10" fill="#fff">¥0 / 月</text></g></g>`); }

  // ---- 飛んでいく書類（古い画面 → 新しいスマホ） ----
  { const [x1, y1] = I.P(-48, -12, 44), [x2, y2] = I.P(32, -22, 70); const path = `M${n(x1)} ${n(y1)}Q${n((x1 + x2) / 2)} ${n(Math.min(y1, y2) - 60)} ${n(x2)} ${n(y2)}`;
    out.push(`<path d="${path}" fill="none" stroke="var(--accent-2)" stroke-width="1.4" stroke-dasharray="3 5"/>`);
    for (const dl of [0, -1.4, -2.8]) out.push(`<g><g><path d="M-6 -8h9l3 3v11h-12z" fill="#fff" stroke="${L}" stroke-width="1.2" stroke-linejoin="round"/><path d="M-4 -3h7M-4 0h8M-4 3h5" stroke="var(--accent-2)" stroke-width="1"/></g><animateMotion dur="4.2s" begin="${dl}s" repeatCount="indefinite" path="${path}"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="4.2s" begin="${dl}s" repeatCount="indefinite"/></g>`);
  }

  // ---- 貯金箱（月額が貯金に回る） ----
  { const [a, b] = I.P(-6, 56, 0); out.push(`<g transform="translate(${n(a)} ${n(b)})">
      <ellipse cx="0" cy="2" rx="22" ry="7" fill="var(--shade-2)" opacity=".6"/>
      <path d="M-12 0v-6M10 0v-6M-4 1v-6M4 1v-6" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="0" cy="-18" rx="22" ry="16" fill="var(--accent-2)" stroke="${L}" stroke-width="1.8"/>
      <path d="M-12 -32l-4 -8 9 4z" fill="var(--accent-2)" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
      <ellipse cx="22" cy="-18" rx="5" ry="6" fill="var(--accent)" stroke="${L}" stroke-width="1.4"/><circle cx="21" cy="-19" r="1" fill="${L}"/><circle cx="23.5" cy="-17" r="1" fill="${L}"/>
      <circle cx="11" cy="-24" r="1.8" fill="${L}"/><path d="M-6 -33h10" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M-22 -20q-6 -2 -5 4" fill="none" stroke="${L}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-14 -14q6 4 14 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      ${[0, -1, -2].map((dl) => `<g class="kv-coin" style="animation-delay:${dl}s"><ellipse cx="-1" cy="-54" rx="6" ry="6" fill="var(--accent)" stroke="${L}" stroke-width="1.3"/><text x="-1" y="-51" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="7" fill="#fff">¥</text></g>`).join("")}
    </g>`); }
  // ---- 荷物を運ぶ人（古い → 新しい） ----
  { const [x1, y1] = I.P(-30, 15), [x2, y2] = I.P(28, 15);
    out.push(`<g>${person("translate(0 0)", { body: "#fff", extra: `<path d="M-12 -32h20v14h-20z" fill="var(--accent-3)" stroke="${L}" stroke-width="1.4"/><path d="M-12 -25h20" stroke="${L}" stroke-width="1"/>` })}<animateMotion dur="9s" repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;.4;.5;.9;1" calcMode="linear" path="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}"/></g>`); }
  // 手前の植木鉢
  for (const [x, y] of [[-62, 46], [52, 56]]) { out.push(I.cyl(x, y, 0, 6, 9, "var(--shade-2)", "var(--accent-2)")); const [a, b] = I.P(x, y, 9); out.push(`<g class="kv-leaf"><path d="M${n(a)} ${n(b)}q-10 -14 -4 -24q4 10 4 24q0 -16 8 -22q2 12 -8 22" fill="var(--accent-3)" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/></g>`); }
  out.push(`</g>`);
  out.push(`</svg>`);
  return out.join("\n");
}

// =========================================================
// ¥0 / MONTH：大皿とクロッシュ（ふたが開くと中からHP）
// =========================================================
export function kvPrice() {
  const out = [];
  const cx = 210, cy = 262;
  out.push(`<svg viewBox="0 0 420 380"><defs>
    <radialGradient id="kvp-dome" cx="35%" cy="28%" r="80%"><stop offset="0" style="stop-color:var(--dome-1)"/><stop offset=".6" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--dome-3)"/></radialGradient>
  </defs>`);
  out.push(`<circle class="hit" cx="210" cy="200" r="160"/>`);
  out.push(`<ellipse cx="${cx}" cy="342" rx="120" ry="14" fill="var(--shade-2)" opacity=".5"/>`);
  out.push(`<ellipse cx="${cx}" cy="236" rx="200" ry="56" fill="none" stroke="${L}" stroke-width="1.5" stroke-dasharray="3 6"/>`);
  // テーブルクロス（縁が波打つ）
  // 裾：楕円の下半分に沿って、ゆるい波を垂らす
  let hem = `M${cx - 160} ${cy + 8}`; const K = 12;
  for (let k = 0; k <= K; k++) { const t = Math.PI * k / K; const x = cx - 160 * Math.cos(t), y = cy + 8 + 40 * Math.sin(t) + 20;
    if (k === 0) hem += ` L${n(x)} ${n(y)}`; else { const tp = Math.PI * (k - .5) / K; const xp = cx - 160 * Math.cos(tp), yp = cy + 8 + 40 * Math.sin(tp) + 28; hem += ` Q${n(xp)} ${n(yp)} ${n(x)} ${n(y)}`; } }
  out.push(`<path d="${hem} L${cx + 160} ${cy + 8} Z" fill="#fff" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`);
  for (let k = 1; k < K; k += 2) { const t = Math.PI * k / K; const x = cx - 160 * Math.cos(t), y = cy + 8 + 40 * Math.sin(t); out.push(`<path d="M${n(x)} ${n(y + 4)}v${n(18 + 6 * Math.sin(t))}" stroke="var(--accent-3)" stroke-width="2" stroke-linecap="round"/>`); }
  out.push(`<ellipse cx="${cx}" cy="${cy + 8}" rx="160" ry="40" fill="var(--shade-1)" stroke="${L}" stroke-width="1.8"/>`);
  // 皿
  out.push(`<ellipse cx="${cx}" cy="${cy + 4}" rx="146" ry="30" fill="#fff" stroke="${L}" stroke-width="2"/>`);
  out.push(`<ellipse cx="${cx}" cy="${cy + 2}" rx="118" ry="22" fill="none" stroke="var(--accent-3)" stroke-width="3"/>`);
  // ふたの下から出てくるHP（ふたが開いたときだけ見える）
  out.push(`<g class="kv-reveal"><g transform="translate(${cx} ${cy - 10})">
    <rect x="-34" y="-50" width="68" height="50" rx="5" fill="#fff" stroke="${L}" stroke-width="1.6"/>
    <rect x="-34" y="-50" width="68" height="9" rx="3" fill="var(--accent)"/><rect x="-28" y="-36" width="56" height="16" rx="2" fill="var(--accent-2)"/>
    <rect x="-28" y="-16" width="38" height="3.5" rx="1.7" fill="${L}" opacity=".7"/><rect x="-28" y="-10" width="30" height="3.5" rx="1.7" fill="var(--accent-3)"/>
  </g></g>`);
  // 湯気
  for (const [dx, dl] of [[-40, 0], [0, -1.2], [40, -2.4]]) out.push(`<path class="kv-steam" style="animation-delay:${dl}s" d="M${cx + dx} ${cy - 150}q-8 -10 0 -20q8 -10 0 -20" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>`);
  // クロッシュ（ふた）
  out.push(`<g class="kv-lid">
    <path d="M${cx - 132} ${cy - 2}a132 126 0 0 1 264 0z" fill="url(#kvp-dome)" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${cx - 128} ${cy - 12}q128 22 256 0" fill="none" stroke="var(--dome-3)" stroke-width="5" opacity=".45"/>
    <path d="M${cx - 92} ${cy - 58}a100 90 0 0 1 60 -56" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/>
    <path d="M${cx - 70} ${cy - 36}a70 60 0 0 1 16 -24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>
    <ellipse cx="${cx}" cy="${cy - 128}" rx="18" ry="6" fill="var(--dome-3)" stroke="${L}" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy - 138}" r="11" fill="#fff" stroke="${L}" stroke-width="2"/><circle cx="${cx - 4}" cy="${cy - 142}" r="3" fill="var(--accent-3)"/>
    <text x="${cx}" y="${cy - 38}" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="66" letter-spacing="1" fill="#fff">¥0</text>
    <text x="${cx}" y="${cy - 16}" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="14" letter-spacing="4" fill="#fff">PER MONTH</text>
  </g>`);
  // きらめき
  for (const [x, y, s, dl] of [[cx - 150, cy - 120, 1, 0], [cx + 150, cy - 96, .8, -.8], [cx + 96, cy - 170, .7, -1.6], [cx - 104, cy - 170, .6, -2.2]]) out.push(`<g transform="translate(${x} ${y}) scale(${s})"><path class="kv-twinkle" style="animation-delay:${dl}s" d="M0 -10Q1.5 -1.5 10 0Q1.5 1.5 0 10Q-1.5 1.5 -10 0Q-1.5 -1.5 0 -10z" fill="var(--accent)" stroke="${L}" stroke-width="1"/></g>`);
  // 周回するフォーク・ナイフ・スプーン
  const orbit = "M10 236a200 56 0 1 0 400 0a200 56 0 1 0 -400 0";
  const fork = `<circle r="14" fill="#fff" stroke="${L}" stroke-width="1.6"/><path d="M-4 -8v7M0 -8v7M4 -8v7M-4 -1q4 4 8 0M0 3v6" stroke="${L}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const knife = `<circle r="14" fill="#fff" stroke="${L}" stroke-width="1.6"/><path d="M-1 9V-2c0-4 2-7 4-8v10h-3" fill="var(--accent-3)" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const spoon = `<circle r="14" fill="#fff" stroke="${L}" stroke-width="1.6"/><ellipse cy="-4" rx="3.5" ry="5" fill="var(--accent-3)" stroke="${L}" stroke-width="1.5"/><path d="M0 1v8" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>`;
  [[fork, 0], [knife, -4], [spoon, -8]].forEach(([g, dl]) => out.push(`<g>${g}<animateMotion dur="12s" begin="${dl}s" repeatCount="indefinite" path="${orbit}"/></g>`));
  // 給仕の人（旗を振る）
  out.push(`<g transform="translate(${cx + 150} ${cy + 26})">${person("translate(0 0)", { s: .72, body: "#fff", extra: `<path d="M-8 -30h16v-4h-16z" fill="${L}"/><path d="M9 -26l12 -20" stroke="${L}" stroke-width="2"/><g transform="translate(21 -46)"><path class="flag" d="M0 0l20 5-18 9z" fill="var(--accent)" stroke="${L}" stroke-width="1.5"/></g>` })}</g>`);
  out.push(`</svg>`);
  return out.join("\n");
}

// =========================================================
// CAMPAIGN：デリバリーの街（お店 → お客さんの家）
// =========================================================
export function kvCamp() {
  const I = iso(210, 170);
  const out = [];
  out.push(`<svg viewBox="0 0 420 320">`);
  out.push(`<path class="hit" d="M10 180l200-100 200 100-200 100z"/>`);
  out.push(I.box(-95, -95, -18, 190, 190, 18, { t: "#f7f3ec", l: "#e9e2d6", r: "#ddd4c6", sw: 2 }));
  // 道路（格子）
  for (const k of [-38, 22]) { out.push(I.poly([[-95, k, 0], [95, k, 0], [95, k + 12, 0], [-95, k + 12, 0]], "#fff", 1)); out.push(I.poly([[k, -95, 0], [k + 12, -95, 0], [k + 12, 95, 0], [k, 95, 0]], "#fff", 1)); }
  // 川と橋
  out.push(I.poly([[64, -95, 0], [80, -95, 0], [80, 95, 0], [64, 95, 0]], "var(--accent-3)", 1));
  for (let y = -84; y < 90; y += 20) out.push(I.line([68, y, 0], [74, y + 7, 0], 1.2, "#fff"));
  out.push(I.box(60, 21, 0, 24, 14, 2, { l: "#fff", r: "var(--shade-1)", t: "#fff", sw: 1.2 }));
  // 公園
  out.push(I.poly([[-90, 40, 0], [-44, 40, 0], [-44, 90, 0], [-90, 90, 0]], "var(--shade-1)", 1));
  // 建物（奥 → 手前の順）
  out.push(house(I, -88, -88, 26, 22, 20, { roof: "var(--shade-2)" }));
  out.push(house(I, -20, -86, 22, 20, 26, { roof: "var(--shade-2)" }));
  out.push(house(I, 8, -86, 22, 18, 16, { roof: "var(--accent-3)" }));
  // 出発：飲食店（オレンジの屋根）
  out.push(house(I, -86, -22, 30, 24, 22, { roof: "var(--accent)", rh: 12 }));
  { const [a, b] = I.P(-71, -10, 42); out.push(`<g transform="translate(${n(a)} ${n(b)})">${pinSvg("var(--accent)", "#fff")}</g>`); }
  out.push(house(I, -20, -22, 24, 20, 18, { roof: "var(--shade-2)" }));
  out.push(house(I, 36, -22, 20, 18, 14, { roof: "var(--accent-3)" }));
  out.push(tree(I, -72, 60, .6)); out.push(tree(I, -56, 78, .55));
  out.push(house(I, -20, 40, 22, 20, 16, { roof: "var(--shade-2)" }));
  // 到着：お客さんの家
  out.push(house(I, 36, 40, 18, 18, 16, { roof: "var(--accent-2)" }));
  { const [a, b] = I.P(45, 38, 0); out.push(`<ellipse class="kv-ripple" cx="${n(a)}" cy="${n(b)}" rx="24" ry="12" fill="none" stroke="var(--accent)" stroke-width="2"/><ellipse class="kv-ripple kv-ripple--2" cx="${n(a)}" cy="${n(b)}" rx="24" ry="12" fill="none" stroke="var(--accent)" stroke-width="2"/>`); }
  { const [a, b] = I.P(45, 49, 36); out.push(`<g transform="translate(${n(a)} ${n(b)})">${pinSvg("#fff", "var(--accent)", "pin d2")}</g>`); }
  // 配達ルート（流れる点線）と走るバイク
  const route = [[-56, 8], [-32, 8], [-32, 28], [30, 28], [30, 38]].map(([x, y]) => I.P(x, y, 0));
  const rp = "M" + route.map(([a, b]) => `${n(a)} ${n(b)}`).join("L");
  out.push(`<path d="${rp}" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".3"/>`);
  out.push(`<path class="kv-route" d="${rp}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 8"/>`);
  out.push(`<g><g transform="scale(.62)">${scooter}</g><animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.8;1" calcMode="linear" path="${rp}"/><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.78;.86;1" dur="7s" repeatCount="indefinite"/></g>`);
  // 値札（揺れ）
  { const [a, b] = I.P(88, -60, 0); out.push(`<g transform="translate(${n(a)} ${n(b)})"><path d="M0 0v-58" stroke="${L}" stroke-width="2"/><g transform="translate(0 -58)"><g class="sway"><path d="M0 0v8" stroke="${L}" stroke-width="1.2"/><path d="M-26 8h44l10 11-10 11h-44z" fill="#fff" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="17" cy="19" r="2.4" fill="${L}"/><text x="-4" y="23" text-anchor="middle" font-family="Lato,sans-serif" font-weight="900" font-size="12" fill="var(--accent)">−10万</text></g></g></g>`); }
  out.push(`</svg>`);
  return out.join("\n");
}
export { iso, person, tree, L, n };
