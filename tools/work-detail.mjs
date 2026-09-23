// 制作事例の詳細ページ（WORKS の1件から生成）
export function workDetail(w, { D, yen, esc, planOf, genreLabel, purposeLabel, svcLabel, arrow, check }) {
  const p = planOf(w.plan);
  const demo = `/works/demo/${w.slug}/`;
  const others = D.WORKS.filter((x) => x.slug !== w.slug && (x.genre === w.genre || x.service === w.service || x.purposes.some((k) => w.purposes.includes(k)))).slice(0, 3).map((x) => x.slug).join(",");
  const tech = (w.techniques || []).map((t) => `<li>${check}<span>${esc(t)}</span></li>`).join("");

  const beforeAfter = w.before
    ? `<section class="sec"><div class="wrap">
  <div class="sec__head"><span class="eyebrow">Before / After</span><h2 class="h2">古いHPが、こう変わりました。</h2><p class="lead">左右のフレームはどちらも実際に操作できます。スクロールして比べてみてください。</p></div>
  <div class="ba" data-ba>
    <div class="ba__tabs" role="tablist"><button role="tab" aria-selected="true" data-ba-tab="before">Before</button><button role="tab" aria-selected="false" data-ba-tab="after">After</button></div>
    <figure class="ba__f ba__f--before"><figcaption><span class="ba__lab">Before</span>リプレース前（月額契約・スマホ非対応）</figcaption><div class="frame frame--pc"><div class="frame__bar"><i></i><i></i><i></i><span>old-${w.slug}.example</span></div><iframe src="${demo}before.html" title="${esc(w.name)} リプレース前のHP" loading="lazy"></iframe></div><a class="link-arw" href="${demo}before.html" target="_blank" rel="noopener">別タブで開く ${arrow}</a></figure>
    <figure class="ba__f ba__f--after"><figcaption><span class="ba__lab ba__lab--after">After</span>Table Shift で作り替え（買い切り・月額0円）</figcaption><div class="frame frame--pc"><div class="frame__bar"><i></i><i></i><i></i><span>${w.slug}.example</span></div><iframe src="${demo}" title="${esc(w.name)} リプレース後のHP" loading="lazy"></iframe></div><a class="link-arw" href="${demo}" target="_blank" rel="noopener">別タブで開く ${arrow}</a></figure>
  </div>
</div></section>`
    : `<section class="sec"><div class="wrap">
  <div class="sec__head"><span class="eyebrow">Live Demo</span><h2 class="h2">完成したHPを、その場で触ってみてください。</h2><p class="lead">スマホとPCの両方の見え方を並べています。フレームの中はスクロール・タップできます。</p></div>
  <div class="devices">
    <div class="frame frame--pc"><div class="frame__bar"><i></i><i></i><i></i><span>${w.slug}.example</span></div><iframe src="${demo}" title="${esc(w.name)} デモサイト（PC表示）" loading="lazy"></iframe></div>
    <div class="frame frame--sp"><iframe src="${demo}" title="${esc(w.name)} デモサイト（スマホ表示）" loading="lazy"></iframe></div>
  </div>
  <p class="center"><a class="btn btn--ghost" href="${demo}" target="_blank" rel="noopener">デモサイトを全画面で開く ${arrow}</a></p>
</div></section>`;

  const body = `
<section class="work-hero" style="--c:${w.color}">
  <div class="wrap work-hero__in">
    <div class="work-hero__tags"><span class="tag tag--${w.service}">${svcLabel(w.service)}</span><span class="tag">${genreLabel(w.genre)}</span><span class="tag">${p.name}プラン</span>${w.purposes.map((k) => `<span class="tag tag--line">#${purposeLabel(k)}</span>`).join("")}</div>
    <h1 class="work-hero__t">${esc(w.name)}</h1>
    <p class="work-hero__catch">${esc(w.catch)}</p>
    ${w.demo ? `<p class="demo-note">※ この事例は、Table の制作力をご覧いただくための<strong>制作デモ（架空の店舗）</strong>です。実在の店舗・人物とは関係ありません。</p>` : ""}
  </div>
</section>

${beforeAfter}

<section class="sec sec--paper"><div class="wrap work-grid">
  <div class="work-main">
    <h2 class="h3">制作のポイント</h2>
    <p>${esc(w.summary)}</p>
    ${tech ? `<h3 class="h4">このデモで使った表現技法</h3><ul class="checks">${tech}</ul>` : ""}
    <h2 class="h3">店主コメント</h2>
    <blockquote class="voice"><p>${esc(w.comment)}</p><footer>— ${esc(w.name)} ${esc(w.who)}${w.demo ? `<span class="voice__note">（制作デモのための想定コメントです）</span>` : ""}</footer></blockquote>
  </div>
  <aside class="work-side">
    <dl class="spec">
      <div><dt>サービス</dt><dd>${svcLabel(w.service)}（${w.service === "web" ? "HP新規制作" : "HPリプレイス"}）</dd></div>
      <div><dt>業態</dt><dd>${genreLabel(w.genre)}</dd></div>
      <div><dt>プラン</dt><dd>${p.name}（${p.pages}ページ・メニュー${p.menu}品まで）</dd></div>
      <div><dt>定価（税別）</dt><dd>${yen(p.price)}〜<small>＋オプション</small></dd></div>
      <div><dt>目的</dt><dd>${w.purposes.map(purposeLabel).join("・")}</dd></div>
      <div><dt>導入したオプション・機能</dt><dd><ul>${w.options.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></dd></div>
      <div><dt>表現スタイル</dt><dd>${esc(w.skill)}<small>${esc(w.skillNote)}</small></dd></div>
    </dl>
    <a class="btn btn--primary btn--block" href="/contact/?service=${w.service}&amp;plan=${w.plan}&amp;ref=${w.slug}">この事例のように相談する ${arrow}</a>
    <a class="btn btn--ghost btn--block" href="/price/">料金を見る</a>
  </aside>
</div></section>

${others ? `<section class="sec"><div class="wrap"><div class="sec__head"><span class="eyebrow">More Works</span><h2 class="h2">近い条件の事例</h2></div>{{works slugs=${others} small}}<p class="center"><a class="link-arw" href="/works/">事例一覧へ ${arrow}</a></p></div></section>` : ""}
{{cta}}`;

  return {
    meta: {
      title: `${w.name}（${genreLabel(w.genre)}・${svcLabel(w.service)} ${p.name}）｜制作事例`,
      desc: `${genreLabel(w.genre)}「${w.name}」の${w.service === "web" ? "HP新規制作" : "HPリプレイス"}事例。${w.catch}`,
      nav: "works",
      crumbs: [["制作事例", "/works/"], [w.name]],
    },
    body,
  };
}
