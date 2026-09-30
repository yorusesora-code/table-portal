/**
 * Table ポータル：フォームの受け口（Google Apps Script）
 *
 * サイトの3つのフォーム（無料相談・代理店の資料請求・代理店お申込み）から届いた内容を
 *   1. このスプレッドシートにフォームごとのシートで1行ずつ保存し
 *   2. 通知メールを CONFIG.NOTIFY_TO に送ります（任意で、お客さまへの自動返信も）。
 *
 * 設置のしかたは docs/form-setup.md を見てください。
 * このファイルはサイトには公開されません（dist/ に入らない）。
 */

const CONFIG = {
  NOTIFY_TO: 'info@kintoun-m.com',                 // 通知メールの宛先（カンマ区切りで複数可）
  FROM_NAME: 'Table（キントウンマーケティング株式会社）',
  REPLY_TO: 'info@kintoun-m.com',                  // 自動返信にお客さまが返信したときの宛先
  AUTO_REPLY: false,                               // true にするとお客さまへ「受け付けました」メールを送る
  SITE_URL: 'https://table-portal.pages.dev',
};

// フォームごとの保存先シートと、列（キー → 見出し）
const FORMS = {
  contact: {
    sheet: '無料相談', subject: '【Table 無料相談】',
    cols: [['shop', '店名'], ['name', 'ご担当者名'], ['email', 'メール'], ['tel', '電話番号'], ['genre', '業態'], ['hp', '現在のHP'],
      ['plan', '希望プラン'], ['delivery', 'デリバリー導入予定'], ['message', 'ご相談内容'], ['agent_code', '代理店コード'], ['via_agent', '代理店経由'], ['page', '送信ページ']],
  },
  download: {
    sheet: '代理店_資料請求', subject: '【Table 代理店 資料請求】',
    cols: [['company', '会社名・屋号'], ['name', 'お名前'], ['email', 'メール'], ['page', '送信ページ']],
  },
  apply: {
    sheet: '代理店_申込', subject: '【Table 代理店 お申込み】',
    cols: [['company', '会社名・屋号'], ['name', 'ご担当者名'], ['email', 'メール'], ['tel', '電話番号'], ['business', '現在の事業内容'], ['area', '主な営業エリア'], ['page', '送信ページ']],
  },
};

// 選択肢の値を、読める言葉に
const LABELS = {
  hp: { none: 'HPはない（Table Web）', old: 'HPはあるが古い（Table Shift）', unknown: 'わからない', 'delivery-only': 'HPの相談はなし（デリバリーの出店だけ）' },
  plan: { standard: 'スタンダード', upgrade: 'アップグレード', premium: 'プレミアム', undecided: '相談して決めたい' },
  delivery: { both: '2社とも新規で申し込みたい', one: '1社を新規で申し込みたい', already: 'すでに登録済み', no: '予定なし', ask: '話を聞きたい' },
  via_agent: { yes: 'はい' },
};

function doPost(e) {
  let d = {};
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'bad-json' }); }

  // 迷惑送信よけ：人には見えない欄に何か入っていたら、保存も通知もせず成功だけ返す
  if (d.website) return json_({ ok: true });

  const kind = FORMS[d.form] ? d.form : 'contact';
  const def = FORMS[kind];
  const email = String(d.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: 'email' });

  // 同じアドレスからの連続送信（60秒以内）は1回として扱う
  const cache = CacheService.getScriptCache(), key = 'sent:' + kind + ':' + email.toLowerCase();
  if (cache.get(key)) return json_({ ok: true, dup: true });
  cache.put(key, '1', 60);

  const val = (k) => {
    const raw = String(d[k] == null ? '' : d[k]).slice(0, 4000);
    return LABELS[k] && LABELS[k][raw] ? LABELS[k][raw] : raw;
  };

  // 1. シートに保存
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(def.sheet);
    if (!sh) {
      sh = ss.insertSheet(def.sheet);
      sh.appendRow(['受付日時'].concat(def.cols.map((c) => c[1])));
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, def.cols.length + 1).setFontWeight('bold').setBackground('#FFEEDD');
    }
    // 数式として解釈されないよう、先頭が = + - @ の値には ' を付ける
    const safe = (v) => (/^[=+\-@]/.test(v) ? "'" + v : v);
    sh.appendRow([new Date()].concat(def.cols.map((c) => safe(val(c[0])))));
  } finally {
    lock.releaseLock();
  }

  // 2. 通知メール
  const who = [val('shop') || val('company'), val('name')].filter(String).join('　');
  const body = def.cols.map((c) => '■ ' + c[1] + '\n' + (val(c[0]) || '（なし）')).join('\n\n');
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_TO,
    subject: def.subject + (who ? who + ' 様' : '') + (val('agent_code') ? '（代理店 ' + val('agent_code') + '）' : ''),
    body: 'サイトのフォームから送信がありました。\n\n' + body + '\n\n—\nスプレッドシート：' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    replyTo: email,
    name: 'Table フォーム通知',
  });

  // 3. お客さまへの自動返信（CONFIG.AUTO_REPLY が true のときだけ）
  if (CONFIG.AUTO_REPLY) {
    MailApp.sendEmail({
      to: email,
      subject: '【Table】お問い合わせを受け付けました',
      body: (val('name') || 'お客さま') + ' 様\n\nこのたびはお問い合わせいただき、ありがとうございます。\n以下の内容で受け付けました。1〜2営業日以内に担当よりご連絡いたします。\n\n' + body +
        '\n\n—\nTable（キントウンマーケティング株式会社）\n' + CONFIG.REPLY_TO + '\n' + CONFIG.SITE_URL + '\n※このメールは送信専用のアドレスから自動でお送りしています。ご返信は ' + CONFIG.REPLY_TO + ' へお願いします。',
      replyTo: CONFIG.REPLY_TO,
      name: CONFIG.FROM_NAME,
    });
  }
  return json_({ ok: true });
}

// 動作確認用：公開URLをブラウザで開くと「ok」と表示される
function doGet() { return ContentService.createTextOutput('ok'); }

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// エディタから一度だけ実行して、権限の許可とメール送信を確かめる
function testSend() {
  const res = doPost({ postData: { contents: JSON.stringify({ form: 'contact', shop: 'テスト店', name: 'テスト', email: CONFIG.NOTIFY_TO, message: 'フォーム受け口の動作確認です', page: 'test' }) } });
  Logger.log(res.getContent());
}
