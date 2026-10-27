/**
 * Davetiye yanıtlarını Google Sheets'e yazan Apps Script.
 * Kurulum adımları için README.md dosyasına bakın.
 */
const SHEET_NAME = 'Yanıtlar';
const HEADERS = ['Zaman', 'Ad Soyad', 'Durum', 'Yetişkin', 'Çocuk', 'Toplam Kişi', 'Not'];

// Hücre başındaki = + - @ karakterleri formül olarak çalışmasın
const safe = (v, max) => {
  const s = String(v || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
};

function doPost(e) {
  const p = e.parameter || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    const name = safe(p.name, 80);
    const status = ['Geliyor', 'Belki', 'Gelmiyor'].indexOf(p.status) >= 0 ? p.status : '?';
    const adults = Math.max(0, Math.min(10, Number(p.adults) || 0));
    const kids = Math.max(0, Math.min(10, Number(p.kids) || 0));
    const row = [new Date(), name, status, adults, kids, adults + kids, safe(p.note, 400)];

    // Aynı isimle "yanıtı değiştir" gelirse eski satırı güncelle
    let target = -1;
    if (p.update === '1' && sh.getLastRow() > 1) {
      const names = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
      for (let i = names.length - 1; i >= 0; i--) {
        if (String(names[i][0]).replace(/^'/, '').toLowerCase() === name.replace(/^'/, '').toLowerCase()) {
          target = i + 2;
          break;
        }
      }
    }
    if (target > 0) sh.getRange(target, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Davetiye servisi çalışıyor.');
}
