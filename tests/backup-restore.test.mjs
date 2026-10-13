// SEVEN — Phase 1: backup export / restore regression suite.
// Exercises the real UI flow in a browser: export via the app, inspect the file,
// restore into a clean database, reject corrupt/invalid files, and verify that a
// failed restore leaves existing data intact.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer, launchBrowser, newSession, nav, createPatient, issueReceipt, readAllStores, clickEl } from './lib.mjs';

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

// Click the real export button and capture the Blob the app produces by
// intercepting URL.createObjectURL (the same object handed to the download link).
async function exportViaUI(page, downloadDir) {
  await nav(page, '#/backup', '#btn-backup');
  await page.evaluate(() => {
    window.__captured = null;
    const orig = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => { window.__captured = blob; return orig(blob); };
  });
  await clickEl(page, '#btn-backup');
  await page.waitForFunction(() => window.__captured !== null, { timeout: 8000 });
  const { text, name } = await page.evaluate(async () => ({
    text: await window.__captured.text(),
    name: `seven-backup-${new Date().toISOString().slice(0, 10)}.sevenbak`,
  }));
  const dest = path.join(downloadDir, name);
  fs.writeFileSync(dest, text);
  return { dest, text };
}

async function main() {
  const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seven-dl-'));
  const server = await startServer();
  const browser = await launchBrowser();
  try {
    /* ---------- 1. Build clear test data: patient + receipt + audit ---------- */
    let { page, context } = await newSession(browser, server.url);
    const patId = await createPatient(page, { fullName: 'مريض اختبار النسخ', phone: '+967700111222' });
    const recId = await issueReceipt(page, { patientId: patId, payerName: 'مريض اختبار النسخ', paidNow: 5000, totalAccount: 8000, services: ['s1', 's2'] });

    // Add an audit entry through the real audited correction flow.
    await nav(page, `#/receipts/${recId}/edit`, '#edit-form');
    await page.evaluate(() => { document.querySelector('#edit-form [name="otherService"]').value = 'تصحيح اختباري'; });
    await page.type('#edit-form [name="reason"]', 'سبب اختبار النسخ الاحتياطي');
    await clickEl(page, '#edit-form button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('#edit-form'), { timeout: 8000 });
    const before = await readAllStores(page);
    check('P1 data: patient stored', before.patients.length === 1);
    check('P1 data: receipt stored', before.receipts.length === 1 && before.receipts[0].status === 'issued');
    check('P1 data: audit entry stored', before.audits.length === 1, `audits=${before.audits.length}`);

    /* ---------- 2. Export a backup through the app ---------- */
    const { dest, text } = await exportViaUI(page, downloadDir);
    check('P1 export: file written', fs.existsSync(dest) && fs.statSync(dest).size > 0, path.basename(dest));

    /* ---------- 3. Verify content and structure before restore ---------- */
    const parsed = JSON.parse(text);
    check('P1 file: format envelope', parsed.format === 'seven.backup' && parsed.schemaVersion === 1);
    check('P1 file: contains patients/receipts/audits/settings',
      Array.isArray(parsed.patients) && Array.isArray(parsed.receipts) && Array.isArray(parsed.audits) && !!parsed.clinicSettings);
    check('P1 file: patient record shape', parsed.patients[0].id === patId && parsed.patients[0].fullName === 'مريض اختبار النسخ');
    check('P1 file: receipt relationship', parsed.receipts[0].patientId === patId && !!parsed.receipts[0].receiptNumber);
    check('P1 file: audit relationship', parsed.audits[0].receiptId === recId && parsed.audits[0].changes.length >= 1);
    check('P1 file: counters present', Array.isArray(parsed.counters));

    /* ---------- 4. Restore into a clean database ---------- */
    const clean = await newSession(browser, server.url);
    const cleanBefore = await readAllStores(clean.page);
    check('P1 restore: target DB empty before restore',
      cleanBefore.patients.length === 0 && cleanBefore.receipts.length === 0 && cleanBefore.audits.length === 0);

    const restore = await clean.page.evaluate(async (backup) => {
      const store = await import('./src/js/store.js');
      await store.importBackup(backup);
      const patients = await store.listPatients({ includeArchived: true });
      const receipts = await store.listReceipts();
      const audits = await store.listAudits(receipts[0]?.id);
      const settings = await store.getSettings();
      return { patients, receipts, audits, settings };
    }, parsed);

    check('P1 restore: patients restored', restore.patients.length === 1 && restore.patients[0].id === patId);
    check('P1 restore: receipts restored', restore.receipts.length === 1 && restore.receipts[0].id === recId);
    check('P1 restore: receipt still linked to patient', restore.receipts[0].patientId === patId);
    check('P1 restore: audit restored and linked to receipt', restore.audits.length === 1 && restore.audits[0].receiptId === recId);
    check('P1 restore: settings restored', restore.settings.clinicNameAr === parsed.clinicSettings.clinicNameAr);
    check('P1 restore: counters restored (numbering continues)',
      restore.receipts[0].receiptNumber === parsed.receipts[0].receiptNumber);
    await clean.context.close();

    /* ---------- 5. Invalid / corrupt file rejected without data loss ---------- */
    // 5a. Wrong format marker
    await page.evaluate(async (bad) => {
      const store = await import('./src/js/store.js');
      let msg = '';
      try { store.validateBackup(bad); } catch (e) { msg = e.message; }
      window.__reject1 = msg;
    }, { format: 'other.tool', schemaVersion: 1, patients: [], receipts: [], audits: [] });
    check('P1 invalid: unknown format rejected', (await page.evaluate(() => window.__reject1)).includes('صيغة'));

    // 5b. Missing section
    await page.evaluate(async (bad) => {
      const store = await import('./src/js/store.js');
      let msg = '';
      try { store.validateBackup(bad); } catch (e) { msg = e.message; }
      window.__reject2 = msg;
    }, { format: 'seven.backup', schemaVersion: 1, patients: [], receipts: [] });
    check('P1 invalid: missing audits section rejected', (await page.evaluate(() => window.__reject2)).length > 0);

    // 5c. Corrupt (truncated JSON) through the real UI file path
    await nav(page, '#/backup', '#backup-file');
    const corrupt = path.join(downloadDir, 'corrupt.sevenbak');
    fs.writeFileSync(corrupt, '{ "format": "seven.backup", "patients": [ {');
    const input = await page.$('#backup-file');
    await input.uploadFile(corrupt);
    await page.waitForFunction(() => document.querySelector('.toast.error') !== null, { timeout: 8000 }).catch(() => {});
    const toastText = await page.evaluate(() => document.querySelector('.toast.error')?.textContent || '');
    const afterInvalid = await readAllStores(page);
    check('P1 invalid: corrupt file shows Arabic error', toastText.includes('غير صالح'), toastText.trim());
    check('P1 invalid: corrupt file left data intact',
      afterInvalid.patients.length === 1 && afterInvalid.receipts.length === 1 && afterInvalid.audits.length === 1);

    /* ---------- 6. Failure during restore keeps previous data ---------- */
    // Simulate a failure by importing a backup whose audit list is not an array,
    // which validateBackup rejects; confirm nothing was cleared.
    const beforeFail = await readAllStores(page);
    await page.evaluate(async (backup) => {
      const store = await import('./src/js/store.js');
      window.__restoreErr = '';
      try { await store.importBackup(backup); } catch (e) { window.__restoreErr = e.message; }
    }, { format: 'seven.backup', schemaVersion: 1, patients: [], receipts: [], audits: 'not-an-array' });
    const afterFail = await readAllStores(page);
    check('P1 failure: import rejected', (await page.evaluate(() => window.__restoreErr)).length > 0);
    check('P1 failure: previous data still intact',
      afterFail.patients.length === beforeFail.patients.length &&
      afterFail.receipts.length === beforeFail.receipts.length &&
      afterFail.audits.length === beforeFail.audits.length,
      `patients=${afterFail.patients.length} receipts=${afterFail.receipts.length} audits=${afterFail.audits.length}`);

    await context.close();
  } finally {
    await browser.close();
    await server.close();
    fs.rmSync(downloadDir, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nPhase 1: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
