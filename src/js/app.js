// SEVEN — application bootstrap and hash router.
import { qs, toast } from './utils.js';
import { navItems } from './views.js';
import {
  homeView, patientsView, patientFormView, patientDetailView,
  receiptFormView, receiptHistoryView, receiptDetailView, receiptEditView,
  settingsView, backupView,
} from './views.js';

const ROUTES = [
  { pattern: /^home$/, view: homeView },
  { pattern: /^patients$/, view: patientsView },
  { pattern: /^patients\/new$/, view: patientFormView },
  { pattern: /^patients\/([^/]+)\/edit$/, view: patientFormView },
  { pattern: /^patients\/([^/]+)$/, view: patientDetailView },
  { pattern: /^receipts$/, view: receiptHistoryView },
  { pattern: /^receipts\/new$/, view: receiptFormView },
  { pattern: /^receipts\/([^/]+)\/edit$/, view: receiptEditView },
  { pattern: /^receipts\/([^/]+)$/, view: receiptDetailView },
  { pattern: /^settings$/, view: settingsView },
  { pattern: /^backup$/, view: backupView },
];

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, queryStr] = raw.split('?');
  return { path: path || 'home', query: new URLSearchParams(queryStr || '') };
}

function matchRoute(path) {
  for (const r of ROUTES) {
    const m = path.match(r.pattern);
    if (m) return { view: r.view, params: m.slice(1).map(decodeURIComponent) };
  }
  return null;
}

const app = {
  view: qs('#app-view'),
  header: qs('#app-header'),
  nav: qs('#app-nav'),
};

export function navigate(to, { replace = false } = {}) {
  const hash = `#/${String(to).replace(/^\/?#?\/?/, '')}`;
  // Both assignments trigger hashchange, which performs the render.
  if (replace) location.replace(hash);
  else location.hash = hash;
}

async function render() {
  const { path, query } = parseHash();
  const match = matchRoute(path);
  const view = match ? match.view : homeView;
  const params = match ? match.params : [];

  app.view.setAttribute('aria-busy', 'true');
  try {
    const result = await view.render({ params, query, navigate });
    app.header.innerHTML = result.header || '';
    app.view.innerHTML = result.body || '';
    const showNav = result.showNav !== false;
    app.view.classList.toggle('no-nav', !showNav);
    app.nav.innerHTML = showNav ? navSlot(path) : '';
    app.nav.style.display = showNav ? '' : 'none';
    if (result.onMount) result.onMount(app.view);
  } catch (err) {
    console.error(err);
    app.header.innerHTML = '';
    app.view.innerHTML = `<div class="state"><h3>تعذّر تحميل الصفحة</h3><p>${String(err.message || err)}</p>
      <a class="btn btn-outline" href="#/home">العودة للرئيسية</a></div>`;
    toast('حدث خطأ أثناء تحميل الصفحة', 'error');
  } finally {
    app.view.setAttribute('aria-busy', 'false');
    window.scrollTo({ top: 0 });
  }
}

function navSlot(path) {
  const active = path.startsWith('patients') ? 'patients'
    : path.startsWith('receipts') ? 'receipts'
    : path.startsWith('settings') || path.startsWith('backup') ? 'settings'
    : 'home';
  const items = navItems(active);
  // Insert the central New Receipt action between the 2nd and 3rd destinations.
  const parts = items.split('</a>');
  const before = parts.slice(0, 2).join('</a>') + '</a>';
  const after = parts.slice(2).join('</a>');
  const fab = `<a class="nav-fab" href="#/receipts/new" aria-label="سند جديد">+</a>`;
  return before + fab + after;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.replace('#/home');
  render();
  registerServiceWorker();
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js').catch(() => {
    /* offline caching is best-effort; the app still works without it */
  });
}

// Expose navigate for inline handlers if needed.
window.sevenNavigate = navigate;
