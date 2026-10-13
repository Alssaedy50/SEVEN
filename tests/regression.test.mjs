// SEVEN — Phase 3: full regression and safety suite.
// Runs the whole existing behavior: JS syntax, static reference integrity, all
// navigation destinations, receipt issue/void/correct with numbering + audit
// integrity, and service-worker freshness (no stale JS when online).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { startServer, launchBrowser, newSession, nav, createPatient, issueReceipt, readAllStores, clickEl, ROOT } from './lib.mjs';

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/* ---------- 3a. Static JavaScript syntax + reference integrity ---------- */
function staticChecks() {
  const jsFiles = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) jsFiles.push(p);
    }
  };
  walk(path.join(ROOT, 'src'));
  jsFiles.push(path.join(ROOT, 'sw.js'));

  let syntaxOk = true;
  let syntaxDetail = '';
  for (const f of jsFiles) {
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    } catch (err) {
      syntaxOk = false;
      syntaxDetail = `${path.relative(ROOT, f)}: ${String(err.stderr || err.message).split('\n')[0]}`;
      break;
    }
  }
  check('P3 syntax: all JavaScript parses', syntaxOk, syntaxDetail || `${jsFiles.length} files`);

  // Every local asset referenced by index.html/manifest/css must exist.
  const refs = new Set();
  const grab = (file, re) => {
    if (!fs.existsSync(file)) return;
    const txt = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(txt))) refs.add(m[1]);
  };
  grab(path.join(ROOT, 'index.html'), /(?:src|href)="(\.\/[^"]+)"/g);
  grab(path.join(ROOT, 'manifest.webmanifest'), /"src":\s*"(\.\/[^"]+)"/g);
  const missing = [...refs].filter((r) => !fs.existsSync(path.join(ROOT, r.replace(/^\.\//, ''))));
  check('P3 integrity: referenced local assets exist', missing.length === 0, missing.join(', '));

  // Every module import resolves to an existing file.
  const badImports = [];
  const importRe = /from\s+'(\.\/[^']+)'/g;
  for (const f of jsFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = importRe.exec(txt))) {
      const target = path.resolve(path.dirname(f), m[1]);
      if (!fs.existsSync(target)) badImports.push(`${path.relative(ROOT, f)} -> ${m[1]}`);
    }
  }
  check('P3 integrity: module imports resolve', badImports.length === 0, badImports.join(', '));
}

/* ---------- Browser suites ---------- */
async function main() {
  staticChecks();

  const server = await startServer();
  const browser = await launchBrowser();
  try {
    const { page, context } = await newSession(browser, server.url);
    const consoleErrors = [];
    page.on('pageerror', (e) => consoleErrors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

    /* ---------- 3b. Every navigation destination renders ---------- */
    const patId = await createPatient(page, { fullName: 'مريض الانحدار', phone: '+967722333444' });
    const recId = await issueReceipt(page, { patientId: patId, payerName: 'مريض الانحدار', paidNow: 1000, totalAccount: 2000, services: ['s1'] });
    const routes = [
      ['#/home', '#app-view .hero'],
      ['#/patients', '#app-view .list'],
      ['#/patients/new', '#patient-form'],
      [`#/patients/${patId}`, '#app-view .card'],
      [`#/patients/${patId}/edit`, '#patient-form'],
      ['#/receipts', '#app-view .list, #app-view .state'],
      ['#/receipts/new', '#receipt-form'],
      [`#/receipts/${recId}`, '#app-view .receipt-a5'],
      [`#/receipts/${recId}/edit`, '#edit-form'],
      ['#/settings', '#settings-form'],
      ['#/backup', '#btn-backup'],
    ];
    for (const [hash, sel] of routes) {
      try {
        await nav(page, hash, sel);
        check(`P3 route renders: ${hash}`, true);
      } catch (e) {
        check(`P3 route renders: ${hash}`, false, e.message);
      }
    }

    /* ---------- 3c. Receipt numbering: unique, sequential, never reused ---------- */
    const r2 = await issueReceipt(page, { patientId: patId, payerName: 'مريض الانحدار', paidNow: 1000, totalAccount: 1000, services: ['s2'] });
    let store = await readAllStores(page);
    const nums = store.receipts.map((r) => r.receiptNumber).sort();
    check('P3 numbering: numbers unique', new Set(nums).size === nums.length, nums.join(', '));
    check('P3 numbering: sequential REC-YYYY-NNNN', nums[0] === 'REC-2026-0001' && nums[1] === 'REC-2026-0002', nums.join(', '));

    /* ---------- 3d. Void keeps number and does not reuse it ---------- */
    await page.evaluate(async (id) => {
      const store = await import('./src/js/store.js');
      await store.voidReceipt(id, 'اختبار الإبطال');
    }, recId);
    store = await readAllStores(page);
    const voided = store.receipts.find((r) => r.id === recId);
    check('P3 void: status is voided', voided.status === 'voided' && voided.receiptNumber === 'REC-2026-0001');
    const r3 = await issueReceipt(page, { patientId: patId, payerName: 'مريض الانحدار', paidNow: 500, totalAccount: 500, services: [] });
    store = await readAllStores(page);
    const third = store.receipts.find((r) => r.id === r3);
    check('P3 void: voided number not reused', third.receiptNumber === 'REC-2026-0003', third.receiptNumber);

    /* ---------- 3e. Correction audit integrity ---------- */
    await nav(page, `#/receipts/${r2}/edit`, '#edit-form');
    await page.$eval('#edit-form [name="otherService"]', (el) => { el.value = 'تنظيف إضافي'; });
    await page.type('#edit-form [name="reason"]', 'تصحيح وصف الخدمة');
    await clickEl(page, '#edit-form button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('#edit-form'), { timeout: 8000 });
    store = await readAllStores(page);
    let audits = store.audits.filter((a) => a.receiptId === r2);
    check('P3 audit: correction recorded', audits.length === 1, `audits=${audits.length}`);
    const a1 = audits[0];
    check('P3 audit: has reason', a1.reason === 'تصحيح وصف الخدمة');
    check('P3 audit: has timestamp', typeof a1.changedAt === 'number' && a1.changedAt > 0);
    check('P3 audit: has old/new values', a1.changes.some((c) => c.field === 'otherService' && c.oldValue === '' && c.newValue === 'تنظيف إضافي'));
    check('P3 audit: correction sequence', a1.correctionSequence === 1);

    // Locked financial/identity fields must not change through correctReceipt.
    const locked = await page.evaluate(async (id) => {
      const store = await import('./src/js/store.js');
      const before = await store.getReceipt(id);
      await store.correctReceipt(id, { paidNowMinor: 999999, receiptNumber: 'HACK-1', patientId: 'other', currencyCode: 'USD' }, 'محاولة تغيير حقول مقفلة');
      const after = await store.getReceipt(id);
      return { before, after };
    }, r2);
    check('P3 locked fields: amounts/number/patient/currency unchanged',
      locked.after.paidNowMinor === locked.before.paidNowMinor &&
      locked.after.receiptNumber === locked.before.receiptNumber &&
      locked.after.patientId === locked.before.patientId &&
      locked.after.currencyCode === locked.before.currencyCode);

    // Second real correction increments the sequence.
    await page.evaluate(async (id) => {
      const store = await import('./src/js/store.js');
      await store.correctReceipt(id, { notes: 'ملاحظة ثانية' }, 'تصحيح ثانٍ');
    }, r2);
    store = await readAllStores(page);
    audits = store.audits.filter((a) => a.receiptId === r2);
    check('P3 audit: second correction increments sequence', audits.length === 2 && audits[1].correctionSequence === 2, `n=${audits.length}`);

    // Voided receipts cannot be corrected.
    const voidCorrect = await page.evaluate(async (id) => {
      const store = await import('./src/js/store.js');
      try { await store.correctReceipt(id, { notes: 'x' }, 'سبب'); return 'allowed'; } catch (e) { return e.message; }
    }, recId);
    check('P3 audit: voided receipt correction blocked', voidCorrect !== 'allowed', voidCorrect);

    /* ---------- 3f. Service worker: no stale JS when online ---------- */
    const swControlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
    check('P3 sw: page is controlled by the service worker', swControlled);

    const beforeText = await page.evaluate(() => fetch('./src/js/views.js').then((r) => r.text()));
    const real = fs.readFileSync(path.join(ROOT, 'src/js/views.js'), 'utf8');
    server.overlay.set('/src/js/views.js', real + "\nexport const FRESH_MARKER = 'FRESH_MARKER';\n");
    const afterText = await page.evaluate(() => fetch('./src/js/views.js').then((r) => r.text()));
    check('P3 sw: online fetch returns fresh JS, not stale cache',
      !beforeText.includes('FRESH_MARKER') && afterText.includes('FRESH_MARKER'));
    server.overlay.delete('/src/js/views.js');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#app-view');
    server.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await new Promise((r) => setTimeout(r, 800));
    const offlineOk = await page.evaluate(() => {
      const v = document.querySelector('#app-view');
      return !!v && v.innerHTML.length > 100;
    });
    check('P3 sw: offline shell still renders', offlineOk);
    server.setOffline(false);

    /* ---------- 3g. No console errors during main workflows ---------- */
    const noisy = consoleErrors.filter((m) => !/favicon|Download the React|DevTools/i.test(m));
    check('P3 console: no page errors during workflows', noisy.length === 0, noisy.slice(0, 3).join(' | '));

    await context.close();
  } finally {
    await browser.close();
    await server.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nPhase 3: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
