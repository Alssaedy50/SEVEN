// SEVEN — page views. Each view returns { header, body, showNav, onMount }.
// UI mirrors the Stitch export; behavior follows docs/design.
import { icon } from './icons.js';
import {
  esc, toast, confirmDialog, openSheet, closeOverlay, qs, qsa,
  formatMoney, formatDateAr, formatDateTimeAr, relativeAr, amountInWords,
  todayISO, toMinor, toMajor, isValidPhone, normalizePhone, currencyInfo,
  supportedCurrencies,
} from './utils.js';
import * as store from './store.js';
import { SERVICES, PAYMENT_METHODS } from './store.js';
import { printReceipt, shareReceipt, exportReceipt, renderReceiptA5 } from './receipt.js';

const PRIMARY = { ar: 'الرئيسية', path: 'home', icon: 'home' };
const NAV = [
  { id: 'home', label: 'الرئيسية', icon: 'home', path: 'home' },
  { id: 'patients', label: 'المرضى', icon: 'people', path: 'patients' },
  { id: 'receipts', label: 'السجل', icon: 'receipt', path: 'receipts' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings', path: 'settings' },
];

export function navItems(active) {
  return NAV.map((n) => `
    <a class="nav-item ${active === n.id ? 'active' : ''}" href="#/${n.path}">
      ${icon(n.icon, 'ic')}<span>${n.label}</span>
    </a>`).join('');
}

/* ---------- Shared header builders ---------- */
export function appHeader({ active, settings }) {
  return `
    <div class="header-bar">
      <div class="header-id">
        <img src="./assets/logo.png" alt="شعار العيادة" />
        <div class="header-meta">
          <div class="header-brand">
            <span class="brand">SEVEN</span>
            <span class="clinic">| عيادة السعيدي</span>
          </div>
          <span class="header-sub">${esc(settings.doctorNameAr)}</span>
          <span class="header-page">${esc((NAV.find((n) => n.id === active) || PRIMARY).label)}</span>
        </div>
      </div>
      <div class="header-actions">
        <a class="icon-btn" href="#/settings" aria-label="الإعدادات">${icon('settings')}</a>
        <span class="avatar">${icon('person', '', '1rem')}</span>
      </div>
    </div>`;
}

export function backHeader({ title, subtitle, backTo }) {
  return `
    <div class="header-back">
      <a class="icon-btn" href="${esc(backTo)}" aria-label="رجوع">${icon('chevronRight')}</a>
      <div class="title-stack">
        <h1>${esc(title)}</h1>
        ${subtitle ? `<span class="sub">${esc(subtitle)}</span>` : ''}
      </div>
    </div>`;
}

const stateBlock = (ic, title, text, action = '') => `
  <div class="state">
    <span class="ic-ring">${icon(ic)}</span>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${action}
  </div>`;

/* =========================================================
   Home (P01)
   ========================================================= */
export const homeView = {
  showNav: true,
  async render() {
    const settings = await store.getSettings();
    const c = await store.counts();
    const body = `
      <div class="hero">
        <div class="flex">
          <div class="emblem"><img src="./assets/logo.png" alt="شعار العيادة" /></div>
          <div class="grow">
            <div class="flex" style="gap:.4rem">
              <span class="chip badge-pill">النظام السريري المالي</span>
            </div>
            <h2 style="margin:.4rem 0 .1rem;font-size:1rem">${esc(settings.clinicNameAr)}</h2>
            <p class="small muted" style="margin:0">${esc(settings.doctorNameAr)} • ${esc(settings.specialty)}</p>
          </div>
        </div>
        <div class="divider"></div>
        <div class="row-between">
          <div class="flex">
            <span class="tile-ic">${icon('verified')}</span>
            <div class="stack-sm"><span class="small strong">سندات القبض السريعة</span><span class="small muted">مطابقة للدفتر المالي الورقي المعتمد</span></div>
          </div>
          <a class="btn btn-primary btn-sm" href="#/receipts/new">${icon('plus', 'ic')} سند قبض</a>
        </div>
      </div>

      <div class="grid-3">
        <div class="stat"><span class="v">${c.patients}</span><span class="l">مريض مسجّل</span></div>
        <div class="stat"><span class="v">${c.receipts}</span><span class="l">سند مُصدر</span></div>
        <div class="stat"><span class="v">${c.drafts}</span><span class="l">مسودة</span></div>
      </div>

      <div>
        <div class="section-title">${icon('chart', 'ic')} الإجراءات السريعة</div>
        <div class="grid-2">
          <a class="tile" href="#/receipts/new">
            <span class="tile-ic">${icon('receipt')}</span>
            <div><h3>إنشاء سند قبض</h3><p>تسجيل دفعة جديدة</p></div>
          </a>
          <a class="tile" href="#/patients/new">
            <span class="tile-ic">${icon('person')}</span>
            <div><h3>إضافة مريض</h3><p>ملف مريض جديد</p></div>
          </a>
          <a class="tile" href="#/patients">
            <span class="tile-ic">${icon('people')}</span>
            <div><h3>المرضى</h3><p>قائمة وملفات المرضى</p></div>
          </a>
          <a class="tile" href="#/receipts">
            <span class="tile-ic">${icon('receipt')}</span>
            <div><h3>سجل السندات</h3><p>بحث واستعراض السندات</p></div>
          </a>
        </div>
      </div>

      <a class="tile" href="#/settings" style="min-height:auto;flex-direction:row;align-items:center">
        <span class="tile-ic">${icon('hospital')}</span>
        <div class="grow"><h3>الإعدادات والنسخ الاحتياطي</h3><p>بيانات العيادة، العملة، وحماية البيانات</p></div>
        ${icon('chevronLeft')}
      </a>`;
    return {
      header: appHeader({ active: 'home', settings }),
      body,
    };
  },
};

/* =========================================================
   Patient list (P02)
   ========================================================= */
export const patientsView = {
  showNav: true,
  async render(ctx) {
    const settings = await store.getSettings();
    const query = ctx.query.get('q') || '';
    const rows = await store.searchPatients(query);
    const total = (await store.listPatients()).length;

    const listRows = rows.map((p) => {
      const initial = (p.fullName || '؟').trim().charAt(0);
      return `
        <a class="list-row" href="#/patients/${p.id}">
          <span class="lead">${esc(initial)}</span>
          <span class="body">
            <span class="t">${esc(p.fullName)}</span>
            <span class="s" dir="ltr">${esc(p.phone || '—')}</span>
          </span>
          <span class="chev">${icon('chevronLeft')}</span>
        </a>`;
    }).join('');

    const empty = total === 0;
    const noResults = !empty && rows.length === 0;
    let content;
    if (empty) {
      content = stateBlock('people', 'لا يوجد مرضى مسجلون',
        'ابدأ بإضافة أول مريض للعيادة لإصدار السندات وربطها بملفه.',
        `<a class="btn btn-primary" href="#/patients/new">${icon('plus', 'ic')} تسجيل مريض جديد</a>`);
    } else if (noResults) {
      content = stateBlock('search', 'لا توجد نتائج',
        'تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو أضف ملفاً جديداً.',
        `<button class="btn btn-outline" data-clear>${icon('close', 'ic')} مسح البحث</button>`);
    } else {
      content = `<div class="card flush"><div class="list">${listRows}</div></div>`;
    }

    const body = `
      <div class="row-between">
        <div class="section-title">${icon('people', 'ic')} قائمة المرضى</div>
        <span class="chip">${total} مريض</span>
      </div>
      <div class="search-wrap">
        ${icon('search', 'ic')}
        <input class="input" id="pat-search" type="search" placeholder="ابحث بالاسم أو رقم الهاتف" value="${esc(query)}" />
      </div>
      <a class="btn btn-primary btn-block" href="#/patients/new">${icon('person', 'ic')} إضافة مريض</a>
      ${content}`;

    return {
      header: appHeader({ active: 'patients', settings }),
      body,
      onMount(root) {
        const input = qs('#pat-search', root);
        const clear = qs('[data-clear]', root);
        if (clear) clear.onclick = () => ctx.navigate('patients');
        if (input) {
          let t;
          input.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => ctx.navigate(`patients?q=${encodeURIComponent(input.value)}`, { replace: true }), 220);
          });
          input.focus();
        }
      },
    };
  },
};

/* =========================================================
   Patient form (P03 create / edit)
   ========================================================= */
export const patientFormView = {
  showNav: false,
  async render(ctx) {
    const settings = await store.getSettings();
    const id = ctx.params[0] && ctx.params[0] !== 'new' ? ctx.params[0] : null;
    const editing = !!id;
    const patient = editing ? await store.getPatient(id) : null;
    if (editing && !patient) {
      return { header: backHeader({ title: 'ملف المريض', backTo: '#/patients' }),
        body: stateBlock('warning', 'المريض غير موجود', 'تعذّر العثور على الملف المطلوب.',
          `<a class="btn btn-outline" href="#/patients">العودة للقائمة</a>`) };
    }

    const body = `
      <form id="patient-form" novalidate>
        <div class="card">
          <div class="field" data-field="fullName">
            <label>اسم المريض بالكامل <span class="req">*</span></label>
            <input class="input" name="fullName" autocomplete="name"
              value="${esc(patient ? patient.fullName : '')}" placeholder="مثال: أحمد محمد علي الكبسي" />
            <span class="err">الاسم مطلوب ولا يمكن أن يكون فارغاً</span>
          </div>
          <div class="field" data-field="phone">
            <label>رقم الهاتف <span class="req">*</span></label>
            <input class="input" name="phone" dir="ltr" inputmode="tel" autocomplete="tel"
              value="${esc(patient ? patient.phone : '')}" placeholder="+967 7XX XXX XXX" />
            <span class="err">أدخل رقم هاتف صالح (7 إلى 15 رقماً)</span>
          </div>
          <p class="small muted" style="margin:0">تُستخدم البيانات لأغراض التعريف الإداري فقط. لا تُدخل معلومات سريرية هنا.</p>
        </div>
        <div class="btn-row" style="margin-top:1rem">
          <button class="btn btn-primary grow" type="submit">${icon('save', 'ic')} ${editing ? 'حفظ التعديلات' : 'حفظ المريض'}</button>
          <a class="btn btn-outline" href="${editing ? `#/patients/${id}` : '#/patients'}">${icon('close', 'ic')} إلغاء</a>
        </div>
      </form>`;

    return {
      header: backHeader({
        title: editing ? 'تعديل بيانات المريض' : 'إضافة مريض جديد',
        subtitle: editing ? patient.fullName : 'ملف مريض جديد',
        backTo: editing ? `#/patients/${id}` : '#/patients',
      }),
      body,
      onMount(root) {
        const form = qs('#patient-form', root);
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const fullName = form.fullName.value.trim();
          const phone = form.phone.value;
          let ok = true;
          const setInvalid = (name, bad) => {
            const f = qs(`[data-field="${name}"]`, root);
            f.classList.toggle('invalid', bad);
            if (bad) ok = false;
          };
          setInvalid('fullName', !fullName);
          setInvalid('phone', !isValidPhone(phone));
          if (!ok) { toast('يرجى تصحيح الحقول المطلوبة', 'error'); return; }
          try {
            const saved = editing
              ? await store.updatePatient(id, { fullName, phone })
              : await store.createPatient({ fullName, phone });
            toast(editing ? 'تم حفظ التعديلات' : 'تم حفظ المريض بنجاح', 'success');
            ctx.navigate(`patients/${saved.id}`);
          } catch (err) {
            toast('تعذّر الحفظ: ' + err.message, 'error');
          }
        });
      },
    };
  },
};

/* =========================================================
   Receipt form (P04) — create / issue
   ========================================================= */
function methodChoice(preset) {
  return PAYMENT_METHODS.map((m) => {
    const ic = m.id === 'cash' ? 'wallet' : m.id === 'wallet' ? 'qr' : 'bank';
    return `<label class="choice">
      <input type="radio" name="paymentMethod" value="${m.id}" ${preset === m.id ? 'checked' : ''} style="accent-color:var(--primary)" />
      ${icon(ic, 'ic')}<span>${esc(m.ar)}</span>
    </label>`;
  }).join('');
}

async function openPatientPicker({ onPick, onNew }) {
  const rows = await store.listPatients();
  const list = rows.map((p) => `
    <button class="list-row" data-pick="${esc(p.id)}" type="button" style="width:100%;border:0;border-bottom:1px solid var(--outline-variant);text-align:inherit">
      <span class="lead">${esc((p.fullName || '؟').charAt(0))}</span>
      <span class="body"><span class="t">${esc(p.fullName)}</span><span class="s" dir="ltr">${esc(p.phone || '')}</span></span>
    </button>`).join('');
  openSheet(`
    <h3>اختيار المريض / المستلم</h3>
    <p>اختر ملف مريض مسجّل، أو اكتب اسماً لعميل غير مسجّل من الحقول أدناه.</p>
    ${rows.length ? `<div style="max-height:50vh;overflow:auto;border:1px solid var(--outline-variant);border-radius:var(--radius)">${list}</div>`
      : `<p class="muted small">لا يوجد مرضى مسجلون بعد.</p>`}
    <div class="btn-row" style="margin-top:.75rem">
      <button class="btn btn-outline grow" data-new type="button">${icon('person', 'ic')} مريض جديد</button>
      <button class="btn btn-ghost" data-close type="button">إغلاق</button>
    </div>`, {
    onMount(root) {
      qsa('[data-pick]', root).forEach((b) => b.onclick = () => { closeOverlay(); onPick(b.dataset.pick); });
      qs('[data-new]', root).onclick = () => { closeOverlay(); onNew(); };
      qs('[data-close]', root).onclick = () => closeOverlay();
    },
  });
}

export const receiptFormView = {
  showNav: false,
  async render(ctx) {
    const settings = await store.getSettings();
    const presetPatientId = ctx.query.get('patient');
    const presetPatient = presetPatientId ? await store.getPatient(presetPatientId) : null;

    const currencyOptions = supportedCurrencies()
      .map((c) => `<option value="${c.code}" ${c.code === settings.defaultCurrencyCode ? 'selected' : ''}>${esc(c.nameAr)} (${c.code})</option>`)
      .join('');

    const serviceTiles = SERVICES.map((s) => `
      <label class="service">
        <input type="checkbox" name="service" value="${s.id}" />
        <span>${esc(s.ar)}</span>
      </label>`).join('');

    const body = `
      <form id="receipt-form" novalidate>
        <div class="card">
          <div class="section-title">${icon('receipt', 'ic')} بيانات السند</div>
          <div class="field" data-field="payerName">
            <label>استلمنا من المريض / المستلم <span class="req">*</span></label>
            <div class="inline-add">
              <button class="btn btn-outline" type="button" id="pick-patient">${icon('people', 'ic')} اختيار مريض</button>
              <input class="input" name="payerName" placeholder="اسم المستلم (إن لم يكن مسجلاً)"
                value="${esc(presetPatient ? presetPatient.fullName : '')}" ${presetPatient ? 'readonly' : ''} />
            </div>
            <span class="err">اختر مريضاً أو اكتب اسم المستلم</span>
          </div>
          <input type="hidden" name="patientId" value="${esc(presetPatient ? presetPatient.id : '')}" />
          <input type="hidden" name="payerPhone" value="${esc(presetPatient ? presetPatient.phone : '')}" />

          <div class="field" data-field="receiptDate">
            <label>تاريخ السند <span class="req">*</span></label>
            <input class="input" type="date" name="receiptDate" value="${esc(todayISO())}" />
            <span class="err">تاريخ السند مطلوب</span>
          </div>

          <div class="field" data-field="currencyCode">
            <label>العملة</label>
            <select class="select" name="currencyCode">${currencyOptions}</select>
          </div>

          <div class="field" data-field="paymentMethod">
            <label>طريقة الدفع <span class="req">*</span></label>
            <div class="choice-row" id="method-row">${methodChoice('cash')}</div>
            <span class="err">طريقة الدفع مطلوبة</span>
          </div>

          <div class="field hidden" data-field="transfer" id="transfer-group">
            <label>بيانات الحوالة / المحفظة</label>
            <input class="input" name="transferSource" placeholder="اسم البنك أو المحفظة" />
            <input class="input" name="transferReference" placeholder="رقم المرجع / الحوالة" style="margin-top:.4rem" />
          </div>
        </div>

        <div class="card">
          <div class="section-title">${icon('wallet', 'ic')} المبلغ</div>
          <div class="grid-2">
            <div class="field" data-field="totalAccountMinor">
              <label>إجمالي الحساب</label>
              <input class="input" type="number" min="0" step="any" inputmode="numeric" name="totalAccount" value="0" />
              <span class="err">إجمالي الحساب لا يمكن أن يقل عن المدفوع</span>
            </div>
            <div class="field" data-field="paidNowMinor">
              <label>المبلغ المدفوع <span class="req">*</span></label>
              <input class="input" type="number" min="0" step="any" inputmode="numeric" name="paidNow" value="" />
              <span class="err">المبلغ المدفوع يجب أن يكون أكبر من صفر</span>
            </div>
          </div>
          <div class="summary" id="summary">
            <div class="cell"><span class="k">إجمالي الحساب</span><span class="v" id="sum-total">0</span></div>
            <div class="cell"><span class="k">المدفوع حالياً</span><span class="v" id="sum-paid">0</span></div>
            <div class="cell rem"><span class="k">المتبقي</span><span class="v" id="sum-rem">0</span></div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">${icon('microscope', 'ic')} الخدمة العلاجية</div>
          <p class="small muted" style="margin:0 0 .5rem">حدّد الإجراءات المشمولة في هذا السند.</p>
          <div class="service-grid">${serviceTiles}</div>
          <div class="field" style="margin-top:.75rem">
            <label>خدمات أخرى</label>
            <input class="input" name="otherService" placeholder="وصف مختصر لأي خدمة إضافية" />
          </div>
        </div>

        <div class="card">
          <div class="section-title">${icon('note', 'ic')} المبلغ كتابةً</div>
          <div class="field" data-field="amountInWords">
            <textarea class="textarea" name="amountInWords" id="words">${esc(amountInWords(0, settings.defaultCurrencyCode))}</textarea>
            <span class="hint">تُولَّد تلقائياً من المبلغ المدفوع. يمكن تعديلها يدوياً عند الحاجة.</span>
          </div>
          <button class="btn btn-outline btn-sm" type="button" id="words-refresh">${icon('refresh', 'ic')} تحديث النص تلقائياً</button>
        </div>

        <div class="card soft">
          <div class="note">${icon('shield', 'ic')}
            <span>يُقفل رقم السند فور الحفظ لمنع التكرار، ويُحفظ مع لقطة من بيانات العيادة والمريض لحماية السجل التاريخي.</span>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-primary grow" type="submit">${icon('checkCircle', 'ic')} حفظ وإصدار السند</button>
          <button class="btn btn-secondary" type="button" id="btn-preview">${icon('print', 'ic')} معاينة</button>
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost btn-sm" type="button" id="btn-draft">حفظ كمسودة</button>
          <a class="btn btn-ghost btn-sm" href="#/receipts">إلغاء والعودة</a>
        </div>
      </form>`;

    function collect(form) {
      const services = qsa('input[name="service"]:checked', form).map((i) => i.value);
      const method = (qs('input[name="paymentMethod"]:checked', form) || {}).value || '';
      const currency = form.currencyCode.value;
      return {
        patientId: form.patientId.value || null,
        payerName: form.payerName.value,
        payerPhone: form.payerPhone.value,
        receiptDate: form.receiptDate.value,
        currencyCode: currency,
        paymentMethod: method,
        transferSource: form.transferSource ? form.transferSource.value : '',
        transferReference: form.transferReference ? form.transferReference.value : '',
        totalAccountMinor: toMinor(form.totalAccount.value || 0, currency),
        paidNowMinor: toMinor(form.paidNow.value || 0, currency),
        selectedServices: services,
        otherService: form.otherService.value,
        amountInWords: form.amountInWords.value,
        amountInWordsManual: form.amountInWords.dataset.manual === '1',
        notes: '',
      };
    }

    return {
      header: backHeader({ title: 'سند قبض جديد', subtitle: 'نظام العيادة المالي الرسمي', backTo: '#/receipts' }),
      body,
      onMount(root) {
        const form = qs('#receipt-form', root);
        const words = qs('#words', root);
        const methodRow = qs('#method-row', root);
        const transferGroup = qs('#transfer-group', root);
        const autoWords = () => {
          if (words.dataset.manual === '1') return;
          const currency = form.currencyCode.value;
          words.value = amountInWords(toMinor(form.paidNow.value || 0, currency), currency);
        };
        const refreshSummary = () => {
          const currency = form.currencyCode.value;
          const total = toMinor(form.totalAccount.value || 0, currency);
          const paid = toMinor(form.paidNow.value || 0, currency);
          qs('#sum-total', root).textContent = formatMoney(total, currency, { withSymbol: false });
          qs('#sum-paid', root).textContent = formatMoney(paid, currency, { withSymbol: false });
          qs('#sum-rem', root).textContent = formatMoney(Math.max(0, total - paid), currency, { withSymbol: false });
        };
        const toggleTransfer = () => {
          const method = (qs('input[name="paymentMethod"]:checked', form) || {}).value;
          transferGroup.classList.toggle('hidden', method === 'cash');
        };

        form.totalAccount.addEventListener('input', () => { refreshSummary(); });
        form.paidNow.addEventListener('input', () => { refreshSummary(); autoWords(); });
        form.currencyCode.addEventListener('change', () => { refreshSummary(); autoWords(); });
        words.addEventListener('input', () => { words.dataset.manual = '1'; });
        qs('#words-refresh', root).onclick = () => { words.dataset.manual = '0'; autoWords(); toast('تم تحديث المبلغ كتابةً', 'success'); };
        methodRow.addEventListener('change', toggleTransfer);
        qsa('input[name="service"]', root).forEach((c) =>
          c.addEventListener('change', () => c.closest('.service').classList.toggle('on', c.checked)));

        qs('#pick-patient', root).onclick = async () => {
          await openPatientPicker({
            onPick: async (pid) => {
              const p = await store.getPatient(pid);
              if (!p) return;
              form.patientId.value = p.id;
              form.payerName.value = p.fullName;
              form.payerName.readOnly = true;
              form.payerPhone.value = p.phone;
            },
            onNew: () => ctx.navigate('patients/new'),
          });
        };
        form.payerName.addEventListener('input', () => {
          if (form.payerName.readOnly) return;
          form.patientId.value = '';
          form.payerPhone.value = '';
        });

        refreshSummary(); autoWords(); toggleTransfer();

        const validate = () => {
          const input = collect(form);
          // Payer: if a patient is chosen it is fine, otherwise name required.
          if (!input.patientId && !input.payerName.trim()) {
            qs('[data-field="payerName"]', root).classList.add('invalid');
            toast('يرجى تحديد المريض أو كتابة اسم المستلم', 'error');
            return null;
          }
          qs('[data-field="payerName"]', root).classList.remove('invalid');
          const errors = store.validateReceiptInput(input);
          let bad = false;
          ['paidNowMinor', 'totalAccountMinor', 'receiptDate', 'paymentMethod'].forEach((f) => {
            const field = qs(`[data-field="${f}"]`, root);
            if (field) field.classList.remove('invalid');
          });
          for (const e of errors) {
            const field = qs(`[data-field="${e.field}"]`, root);
            if (field) field.classList.add('invalid');
            bad = true;
          }
          if (bad) { toast('يرجى تصحيح الحقول المطلوبة', 'error'); return null; }
          return input;
        };

        qs('#btn-preview', root).onclick = () => {
          const input = validate(); if (!input) return;
          const preview = {
            ...input,
            payerNameSnapshot: input.payerName,
            payerPhoneSnapshot: input.payerPhone,
            remainingMinor: Math.max(0, input.totalAccountMinor - input.paidNowMinor),
            receiptNumber: null,
          };
          const st = store.getSettings();
          Promise.resolve(st).then((s) => {
            preview.clinicSnapshot = {
              clinicNameAr: s.clinicNameAr, clinicNameEn: s.clinicNameEn,
              doctorNameAr: s.doctorNameAr, doctorNameEn: s.doctorNameEn,
              specialty: s.specialty, address: s.address, contacts: s.contacts,
              logoAsset: './assets/logo.png',
            };
            printReceipt(preview, { pending: true });
          });
        };

        qs('#btn-draft', root).onclick = async () => {
          const input = collect(form);
          if (!input.patientId && !input.payerName.trim()) { toast('يرجى تحديد المريض أو كتابة الاسم', 'error'); return; }
          if (input.paidNowMinor <= 0) { toast('المبلغ المدفوع مطلوب حتى للمسودة', 'error'); return; }
          try {
            await store.saveDraft(input);
            toast('تم حفظ المسودة', 'success');
            ctx.navigate('receipts');
          } catch (err) { toast('تعذّر الحفظ: ' + err.message, 'error'); }
        };

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const input = validate(); if (!input) return;
          const btn = qs('button[type="submit"]', form);
          btn.disabled = true;
          try {
            const rec = await store.issueReceipt(input);
            toast(`تم إصدار السند ${rec.receiptNumber}`, 'success');
            ctx.navigate(`receipts/${rec.id}`);
          } catch (err) {
            toast('تعذّر إصدار السند: ' + err.message, 'error');
          } finally { btn.disabled = false; }
        });
      },
    };
  },
};

/* =========================================================
   Patient details (P05)
   ========================================================= */
export const patientDetailView = {
  showNav: false,
  async render(ctx) {
    const id = ctx.params[0];
    const patient = await store.getPatient(id);
    if (!patient) {
      return { header: backHeader({ title: 'ملف المريض', backTo: '#/patients' }),
        body: stateBlock('warning', 'المريض غير موجود', 'قد يكون الملف مؤرشفاً أو محذوفاً.',
          `<a class="btn btn-outline" href="#/patients">العودة للقائمة</a>`) };
    }
    const receipts = await store.receiptsForPatient(id);
    const issued = receipts.filter((r) => r.status === 'issued');

    const rows = issued.map((r) => `
      <a class="list-row" href="#/receipts/${r.id}">
        <span class="lead">${icon('receipt')}</span>
        <span class="body">
          <span class="t">${esc(r.receiptNumber || 'مسودة')}</span>
          <span class="s">${esc(formatDateAr(r.receiptDate))}</span>
        </span>
        <span class="tail"><span class="amt">${esc(formatMoney(r.paidNowMinor, r.currencyCode, { withSymbol: false }))}</span></span>
        <span class="chev">${icon('chevronLeft')}</span>
      </a>`).join('');

    const body = `
      <div class="card">
        <div class="flex">
          <span class="lead" style="width:3rem;height:3rem;font-size:1.2rem">${esc((patient.fullName || '؟').charAt(0))}</span>
          <div class="grow">
            <h2 style="margin:0;font-size:1.1rem">${esc(patient.fullName)}</h2>
            <a class="small" href="tel:${esc(patient.phone)}" dir="ltr">${icon('phone', 'ic')} ${esc(patient.phone)}</a>
          </div>
          ${patient.archivedAt ? '<span class="chip chip-void">مؤرشف</span>' : '<span class="chip chip-paid">ملف نشط</span>'}
        </div>
        <div class="divider"></div>
        <div class="btn-row">
          <a class="btn btn-primary btn-sm grow" href="#/receipts/new?patient=${esc(patient.id)}">${icon('receipt', 'ic')} سند جديد لهذا المريض</a>
          <a class="btn btn-outline btn-sm" href="#/patients/${esc(patient.id)}/edit">${icon('edit', 'ic')} تعديل</a>
        </div>
      </div>

      <div class="row-between">
        <div class="section-title">${icon('receipt', 'ic')} سندات القبض</div>
        ${issued.length ? `<span class="chip">${issued.length}</span>` : ''}
      </div>
      ${issued.length
        ? `<div class="card flush"><div class="list">${rows}</div></div>`
        : stateBlock('receipt', 'لا توجد سندات', 'لم تُصدر أي سندات قبض مرتبطة بهذا المريض بعد.',
            `<a class="btn btn-outline" href="#/receipts/new?patient=${esc(patient.id)}">${icon('plus', 'ic')} إنشاء سند</a>`)}

      <div class="btn-row">
        <button class="btn ${patient.archivedAt ? 'btn-outline' : 'btn-danger-outline'} btn-sm" data-archive>
          ${icon('archive', 'ic')} ${patient.archivedAt ? 'إلغاء الأرشفة' : 'أرشفة ملف المريض'}
        </button>
      </div>`;

    return {
      header: backHeader({ title: 'ملف المريض', subtitle: patient.fullName, backTo: '#/patients' }),
      body,
      onMount(root) {
        const btn = qs('[data-archive]', root);
        if (!btn) return;
        btn.onclick = async () => {
          const archiving = !patient.archivedAt;
          const ok = await confirmDialog({
            title: archiving ? 'أرشفة ملف المريض؟' : 'إلغاء أرشفة المريض؟',
            message: archiving
              ? 'سيتم إخفاء المريض من القائمة النشطة. تبقى السندات المرتبطة به محفوظة وقابلة للاستعراض، ويمكن التراجع عن الأرشفة.'
              : 'سيظهر المريض مجدداً في القائمة النشطة.',
            confirmText: archiving ? 'تأكيد الأرشفة' : 'إلغاء الأرشفة',
            danger: archiving,
          });
          if (!ok) return;
          await store.setPatientArchived(patient.id, archiving);
          toast(archiving ? 'تمت أرشفة الملف' : 'تمت استعادة الملف', 'success');
          ctx.navigate(archiving ? 'patients' : `patients/${patient.id}`);
        };
      },
    };
  },
};

/* =========================================================
   Receipt history (P07)
   ========================================================= */
export const receiptHistoryView = {
  showNav: true,
  async render(ctx) {
    const settings = await store.getSettings();
    const q = (ctx.query.get('q') || '').trim().toLowerCase();
    const method = ctx.query.get('method') || '';
    const range = ctx.query.get('range') || 'all';
    let rows = await store.listReceipts();

    const today = todayISO();
    if (range === 'today') rows = rows.filter((r) => r.receiptDate === today);
    if (method) rows = rows.filter((r) => r.paymentMethod === method);
    if (q) {
      rows = rows.filter((r) =>
        String(r.receiptNumber || '').toLowerCase().includes(q) ||
        String(r.payerNameSnapshot || '').toLowerCase().includes(q) ||
        String(r.payerPhoneSnapshot || '').toLowerCase().includes(q));
    }

    const totalIssued = (await store.listReceipts()).filter((r) => r.status === 'issued').length;

    const statusChip = (r) => {
      if (r.status === 'voided') return '<span class="chip chip-void">ملغى</span>';
      if (r.status === 'draft') return '<span class="chip chip-draft">مسودة</span>';
      return '';
    };

    const listRows = rows.map((r) => `
      <a class="list-row" href="#/receipts/${r.id}">
        <span class="lead">${icon('receipt')}</span>
        <span class="body">
          <span class="t">${esc(r.payerNameSnapshot || '—')}</span>
          <span class="s">${esc(r.receiptNumber || 'مسودة')} • ${esc(formatDateAr(r.receiptDate))}</span>
        </span>
        <span class="tail">
          <span class="amt">${esc(formatMoney(r.paidNowMinor, r.currencyCode, { withSymbol: false }))}</span>
          ${statusChip(r)}
        </span>
        <span class="chev">${icon('chevronLeft')}</span>
      </a>`).join('');

    const filters = `
      <div class="btn-row">
        <a class="btn ${range === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm" href="#/receipts${q ? `?q=${encodeURIComponent(q)}` : ''}">الكل (${totalIssued})</a>
        <a class="btn ${range === 'today' ? 'btn-primary' : 'btn-outline'} btn-sm" href="#/receipts?range=today${q ? `&q=${encodeURIComponent(q)}` : ''}">اليوم</a>
        <a class="btn ${method === 'cash' ? 'btn-primary' : 'btn-outline'} btn-sm" href="#/receipts?method=cash${q ? `&q=${encodeURIComponent(q)}` : ''}">نقداً</a>
        <a class="btn ${method === 'bank' || method === 'wallet' ? 'btn-primary' : 'btn-outline'} btn-sm" href="#/receipts?method=bank${q ? `&q=${encodeURIComponent(q)}` : ''}">تحويل / محفظة</a>
      </div>`;

    let content;
    if (totalIssued === 0 && !q) {
      content = stateBlock('receipt', 'لا توجد سندات بعد', 'ابدأ بإصدار أول سند قبض مالي للعيادة.',
        `<a class="btn btn-primary" href="#/receipts/new">${icon('plus', 'ic')} إصدار أول سند</a>`);
    } else if (rows.length === 0) {
      content = stateBlock('search', 'لا توجد نتائج', 'جرّب تعديل البحث أو إزالة الفلاتر.',
        `<button class="btn btn-outline" data-reset>${icon('close', 'ic')} إعادة تعيين البحث</button>`);
    } else {
      content = `<div class="card flush"><div class="list">${listRows}</div></div>`;
    }

    const body = `
      <div class="row-between">
        <div class="section-title">${icon('receipt', 'ic')} سجل السندات</div>
        <a class="btn btn-primary btn-sm" href="#/receipts/new">${icon('plus', 'ic')} سند جديد</a>
      </div>
      <div class="search-wrap">
        ${icon('search', 'ic')}
        <input class="input" id="rec-search" type="search" placeholder="ابحث بالرقم أو الاسم أو الهاتف" value="${esc(ctx.query.get('q') || '')}" />
      </div>
      ${filters}
      ${content}`;

    return {
      header: appHeader({ active: 'receipts', settings }),
      body,
      onMount(root) {
        const input = qs('#rec-search', root);
        const reset = qs('[data-reset]', root);
        if (reset) reset.onclick = () => ctx.navigate('receipts');
        if (input) {
          let t;
          input.addEventListener('input', () => {
            clearTimeout(t);
            const params = new URLSearchParams(ctx.query);
            if (input.value) params.set('q', input.value); else params.delete('q');
            t = setTimeout(() => ctx.navigate(`receipts?${params.toString()}`, { replace: true }), 220);
          });
        }
      },
    };
  },
};

/* =========================================================
   Receipt detail / output (P06)
   ========================================================= */
export const receiptDetailView = {
  showNav: false,
  async render(ctx) {
    const id = ctx.params[0];
    const r = await store.getReceipt(id);
    if (!r) {
      return { header: backHeader({ title: 'السند', backTo: '#/receipts' }),
        body: stateBlock('warning', 'السند غير موجود', 'تعذّر العثور على السند المطلوب.',
          `<a class="btn btn-outline" href="#/receipts">العودة للسجل</a>`) };
    }
    const patient = r.patientId ? await store.getPatient(r.patientId) : null;
    const audits = await store.listAudits(id);
    const isDraft = r.status === 'draft';
    const isVoid = r.status === 'voided';

    const fieldLabel = (f) => ({
      transferSource: 'الجهة / البنك', transferReference: 'رقم المرجع',
      paymentMethod: 'طريقة الدفع', selectedServices: 'الخدمات',
      otherService: 'خدمات أخرى', notes: 'ملاحظة',
    }[f] || f);
    const renderVal = (f, v) => {
      if (Array.isArray(v)) {
        return v.map((id) => (SERVICES.find((s) => s.id === id) || { ar: id }).ar).join('، ') || '—';
      }
      if (f === 'paymentMethod') return (PAYMENT_METHODS.find((m) => m.id === v) || { ar: v || '—' }).ar;
      return v || '—';
    };

    const auditRows = audits.map((a) => `
      <div class="card soft" style="margin-top:.5rem">
        <div class="row-between"><span class="small strong">تعديل #${a.correctionSequence}</span><span class="small muted">${esc(formatDateTimeAr(a.changedAt))}</span></div>
        <div class="small muted">السبب: ${esc(a.reason)}</div>
        <div class="stack-sm" style="margin-top:.35rem">
          ${a.changes.map((c) => `<div class="small"><b>${esc(fieldLabel(c.field))}</b>: ${esc(renderVal(c.field, c.oldValue))} ← ${esc(renderVal(c.field, c.newValue))}</div>`).join('')}
        </div>
      </div>`).join('');

    const statusBanner = isVoid
      ? `<div class="note" style="background:#fef2f2;color:#93000a">${icon('warning', 'ic')}<span>هذا السند ملغى.${r.voidReason ? ' السبب: ' + esc(r.voidReason) : ''}</span></div>`
      : isDraft
        ? `<div class="note" style="background:#fef3c7;color:#92400e">${icon('info', 'ic')}<span>هذه مسودة غير مُصدرة ولم يُخصَّص لها رقم سند.</span></div>`
        : `<div class="note">${icon('checkCircle', 'ic')}<span>سند مُصدر — رقم ${esc(r.receiptNumber)}</span></div>`;

    const body = `
      ${statusBanner}
      <div style="overflow:auto;border:1px solid var(--outline-variant);border-radius:var(--radius-lg);background:#e9eef7;padding:12px">
        <div style="width:148mm;max-width:100%;margin:0 auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:var(--shadow-2)">
          ${renderReceiptA5(r, { pending: isDraft })}
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary grow" data-print>${icon('print', 'ic')} طباعة السند</button>
        <button class="btn btn-secondary" data-share>${icon('share', 'ic')} مشاركة</button>
        <button class="btn btn-outline" data-export>${icon('download', 'ic')} تصدير</button>
      </div>
      <div class="btn-row">
        ${isDraft
          ? `<button class="btn btn-primary btn-sm grow" data-issue>${icon('checkCircle', 'ic')} إصدار السند الآن</button>
             <a class="btn btn-outline btn-sm" href="#/receipts/${r.id}/edit">${icon('edit', 'ic')} تعديل</a>`
          : (!isVoid
            ? `<a class="btn btn-outline btn-sm grow" href="#/receipts/${r.id}/edit">${icon('edit', 'ic')} تعديل بسيط (موثّق)</a>
               <button class="btn btn-danger-outline btn-sm" data-void>${icon('trash', 'ic')} إلغاء / إبطال</button>`
            : '')}
      </div>

      ${auditRows ? `<div><div class="section-title">${icon('shield', 'ic')} سجل التعديلات</div>${auditRows}</div>` : ''}

      ${patient ? `<a class="tile" href="#/patients/${patient.id}" style="min-height:auto;flex-direction:row;align-items:center">
        <span class="tile-ic">${icon('person')}</span>
        <div class="grow"><h3>ملف المريض المرتبط</h3><p>${esc(patient.fullName)}</p></div>${icon('chevronLeft')}</a>` : ''}`;

    return {
      header: backHeader({ title: isDraft ? 'مسودة سند' : 'تفاصيل السند', subtitle: r.receiptNumber || r.payerNameSnapshot, backTo: '#/receipts' }),
      body,
      onMount(root) {
        qs('[data-print]', root).onclick = () => printReceipt(r, { pending: isDraft });
        qs('[data-share]', root).onclick = () => shareReceipt(r, { pending: isDraft });
        qs('[data-export]', root).onclick = () => exportReceipt(r, { pending: isDraft });
        const issueBtn = qs('[data-issue]', root);
        if (issueBtn) issueBtn.onclick = async () => {
          const ok = await confirmDialog({ title: 'إصدار السند؟', message: 'سيُخصَّص رقم سند نهائي وتُثبَّت لقطة البيانات. لا يمكن تغيير الحقول المالية بعد الإصدار.', confirmText: 'إصدار' });
          if (!ok) return;
          try {
            const issued = await store.issueReceipt({ ...r, id: r.id, receiptNumber: null, createdAt: r.createdAt });
            toast(`تم إصدار السند ${issued.receiptNumber}`, 'success');
            ctx.navigate(`receipts/${r.id}`, { replace: true });
          } catch (err) { toast('تعذّر الإصدار: ' + err.message, 'error'); }
        };
        const voidBtn = qs('[data-void]', root);
        if (voidBtn) voidBtn.onclick = async () => {
          const ok = await confirmDialog({ title: 'إبطال السند المالي؟', message: 'لن يُحذف السند، لكنه سيُوسم كملغى ويُستبعد من الإجماليات. لا يُعاد استخدام رقمه.', confirmText: 'تأكيد الإبطال', danger: true });
          if (!ok) return;
          await store.voidReceipt(r.id, 'إبطال من صفحة السند');
          toast('تم إبطال السند', 'success');
          ctx.navigate(`receipts/${r.id}`, { replace: true });
        };
      },
    };
  },
};

/* =========================================================
   Receipt edit (p12) — audited correction of an issued receipt
   ========================================================= */
export const receiptEditView = {
  showNav: false,
  async render(ctx) {
    const id = ctx.params[0];
    const r = await store.getReceipt(id);
    if (!r) {
      return { header: backHeader({ title: 'تعديل السند', backTo: '#/receipts' }),
        body: stateBlock('warning', 'السند غير موجود', 'تعذّر العثور على السند.',
          `<a class="btn btn-outline" href="#/receipts">العودة</a>`) };
    }
    const methodChoice = PAYMENT_METHODS.map((m) => `<label class="choice">
      <input type="radio" name="paymentMethod" value="${m.id}" ${r.paymentMethod === m.id ? 'checked' : ''} style="accent-color:var(--primary)" />
      <span>${esc(m.ar)}</span>
    </label>`).join('');

    const body = `
      <form id="edit-form" novalidate>
        <div class="note">${icon('shield', 'ic')}<span>التصحيح محدود وموثّق: لا يمكن تغيير الرقم أو العملة أو المبالغ أو ارتباط المريض من هنا.</span></div>

        <div class="card">
          <div class="field">
            <label>الجهة / المرجع المحوَّل</label>
            <input class="input" name="transferSource" value="${esc(r.transferSource || '')}" placeholder="اسم البنك أو المحفظة" />
            <input class="input" name="transferReference" value="${esc(r.transferReference || '')}" placeholder="رقم المرجع" style="margin-top:.4rem" />
          </div>
          <div class="field">
            <label>طريقة الدفع</label>
            <div class="choice-row">${methodChoice}</div>
          </div>
          <div class="field">
            <label>تفاصيل الخدمة العلاجية</label>
            <div class="service-grid">
              ${SERVICES.map((s) => `<label class="service ${r.selectedServices.includes(s.id) ? 'on' : ''}">
                <input type="checkbox" name="service" value="${s.id}" ${r.selectedServices.includes(s.id) ? 'checked' : ''} />
                <span>${esc(s.ar)}</span></label>`).join('')}
            </div>
          </div>
          <div class="field">
            <label>خدمات أخرى</label>
            <input class="input" name="otherService" value="${esc(r.otherService || '')}" />
          </div>
          <div class="field">
            <label>ملاحظة إضافية</label>
            <textarea class="textarea" name="notes">${esc(r.notes || '')}</textarea>
          </div>
          <div class="field" data-field="reason">
            <label>سبب التعديل <span class="req">*</span></label>
            <input class="input" name="reason" placeholder="مثال: تصحيح رقم مرجع الحوالة" />
            <span class="err">سبب التعديل مطلوب لتوثيق التصحيح</span>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-primary grow" type="submit">${icon('save', 'ic')} حفظ تعديلات السند</button>
          <a class="btn btn-outline" href="#/receipts/${r.id}">${icon('close', 'ic')} إلغاء</a>
        </div>
      </form>`;

    return {
      header: backHeader({ title: 'تعديل بيانات السند', subtitle: r.receiptNumber || 'سند', backTo: `#/receipts/${r.id}` }),
      body,
      onMount(root) {
        const form = qs('#edit-form', root);
        qsa('input[name="service"]', root).forEach((c) =>
          c.addEventListener('change', () => c.closest('.service').classList.toggle('on', c.checked)));
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const reason = form.reason.value.trim();
          qs('[data-field="reason"]', root).classList.toggle('invalid', !reason);
          if (!reason) { toast('سبب التعديل مطلوب', 'error'); return; }
          const method = (qs('input[name="paymentMethod"]:checked', form) || {}).value || r.paymentMethod;
          const patch = {
            transferSource: form.transferSource.value,
            transferReference: form.transferReference.value,
            paymentMethod: method,
            selectedServices: qsa('input[name="service"]:checked', form).map((i) => i.value),
            otherService: form.otherService.value,
            notes: form.notes.value,
          };
          try {
            const result = await store.correctReceipt(r.id, patch, reason);
            if (!result) { toast('لا توجد تغييرات لحفظها', 'info'); return; }
            toast('تم حفظ التعديل وتوثيقه', 'success');
            ctx.navigate(`receipts/${r.id}`);
          } catch (err) { toast('تعذّر الحفظ: ' + err.message, 'error'); }
        });
      },
    };
  },
};

/* =========================================================
   Settings (P08 + P09 consolidated)
   ========================================================= */
export const settingsView = {
  showNav: true,
  async render(ctx) {
    const s = await store.getSettings();
    const contacts = [...(s.contacts || [])];
    while (contacts.length < 3) contacts.push('');
    const currencyOptions = supportedCurrencies()
      .map((c) => `<option value="${c.code}" ${c.code === s.defaultCurrencyCode ? 'selected' : ''}>${esc(c.nameAr)} (${c.code})</option>`)
      .join('');

    const body = `
      <div class="card">
        <div class="section-title">${icon('hospital', 'ic')} شعار وهوية المنشأة</div>
        <div class="flex">
          <span class="emblem" style="width:4rem;height:4rem;background:var(--surface-low);border-radius:var(--radius-lg);padding:.3rem">
            <img src="./assets/logo.png" alt="الشعار" style="width:100%;height:100%;object-fit:contain" />
          </span>
          <div class="grow small muted">يظهر الشعار في ترويسة سندات A5 المطبوعة.</div>
          <span class="chip chip-paid">معتمد</span>
        </div>
      </div>

      <form id="settings-form">
        <div class="card">
          <div class="section-title">${icon('note', 'ic')} بيانات العيادة الرسمية</div>
          <div class="field"><label>اسم العيادة (بالعربية)</label><input class="input" name="clinicNameAr" value="${esc(s.clinicNameAr)}" /></div>
          <div class="field"><label>اسم العيادة (بالإنجليزية)</label><input class="input" dir="ltr" name="clinicNameEn" value="${esc(s.clinicNameEn)}" /></div>
          <div class="field"><label>اسم الطبيب (بالعربية)</label><input class="input" name="doctorNameAr" value="${esc(s.doctorNameAr)}" /></div>
          <div class="field"><label>اسم الطبيب (بالإنجليزية)</label><input class="input" dir="ltr" name="doctorNameEn" value="${esc(s.doctorNameEn)}" /></div>
          <div class="field"><label>التخصص الطبي</label><input class="input" name="specialty" value="${esc(s.specialty)}" /></div>
          <div class="field"><label>العنوان الجغرافي</label><input class="input" name="address" value="${esc(s.address)}" /></div>
        </div>

        <div class="card">
          <div class="section-title">${icon('phone', 'ic')} أرقام التواصل الرسمية</div>
          ${contacts.slice(0, 3).map((c, i) => `
            <div class="field"><label>رقم الاتصال (${i + 1})${i === 0 ? ' <span class="req">*</span>' : ''}</label>
              <input class="input" dir="ltr" name="contact${i}" value="${esc(c)}" placeholder="+967 7XX XXX XXX" /></div>`).join('')}
        </div>

        <div class="card">
          <div class="section-title">${icon('wallet', 'ic')} إعدادات العملة والحسابات</div>
          <div class="field"><label>العملة الافتراضية للسندات</label><select class="select" name="defaultCurrencyCode">${currencyOptions}</select></div>
          <p class="small muted" style="margin:0">تُطبَّق العملة الافتراضية على السندات الجديدة فقط؛ لا تُعيد السندات المُصدرة سابقاً.</p>
        </div>

        <div class="btn-row">
          <button class="btn btn-primary grow" type="submit">${icon('save', 'ic')} حفظ التعديلات</button>
          <button class="btn btn-outline" type="button" id="btn-reset">${icon('refresh', 'ic')} استعادة الافتراضي</button>
        </div>
      </form>

      <a class="tile" href="#/backup" style="min-height:auto;flex-direction:row;align-items:center">
        <span class="tile-ic">${icon('shield')}</span>
        <div class="grow"><h3>النسخ الاحتياطي والاستعادة</h3><p>تصدير بيانات كاملة أو استعادتها من ملف</p></div>
        ${icon('chevronLeft')}
      </a>`;

    return {
      header: appHeader({ active: 'settings', settings: s }),
      body,
      onMount(root) {
        const form = qs('#settings-form', root);
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const contactsOut = [0, 1, 2].map((i) => form[`contact${i}`].value.trim()).filter(Boolean);
          if (!contactsOut.length) { toast('رقم اتصال واحد على الأقل مطلوب', 'error'); return; }
          await store.saveSettings({
            clinicNameAr: form.clinicNameAr.value.trim(),
            clinicNameEn: form.clinicNameEn.value.trim(),
            doctorNameAr: form.doctorNameAr.value.trim(),
            doctorNameEn: form.doctorNameEn.value.trim(),
            specialty: form.specialty.value.trim(),
            address: form.address.value.trim(),
            contacts: contactsOut,
            defaultCurrencyCode: form.defaultCurrencyCode.value,
          });
          toast('تم حفظ بيانات العيادة بنجاح', 'success');
          ctx.navigate('settings', { replace: true });
        });
        qs('#btn-reset', root).onclick = async () => {
          const ok = await confirmDialog({ title: 'استعادة البيانات الافتراضية؟', message: 'سيتم استبدال بيانات العيادة الحالية بالبيانات الافتراضية. السندات المُصدرة تحتفظ بلقطتها التاريخية.', confirmText: 'استعادة', danger: true });
          if (!ok) return;
          await store.saveSettings({ ...store.DEFAULT_SETTINGS, updatedAt: Date.now() });
          toast('تمت استعادة البيانات الافتراضية', 'success');
          ctx.navigate('settings', { replace: true });
        };
      },
    };
  },
};

/* =========================================================
   Backup / restore
   ========================================================= */
export const backupView = {
  showNav: true,
  async render(ctx) {
    const settings = await store.getSettings();
    const c = await store.counts();
    const body = `
      <div class="note">${icon('warning', 'ic')}<span>البيانات محفوظة محلياً على هذا الجهاز فقط. إذا مسحت بيانات المتصفح أو فقدت الجهاز فقد تفقد السجلات ما لم يوجد نسخة احتياطية حديثة.</span></div>

      <div class="card">
        <div class="section-title">${icon('archive', 'ic')} تصدير وحفظ نسخة</div>
        <p class="small muted" style="margin:0 0 .75rem">يشمل التصدير ${c.patients} مريضاً و${c.receipts} سنداً مُصدراً مع سجل التعديلات والإعدادات.</p>
        <button class="btn btn-primary btn-block" id="btn-backup">${icon('download', 'ic')} إنشاء وتصدير نسخة احتياطية (.sevenbak)</button>
      </div>

      <div class="card">
        <div class="section-title">${icon('upload', 'ic')} استعادة من ملف</div>
        <p class="small muted" style="margin:0 0 .75rem">يُتحقَّق من الملف بالكامل قبل الاستبدال، ولن تُغيَّر بياناتك الحالية إن كان الملف تالفاً.</p>
        <input type="file" id="backup-file" accept=".sevenbak,.json,application/json" class="hidden" />
        <button class="btn btn-secondary btn-block" id="btn-restore">${icon('upload', 'ic')} اختيار ملف واستعادة</button>
      </div>

      <p class="small muted center">صيغة الملف: seven.backup • إصدار المخطط 1</p>`;

    return {
      header: appHeader({ active: 'settings', settings }),
      body,
      onMount(root) {
        qs('#btn-backup', root).onclick = async () => {
          const data = await store.exportBackup();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const stamp = new Date().toISOString().slice(0, 10);
          const a = document.createElement('a');
          const url = URL.createObjectURL(blob);
          a.href = url; a.download = `seven-backup-${stamp}.sevenbak`;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast('تم إنشاء ملف النسخة الاحتياطية', 'success');
        };
        const file = qs('#backup-file', root);
        qs('#btn-restore', root).onclick = () => file.click();
        file.onchange = async () => {
          const f = file.files && file.files[0];
          if (!f) return;
          try {
            const text = await f.text();
            const data = JSON.parse(text);
            store.validateBackup(data);
            const ok = await confirmDialog({
              title: 'تأكيد استبدال البيانات',
              message: `الملف صالح ويحتوي ${data.patients.length} مريضاً و${data.receipts.length} سنداً. سيتم استبدال كل البيانات الحالية.`,
              confirmText: 'تأكيد والاستبدال', danger: true,
            });
            if (!ok) return;
            await store.importBackup(data);
            toast('تمت استعادة البيانات بنجاح', 'success');
            ctx.navigate('home');
          } catch (err) {
            toast('الملف غير صالح: ' + err.message, 'error');
          } finally { file.value = ''; }
        };
      },
    };
  },
};
