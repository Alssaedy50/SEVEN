// SEVEN — Phase 2: patient record edit regression suite.
// Creates a patient, edits a single field, verifies persistence across reload,
// confirms untouched fields are unchanged, checks validation rules for invalid
// and empty input, verifies related receipts/screens reflect the patient data,
// and confirms the current audit policy does not fabricate audit records for
// patient edits.
import { startServer, launchBrowser, newSession, nav, createPatient, issueReceipt, readAllStores, clickEl } from './lib.mjs';

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const TYPE = async (page, selector, text) => page.type(selector, text);

async function main() {
  const server = await startServer();
  const browser = await launchBrowser();
  try {
    const { page, context } = await newSession(browser, server.url);

    /* ---------- 1. Create a test patient ---------- */
    const patId = await createPatient(page, { fullName: 'سالم علي الاختبار', phone: '+967711222333' });
    let store = await readAllStores(page);
    const original = store.patients.find((p) => p.id === patId);
    check('P2 create: patient persisted', !!original && original.fullName === 'سالم علي الاختبار');
    check('P2 create: phone normalized', original.phone === '+967711222333', original.phone);

    /* ---------- 2. Edit one field and confirm persistence after reload ---------- */
    await nav(page, `#/patients/${patId}/edit`, '#patient-form');
    // Clear and retype the name only.
    await page.$eval('#patient-form [name="fullName"]', (el) => { el.value = ''; });
    await TYPE(page, '#patient-form [name="fullName"]', 'سالم علي المعدّل');
    await clickEl(page, '#patient-form button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('#patient-form'), { timeout: 8000 });

    // Full page reload, then read through the store module again.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#app-view', { timeout: 8000 });
    await nav(page, `#/patients/${patId}`, '#app-view .card');
    store = await readAllStores(page);
    const edited = store.patients.find((p) => p.id === patId);
    check('P2 edit: new name persisted after reload', edited.fullName === 'سالم علي المعدّل', edited.fullName);
    check('P2 edit: id unchanged', edited.id === patId);
    check('P2 edit: createdAt unchanged', edited.createdAt === original.createdAt);
    check('P2 edit: phone (untouched field) unchanged', edited.phone === original.phone, edited.phone);
    check('P2 edit: archivedAt (untouched field) unchanged', edited.archivedAt === original.archivedAt);
    check('P2 edit: updatedAt advanced', edited.updatedAt >= original.updatedAt);

    /* ---------- 3. Detail screen shows the updated value ---------- */
    const detailName = await page.$eval('#app-view h2', (el) => el.textContent.trim());
    check('P2 screen: detail shows updated name', detailName === 'سالم علي المعدّل', detailName);
    const detailPhone = await page.$eval('#app-view a[href^="tel:"]', (el) => el.textContent.replace(/\s+/g, ' ').trim());
    check('P2 screen: detail shows unchanged phone', detailPhone.includes('+967711222333'), detailPhone);

    /* ---------- 4. Invalid and empty input follows validation rules ---------- */
    // 4a. Blank name
    await nav(page, `#/patients/${patId}/edit`, '#patient-form');
    await page.$eval('#patient-form [name="fullName"]', (el) => { el.value = ''; });
    await clickEl(page, '#patient-form button[type="submit"]');
    let stillForm = await page.evaluate(() => !!document.querySelector('#patient-form'));
    let invalidName = await page.evaluate(() => document.querySelector('[data-field="fullName"]').classList.contains('invalid'));
    check('P2 validation: blank name rejected', stillForm && invalidName);
    store = await readAllStores(page);
    check('P2 validation: blank name did not overwrite stored value',
      store.patients.find((p) => p.id === patId).fullName === 'سالم علي المعدّل');

    // 4b. Invalid phone (too few digits)
    await page.$eval('#patient-form [name="phone"]', (el) => { el.value = '123'; });
    await clickEl(page, '#patient-form button[type="submit"]');
    const invalidPhone = await page.evaluate(() => document.querySelector('[data-field="phone"]').classList.contains('invalid'));
    check('P2 validation: malformed phone rejected', invalidPhone);
    store = await readAllStores(page);
    check('P2 validation: malformed phone did not overwrite stored value',
      store.patients.find((p) => p.id === patId).phone === '+967711222333');

    // 4c. Whitespace-only name is treated as blank (trim rule)
    await page.$eval('#patient-form [name="fullName"]', (el) => { el.value = '   '; });
    await page.$eval('#patient-form [name="phone"]', (el) => { el.value = '+967711222333'; });
    await clickEl(page, '#patient-form button[type="submit"]');
    const blankOnly = await page.evaluate(() => !!document.querySelector('#patient-form'));
    check('P2 validation: whitespace-only name rejected', blankOnly);

    // 4d. Valid phone with formatting characters is normalized
    await page.$eval('#patient-form [name="fullName"]', (el) => { el.value = 'سالم علي المعدّل'; });
    await page.$eval('#patient-form [name="phone"]', (el) => { el.value = '+967 711-222-333'; });
    await clickEl(page, '#patient-form button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('#patient-form'), { timeout: 8000 });
    store = await readAllStores(page);
    check('P2 validation: formatted phone normalized on save',
      store.patients.find((p) => p.id === patId).phone === '+967711222333');

    /* ---------- 5. Correct patient data appears in related receipts/screens ---------- */
    const recId = await issueReceipt(page, { patientId: patId, payerName: 'سالم علي المعدّل', paidNow: 3000, totalAccount: 3000, services: ['s1'] });
    // Rename the patient, then confirm the issued receipt keeps its snapshot but
    // the live association screen shows the updated name.
    await nav(page, `#/patients/${patId}/edit`, '#patient-form');
    await page.$eval('#patient-form [name="fullName"]', (el) => { el.value = ''; });
    await TYPE(page, '#patient-form [name="fullName"]', 'سالم علي النهائي');
    await clickEl(page, '#patient-form button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('#patient-form'), { timeout: 8000 });

    store = await readAllStores(page);
    const receipt = store.receipts.find((r) => r.id === recId);
    check('P2 receipts: receipt linked to patient', receipt.patientId === patId);
    check('P2 receipts: issued snapshot preserved (history not rewritten)',
      receipt.payerNameSnapshot === 'سالم علي المعدّل', receipt.payerNameSnapshot);

    // Receipt detail screen should link to the patient with the updated name.
    await nav(page, `#/receipts/${recId}`, '#app-view .tile');
    const linkedName = await page.evaluate(() => {
      const tile = [...document.querySelectorAll('#app-view .tile')].find((t) => t.getAttribute('href')?.startsWith('#/patients/'));
      return tile ? tile.querySelector('p')?.textContent.trim() : null;
    });
    check('P2 receipts: receipt screen shows updated patient name', linkedName === 'سالم علي النهائي', linkedName);

    // Patient detail lists the receipt.
    await nav(page, `#/patients/${patId}`, '#app-view .list-row');
    const listedReceipt = await page.evaluate(() => document.querySelector('#app-view .list-row .t')?.textContent.trim());
    check('P2 receipts: patient detail lists related receipt', listedReceipt === receipt.receiptNumber, listedReceipt);

    /* ---------- 6. No fabricated audit records for patient edits ---------- */
    const auditsAfter = store.audits;
    check('P2 audit policy: patient edits create no audit records', auditsAfter.length === 0, `audits=${auditsAfter.length}`);

    await context.close();
  } finally {
    await browser.close();
    await server.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nPhase 2: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
