# Table ポータル（Table Web / Table Shift）

飲食店向けHP制作事業のポータルサイト。静的HTML（依存なし）で、Cloudflare Pages などにそのまま置けます。

## 使い方

```bash
node tools/build.mjs   # src/pages と tools/data.mjs から全ページを生成
node tools/serve.mjs   # http://localhost:4321 で確認
```

- **料金・オプション・FAQ・事例・記事一覧のデータ** → `tools/data.mjs`（価格は「TableWeb_制作申込書兼同意書202609」を正としています）
- **ページ本文** → `src/pages/**.html`（先頭のコメントがタイトル等のメタ情報。`{{works limit=3}}` のような記法で部品を差し込み）
- **部品（料金表・事例カード・シミュレーター等）とヘッダー/フッター** → `tools/build.mjs`
- **事例の詳細ページ** → `tools/work-detail.mjs`（`WORKS` の1件から自動生成）
- 生成物（`index.html`, `service/`, `price/` など）は直接編集しないでください。

## ページ構成（生成 28ページ＋デモ）

| パス | 内容 |
|---|---|
| `/` | トップ：HPなし／ありの2導線分岐、料金早見表、キャンペーン、事例、流れ、FAQ、記事 |
| `/service/` `/service/table-web/` `/service/table-shift/` `/service/options/` | サービス。Shift に節約シミュレーター（既存LPから移植、新価格に更新） |
| `/price/` | プラン比較・オプション加算・キャンペーン適用後価格・見積りシミュレーター |
| `/works/` `/works/{slug}/` | フィルタ付き事例一覧（業態×プラン×目的、URLに状態保持）と詳細 |
| `/works/demo/{slug}/` | 各HP作成スキルで作った触れるデモサイト（架空店舗） |
| `/industry/` `/industry/restaurant/` | 業種別入口（美容室などは `INDUSTRIES` に追加して `src/pages/industry/xxx.html` を作る） |
| `/column/` ＋3記事 | SEO記事。末尾で関連事例に相互リンク |
| `/flow/` `/faq/` `/contact/` | 流れ・FAQ・相談フォーム（代理店コード欄あり） |
| `/partner/` | 代理店募集・資料DL・申込（一般の動線から分離） |
| `/company/` `/legal/*` | 会社概要・特商法・プライバシー・規約 |

## 制作事例デモとスキルの対応

| 事例 | スキル |
|---|---|
| 炭火やきとり とりまる | kinetic-marquee-site |
| ひだまり珈琲 | illustrated-stage-site |
| 麺処 こがね（Before/After） | css-motion-effects |
| 鮨 なぎさ（Before/After・4言語） | apple-design |
| パティスリー ミエル | creator-official-site |
| トラットリア ソーレ（日英） | css-microanimation |

ポータル本体：apple-design（半透明ヘッダー・押下即応）＋ css-microanimation（チップ・アコーディオン・チェック）＋ css-motion-effects（一度だけの登場）。

## 代理店コードの仕組み

- `/contact/?agent=TA-0123` で来た人は代理店コードが自動入力されます（同じタブ内なら他ページを経由しても保持）。
- 送信データに `agent_code` が入るので、スプレッドシート側で集計できます。

## 公開前に必要な作業

- [ ] `tools/data.mjs` の `SITE.formEndpoint` にフォーム送信先（GAS等）を設定。空のままだと送信されず完了表示だけ出ます
- [ ] `SITE.url` を公開URLに。`assets/img/ogp.png`（1200×630）を用意
- [ ] 会社概要・特商法・プライバシーポリシーの【要記入】を埋める
- [ ] 代理店報酬「一律50%」を載せる場合は `SITE.showPartnerReward: true`
- [ ] 代理店資料DLフォームの送信後に、実際の資料を送る運用を決める
- [ ] 実案件が出たら `WORKS` に `demo: false` で追加し、サムネイルを `assets/img/works/{slug}.jpg`（800×560）に置く

## 下層ページのデザイン（2026-09 トップに統一）
- 全ページがトップと同じヘッダー・円ワイプメニュー・CONTACT帯・フッターを使います（`tools/build.mjs` の `header()` / `C.navi` / `C.cta` / `C.foot`）。
- CSS は `assets/css/top.css`（共通の部品）＋ `assets/css/sub.css`（下層ページ用）。JS は `assets/js/chrome.js`（メニュー・見出しの文字演出・手書き線・オプション選択）を全ページで読み込みます。
- 見出しの小さな島は `tools/sub-art.mjs`（`{{ill k=flow}}` など）。
- 販売金額はどのページにも出しません（プラン表は `{{planTable noprice}}`、オプション表は「含む／追加可」だけ）。
- `assets/css/site.css` は制作事例（`showWorks:true`）の旧デザイン用に残しています。
