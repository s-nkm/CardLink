// ============================================================
// CardLink - Google Apps Script バックエンド
// ============================================================
// 【セットアップ手順】
// 1. Google Sheetsで新規スプレッドシートを作成
// 2. 拡張機能 → Apps Script を開く
// 3. このファイルの内容を貼り付ける
// 4. SHEET_NAME が "Contacts" であることを確認
// 5. 「デプロイ」→「新しいデプロイ」→ 種類: ウェブアプリ
// 6. 実行するユーザー: 自分 / アクセスできるユーザー: 全員
// 7. デプロイURLをアプリの設定画面に貼り付ける
// ============================================================

const SHEET_NAME = 'Contacts';

// ── シートのヘッダー行を初期化（初回のみ） ──────────────────
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id','name','position','company','email','tel','web','venue','tag','heat','memos','created_at']);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
  }
  return sheet;
}

// ── CORSヘッダー付きレスポンス ───────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET: 全連絡先を取得 ──────────────────────────────────────
// クエリ例: ?action=list
// 削除例:   ?action=delete&id=1714291234
function doGet(e) {
  try {
    const action = e.parameter.action || 'list';

    if (action === 'delete') {
      const id = e.parameter.id;
      if (!id) return jsonResponse({ ok: false, error: 'id required' });
      const result = deleteContact(id);
      return jsonResponse(result);
    }

    // action === 'list'
    const sheet = initSheet();
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return jsonResponse({ ok: true, contacts: [] });

    const headers = rows[0];
    const contacts = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      // memosはJSON文字列 → 配列に戻す
      try { obj.memos = JSON.parse(obj.memos || '[]'); } catch { obj.memos = []; }
      return obj;
    });

    return jsonResponse({ ok: true, contacts });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── POST: 連絡先を追加 or 更新 ──────────────────────────────
// body: { action: 'upsert', contact: {...} }
// body: { action: 'delete', id: '...' }
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'upsert';

    if (action === 'delete') {
      const result = deleteContact(body.id);
      return jsonResponse(result);
    }

    // action === 'upsert'
    const contact = body.contact;
    if (!contact) return jsonResponse({ ok: false, error: 'contact required' });

    const sheet = initSheet();
    const rows = sheet.getDataRange().getValues();

    // memosを文字列化
    const memosStr = JSON.stringify(contact.memos || []);

    // 既存IDを検索（更新）
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(contact.id)) {
          // 既存行を更新
          sheet.getRange(i + 1, 1, 1, 12).setValues([[
            contact.id,
            contact.name || '',
            contact.position || '',
            contact.company || '',
            contact.email || '',
            contact.tel || '',
            contact.web || '',
            contact.venue || '',
            contact.tag || '',
            contact.heat || '',
            memosStr,
            contact.created_at || new Date().toISOString().split('T')[0]
          ]]);
          return jsonResponse({ ok: true, action: 'updated', id: contact.id });
        }
      }
    }

    // 新規追加
    const id = contact.id || String(Date.now());
    sheet.appendRow([
      id,
      contact.name || '',
      contact.position || '',
      contact.company || '',
      contact.email || '',
      contact.tel || '',
      contact.web || '',
      contact.venue || '',
      contact.tag || '',
      contact.heat || '',
      memosStr,
      contact.created_at || new Date().toISOString().split('T')[0]
    ]);

    return jsonResponse({ ok: true, action: 'created', id });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── 内部: IDで行を削除 ──────────────────────────────────────
function deleteContact(id) {
  const sheet = initSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { ok: true, action: 'deleted', id };
    }
  }
  return { ok: false, error: 'not found', id };
}
