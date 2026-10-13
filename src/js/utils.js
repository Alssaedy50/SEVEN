// SEVEN — shared helpers: escaping, formatting, Arabic number-to-words,
// dates, toasts, dialogs, and sheets.
import { icon } from './icons.js';

/* ---------- Escaping ---------- */
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function uid(prefix) {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix || 'id'}_${Date.now().toString(36)}${rnd}`;
}

/* ---------- Money ---------- */
const CURRENCIES = {
  YER: { code: 'YER', nameAr: 'ريال يمني', nameEn: 'Yemeni Rial', minor: 0, subAr: 'فلس', subEn: 'fils' },
  SAR: { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', minor: 2, subAr: 'هللة', subEn: 'halala' },
  USD: { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', minor: 2, subAr: 'سنت', subEn: 'cent' },
};

export function currencyInfo(code) {
  return CURRENCIES[code] || CURRENCIES.YER;
}

export function supportedCurrencies() {
  return Object.values(CURRENCIES);
}

// Money is stored as integer minor units. factor converts to major units.
export function toMajor(minor, code) {
  const f = Math.pow(10, currencyInfo(code).minor || 0);
  return (Number(minor) || 0) / f;
}

export function toMinor(major, code) {
  const f = Math.pow(10, currencyInfo(code).minor || 0);
  return Math.round((Number(major) || 0) * f);
}

export function formatNumber(value, digits = 0) {
  const n = Number(value) || 0;
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// Display a money value from minor units with the currency label.
export function formatMoney(minor, code = 'YER', opts = {}) {
  const info = currencyInfo(code);
  const digits = info.minor || 0;
  const s = formatNumber(toMajor(minor, code), digits);
  if (opts.short) return s;
  return `${s} ${opts.withSymbol === false ? '' : info.nameAr}`.trim();
}

/* ---------- Arabic number to words ---------- */
const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر',
  'ثمانية عشر', 'تسعة عشر'];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة',
  'ثمانمائة', 'تسعمائة'];

function under1000(n) {
  const parts = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rem) {
    if (rem < 20) parts.push(ONES[rem]);
    else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      parts.push(o ? `${ONES[o]} و${TENS[t]}` : TENS[t]);
    }
  }
  return parts.join(' و');
}

function groupScale(count, forms) {
  // forms: [singular, dual, plural3to10, plural11plus]
  if (count === 1) return forms[0];
  if (count === 2) return forms[1];
  if (count >= 3 && count <= 10) return `${under1000(count)} ${forms[2]}`;
  return `${under1000(count)} ${forms[3]}`;
}

const SCALES = [
  { value: 1e9, forms: ['مليار', 'ملياران', 'مليارات', 'مليار'] },
  { value: 1e6, forms: ['مليون', 'مليونان', 'ملايين', 'مليون'] },
  { value: 1e3, forms: ['ألف', 'ألفان', 'آلاف', 'ألف'] },
];

// Convert a non-negative integer to Arabic words.
export function intToArabicWords(n) {
  n = Math.floor(Number(n) || 0);
  if (n === 0) return 'صفر';
  const groups = [];
  for (const s of SCALES) {
    const c = Math.floor(n / s.value);
    if (c > 0) { groups.push(groupScale(c, s.forms)); n %= s.value; }
  }
  if (n > 0) groups.push(under1000(n));
  return groups.join(' و');
}

// Full Arabic amount-in-words, e.g. "أربعة وعشرون ألف ريال يمني فقط لا غير."
export function amountInWords(minor, code = 'YER') {
  const info = currencyInfo(code);
  const major = Math.floor(toMajor(minor, code));
  const subFactor = Math.pow(10, info.minor || 0);
  const sub = Math.round(((Number(minor) || 0) % subFactor));
  let text = `${intToArabicWords(major)} ${info.nameAr}`;
  if (info.minor && sub > 0) text += ` و${intToArabicWords(sub)} ${info.subAr}`;
  return `${text} فقط لا غير.`;
}

/* ---------- Dates ---------- */
export function todayISO() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function formatDateAr(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return esc(iso);
  return `${d} / ${m} / ${y} م`;
}

export function formatDateTimeAr(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function relativeAr(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'الآن';
  if (min < 60) return `منذ ${min} دقيقة`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `منذ ${hr} ساعة`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'أمس';
  if (day < 30) return `منذ ${day} يوم`;
  return formatDateTimeAr(ts);
}

/* ---------- Phone ---------- */
export function normalizePhone(raw) {
  return String(raw || '').trim().replace(/[^\d+]/g, '');
}

export function isValidPhone(raw) {
  const v = normalizePhone(raw);
  const digits = v.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/* ---------- Toast ---------- */
export function toast(message, type = 'info', ms = 3000) {
  let root = document.querySelector('.toast-root');
  if (!root) {
    root = document.createElement('div');
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  const ic = type === 'success' ? 'checkCircle' : type === 'error' ? 'warning' : 'info';
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `${icon(ic, 'ic')}<span class="grow">${esc(message)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'all .2s';
    setTimeout(() => el.remove(), 220);
  }, ms);
}

/* ---------- Overlay / sheet / dialog ---------- */
function overlayRoot() {
  return document.getElementById('overlay-root');
}

export function closeOverlay() {
  const root = overlayRoot();
  if (root) root.innerHTML = '';
}

export function openSheet(innerHTML, { onMount } = {}) {
  const root = overlayRoot();
  root.innerHTML = `<div class="overlay" data-overlay><div class="sheet" role="dialog" aria-modal="true"><div class="grip"></div>${innerHTML}</div></div>`;
  const overlay = root.querySelector('[data-overlay]');
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeOverlay(); });
  if (onMount) onMount(root);
}

// Promise-based confirm dialog.
export function confirmDialog({ title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', danger = false }) {
  return new Promise((resolve) => {
    openSheet(
      `<h3>${esc(title)}</h3>
       <p>${message}</p>
       <div class="actions">
         <button class="btn btn-outline" data-cancel>${esc(cancelText)}</button>
         <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-confirm>${esc(confirmText)}</button>
       </div>`,
      {
        onMount(root) {
          root.querySelector('[data-confirm]').onclick = () => { closeOverlay(); resolve(true); };
          root.querySelector('[data-cancel]').onclick = () => { closeOverlay(); resolve(false); };
        },
      }
    );
  });
}

/* ---------- DOM helper ---------- */
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function qs(sel, parent = document) { return parent.querySelector(sel); }
export function qsa(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }
