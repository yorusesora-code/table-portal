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
  AUTO_REPLY: true,                                // お客さまへ「受け付けました」メールを送る（止めるときは false）
  SITE_URL: 'https://table-portal.pages.dev',      // 本公開でURLが変わったら差し替え
  ADDRESS: '〒150-0011 東京都渋谷区東1-27-7 渋谷東KMビル 7F',
  TEL: '03-6427-2133',
};

// 自動返信の文面（フォームごと）
const REPLY = {
  contact: {
    subject: '【Table】ご相談を受け付けました｜飲食店のHP制作',
    thanks: 'このたびは Table（飲食店のHP制作）にご相談いただき、誠にありがとうございます。',
    next: '内容を確認のうえ、1〜2営業日以内に担当よりメールまたはお電話でご連絡いたします。',
  },
  download: {
    subject: '【Table】代理店向け資料のご請求を受け付けました',
    thanks: 'このたびは Table 販売代理店の資料をご請求いただき、誠にありがとうございます。',
    next: '担当より、ご入力のメールアドレスあてに資料をお送りいたします。',
  },
  apply: {
    subject: '【Table】代理店のお申込みを受け付けました',
    thanks: 'このたびは Table 販売代理店にお申込みいただき、誠にありがとうございます。',
    next: '内容を確認のうえ、担当より面談（オンライン可）の日程についてご連絡いたします。',
  },
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
    const r = REPLY[kind];
    // お客さまに見せる控え（送信ページなど社内向けの項目は除く。未入力は「（未入力）」）
    const copy = def.cols.filter((c) => !['page', 'via_agent'].includes(c[0]) && !(c[0] === 'agent_code' && !val('agent_code')))
      .map((c) => c[0] === 'message' ? '■ ' + c[1] + '\n' + (val(c[0]) || '（未入力）') : '■ ' + c[1] + '：' + (val(c[0]) || '（未入力）'))
      .join('\n');
    const line = '――――――――――――――――――――';
    MailApp.sendEmail({
      to: email,
      subject: r.subject,
      body: [
        (val('name') || 'お客さま') + ' 様', '',
        r.thanks, '以下の内容で受け付けました。', '',
        line, copy, line, '',
        r.next,
        'ご不明な点や、内容の追加・訂正がございましたら、このメールにそのままご返信ください。', '',
        '今後ともどうぞよろしくお願いいたします。', '',
        '──────────',
        'Table（テーブル）｜飲食店のHP制作',
        'キントウンマーケティング株式会社',
        CONFIG.ADDRESS,
        'TEL ' + CONFIG.TEL + '　MAIL ' + CONFIG.REPLY_TO,
        CONFIG.SITE_URL,
        '──────────',
        '※このメールはフォームの送信内容をもとに自動でお送りしています。',
        '　お心当たりのない場合は、お手数ですが本メールを破棄してください。',
      ].join('\n'),
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
