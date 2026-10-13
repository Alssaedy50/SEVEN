// SEVEN — shared test infrastructure: a controllable static file server and a
// puppeteer harness. Used by the regression suites in tests/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// Static server over ROOT with an in-memory overlay and a hard-offline switch.
// Reads from disk on every request so tests can observe file updates.
export function startServer({ port = 0 } = {}) {
  const overlay = new Map();
  let offline = false;
  const server = http.createServer((req, res) => {
    if (offline) { req.socket.destroy(); return; }
    const url = new URL(req.url, 'http://localhost');
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel.endsWith('/')) rel += 'index.html';
    if (overlay.has(rel)) {
      const body = overlay.get(rel);
      res.writeHead(200, { 'content-type': MIME[path.extname(rel)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
      return;
    }
    const abs = path.join(ROOT, rel);
    if (!abs.startsWith(ROOT) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
      return;
    }
    const body = fs.readFileSync(abs);
    res.writeHead(200, { 'content-type': MIME[path.extname(abs)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const { port: actual } = server.address();
      resolve({
        url: `http://127.0.0.1:${actual}`,
        overlay,
        setOffline: (v) => { offline = v; },
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

export async function launchBrowser() {
  return puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    headless: true,
    defaultViewport: { width: 480, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

// Click an element by firing a real DOM click. The app scrolls inside a
// container, so coordinate-based clicks miss off-screen controls; this still
// invokes the element's own click handler and any submit/change behavior.
export async function clickEl(page, selector) {
  await page.$eval(selector, (el) => el.click());
}

// A fresh browser context => isolated IndexedDB/localStorage/cookies per test.
export async function newSession(browser, baseUrl, { downloadDir } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  if (downloadDir) {
    const client = await page.createCDPSession();
    await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir, eventsEnabled: true });
  }
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#app-view', { timeout: 10000 });
  return { context, page };
}

/* ---------- UI driving helpers ---------- */
// The router renders asynchronously and does not cancel in-flight renders, so a
// slow earlier render can overwrite a newer one. These helpers only proceed
// after a render has started and finished, which keeps tests deterministic.
async function waitIdle(page) {
  await page.waitForFunction(
    () => document.querySelector('#app-view')?.getAttribute('aria-busy') === 'false',
    { timeout: 10000 },
  ).catch(() => {});
}

// Set the hash and wait for the resulting render to start and settle.
async function goto(page, hash) {
  await waitIdle(page);
  await page.evaluate((h) => { location.hash = h; }, hash);
  await page.waitForFunction(
    () => document.querySelector('#app-view')?.getAttribute('aria-busy') === 'true',
    { timeout: 5000 },
  ).catch(() => {});
  await waitIdle(page);
}

export async function nav(page, hash, waitSelector) {
  await goto(page, hash);
  if (waitSelector) await page.waitForSelector(waitSelector, { timeout: 10000 });
}

export async function createPatient(page, { fullName, phone }) {
  await nav(page, '#/patients/new', '#patient-form');
  await page.type('#patient-form [name="fullName"]', fullName);
  await page.type('#patient-form [name="phone"]', phone);
  await clickEl(page, '#patient-form button[type="submit"]');
  await page.waitForFunction(() => location.hash.startsWith('#/patients/') && !location.hash.endsWith('/new') && !location.hash.endsWith('/edit'), { timeout: 10000 });
  return page.evaluate(() => location.hash.replace('#/patients/', '').split('/')[0]);
}

export async function issueReceipt(page, { payerName, paidNow, totalAccount = '', services = [], patientId = '' }) {
  const hash = patientId ? `#/receipts/new?patient=${encodeURIComponent(patientId)}` : '#/receipts/new';
  await nav(page, hash, '#receipt-form');
  if (!patientId) await page.type('#receipt-form [name="payerName"]', payerName);
  if (totalAccount !== '') await page.evaluate((v) => { document.querySelector('#receipt-form [name="totalAccount"]').value = v; }, String(totalAccount));
  await page.evaluate((v) => { document.querySelector('#receipt-form [name="paidNow"]').value = v; document.querySelector('#receipt-form [name="paidNow"]').dispatchEvent(new Event('input', { bubbles: true })); }, String(paidNow));
  for (const s of services) await clickEl(page, `#receipt-form input[name="service"][value="${s}"]`);
  await clickEl(page, '#receipt-form button[type="submit"]');
  await page.waitForFunction(() => location.hash.startsWith('#/receipts/') && !location.hash.endsWith('/new'), { timeout: 10000 });
  return page.evaluate(() => location.hash.replace('#/receipts/', '').split('/')[0]);
}

// Read the app's IndexedDB through its own store module (real code path).
export async function dbSnapshot(page) {
  return page.evaluate(async () => {
    const store = await import('./src/js/store.js');
    return {
      patients: await store.listPatients({ includeArchived: true }),
      receipts: await store.listReceipts(),
      counts: await store.counts(),
    };
  });
}

export async function readAllStores(page) {
  return page.evaluate(async () => {
    const open = () => new Promise((res, rej) => {
      const r = indexedDB.open('seven', 1);
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    const db = await open();
    const read = (name) => new Promise((res, rej) => {
      const t = db.transaction(name, 'readonly');
      const rq = t.objectStore(name).getAll();
      rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
    });
    return {
      patients: await read('patients'),
      receipts: await read('receipts'),
      audits: await read('audits'),
      meta: await read('meta'),
    };
  });
}
