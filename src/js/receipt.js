// SEVEN — A5 portrait receipt template and output actions (print / share / export).
// Layout follows PRODUCT_SPEC.md section 6.4: Arabic identity on the right,
// logo centered, English identity on the left, "سند قبض" badge, meta rows,
// eight treatment services, totals box, signature lines, and a footer.
import { esc, formatMoney, formatDateAr, amountInWords, formatDateTimeAr, toast } from './utils.js';
import { SERVICES, PAYMENT_METHODS } from './store.js';

function methodLabel(id) {
  const m = PAYMENT_METHODS.find((x) => x.id === id);
  return m ? m.ar : id || '—';
}

function serviceRows(selected) {
  const set = new Set(selected || []);
  return SERVICES.map((s) => `
    <div class="item ${set.has(s.id) ? 'on' : ''}">
      <span class="box">${set.has(s.id) ? '✓' : ''}</span>
      <span>${esc(s.ar)}</span>
    </div>`).join('');
}

// data: a receipt-like record. pending=true renders a non-numbered preview.
export function renderReceiptA5(data, { pending = false } = {}) {
  const c = data.clinicSnapshot || {};
  const words = data.amountInWords || amountInWords(data.paidNowMinor, data.currencyCode);
  const remaining = Math.max(0, (Number(data.totalAccountMinor) || 0) - (Number(data.paidNowMinor) || 0));
  const number = data.receiptNumber || (pending ? '—' : '—');
  const transferRow = (data.paymentMethod && data.paymentMethod !== 'cash')
    ? `<div class="rc-field"><span class="k">الجهة / المرجع:</span><span class="v">${esc(data.transferSource || '')} ${data.transferReference ? '• ' + esc(data.transferReference) : ''}</span></div>`
    : '';

  return `
  <article class="receipt-a5" dir="rtl">
    <header class="rc-head">
      <div class="side">
        <span class="nm">${esc(c.doctorNameAr || '')}</span>
        <span>${esc(c.specialty || '')}</span>
      </div>
      <div class="emblem">
        <img src="${esc(c.logoAsset || './assets/logo.png')}" alt="شعار العيادة" />
      </div>
      <div class="side en">
        <span class="nm">${esc(c.clinicNameEn || '')}</span>
        <span>${esc(c.doctorNameEn || '')}</span>
      </div>
    </header>

    <div class="rc-title">سند قبض</div>

    <div class="rc-meta">
      <span><b>رقم السند:</b> ${esc(number)}</span>
      <span><b>التاريخ:</b> ${esc(formatDateAr(data.receiptDate))}</span>
    </div>

    <div>
      <div class="rc-field"><span class="k">استلمنا من:</span><span class="v">${esc(data.payerNameSnapshot || '')}</span></div>
      ${data.payerPhoneSnapshot ? `<div class="rc-field"><span class="k">رقم الهاتف:</span><span class="v" dir="ltr">${esc(data.payerPhoneSnapshot)}</span></div>` : ''}
      <div class="rc-field"><span class="k">المبلغ المدفوع:</span><span class="v">${esc(formatMoney(data.paidNowMinor, data.currencyCode))}</span></div>
      <div class="rc-field"><span class="k">المبلغ كتابةً:</span><span class="v">${esc(words)}</span></div>
      <div class="rc-field"><span class="k">طريقة الدفع:</span><span class="v">${esc(methodLabel(data.paymentMethod))}</span></div>
      ${transferRow}
    </div>

    <section class="rc-services">
      <h4>تفاصيل الخدمة العلاجية المقدمة</h4>
      <div class="grid">${serviceRows(data.selectedServices)}</div>
      ${data.otherService ? `<div class="rc-field" style="border:none"><span class="k">خدمات أخرى:</span><span class="v">${esc(data.otherService)}</span></div>` : ''}
    </section>

    <section class="rc-summary">
      <div class="cell"><span class="k">إجمالي الحساب</span><span class="v">${esc(formatMoney(data.totalAccountMinor, data.currencyCode, { withSymbol: false }))}</span></div>
      <div class="cell"><span class="k">المدفوع حالياً</span><span class="v">${esc(formatMoney(data.paidNowMinor, data.currencyCode, { withSymbol: false }))}</span></div>
      <div class="cell rem"><span class="k">المتبقي</span><span class="v">${esc(formatMoney(remaining, data.currencyCode, { withSymbol: false }))}</span></div>
    </section>

    <section class="rc-sig">
      <div class="line">
        <div class="nm">توقيع المستلم</div>
        <hr />
      </div>
      <div class="line">
        <div class="nm">توقيع المحاسب</div>
        <hr />
        <div>${esc(c.doctorNameAr || '')}</div>
      </div>
    </section>

    <footer class="rc-foot">
      ${esc(c.address || '')} • ${esc((c.contacts || []).join(' • '))}
      ${pending ? `<br/>معاينة غير مُصدرة • ${esc(formatDateTimeAr(Date.now()))}` : ''}
    </footer>
  </article>`;
}

/* ---------- Output actions ---------- */
function mountForOutput(html) {
  const root = document.getElementById('receipt-root');
  root.innerHTML = html;
  return root;
}

let _cssCache = null;
async function receiptStylesheet() {
  if (_cssCache != null) return _cssCache;
  try {
    const res = await fetch('./src/css/app.css');
    _cssCache = await res.text();
  } catch {
    _cssCache = '';
  }
  return _cssCache;
}

// Self-contained standalone document (inline CSS) so the exported/shared
// file renders correctly outside the app.
async function standaloneHtml(data, { pending = false } = {}) {
  const css = await receiptStylesheet();
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
    <title>سند قبض ${esc(data.receiptNumber || '')}</title>
    <style>${css}</style></head>
    <body style="background:#e9eef7;padding:16px;display:flex;justify-content:center">${renderReceiptA5(data, { pending })}</body></html>`;
}

export function printReceipt(data, { pending = false } = {}) {
  mountForOutput(renderReceiptA5(data, { pending }));
  window.print();
}

export async function shareReceipt(data, { pending = false } = {}) {
  const filename = `receipt-${data.receiptNumber || 'preview'}.html`;
  const html = await standaloneHtml(data, { pending });
  const file = new File([html], filename, { type: 'text/html' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'سند قبض', text: data.receiptNumber || '' });
      toast('تم فتح نافذة المشاركة', 'success');
      return true;
    }
    if (navigator.share) {
      await navigator.share({ title: 'سند قبض', text: `${data.receiptNumber || ''} — ${formatMoney(data.paidNowMinor, data.currencyCode)}` });
      return true;
    }
    throw new Error('no-share');
  } catch (err) {
    if (err && err.name === 'AbortError') return false;
    downloadBlob(new Blob([html], { type: 'text/html' }), filename);
    toast('المشاركة غير مدعومة على هذا الجهاز — تم تنزيل الملف بدلاً من ذلك', 'info');
    return false;
  }
}

export async function exportReceipt(data, { pending = false } = {}) {
  const filename = `receipt-${data.receiptNumber || 'preview'}.html`;
  const html = await standaloneHtml(data, { pending });
  downloadBlob(new Blob([html], { type: 'text/html' }), filename);
  toast('تم تصدير ملف السند', 'success');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
