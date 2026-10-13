// SEVEN — local data layer (IndexedDB).
// Implements the schema in docs/DATA_MODEL.md: patients, receipts, correction
// audit, clinic settings, and a versioned backup envelope.
import { uid, normalizePhone } from './utils.js';

const DB_NAME = 'seven';
const DB_VERSION = 1;
const SCHEMA_VERSION = 1;
const BACKUP_FORMAT = 'seven.backup';

export const SERVICES = [
  { id: 's1', ar: 'كشف ومعاينة' },
  { id: 's2', ar: 'حشوات وتجميل' },
  { id: 's3', ar: 'علاج عصب وجذور' },
  { id: 's4', ar: 'خلع وجراحة' },
  { id: 's5', ar: 'تنظيف وتجليح لثة' },
  { id: 's6', ar: 'تركيبات أسنان' },
  { id: 's7', ar: 'تقويم أسنان' },
  { id: 's8', ar: 'أشعة تشخيصية' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', ar: 'نقداً (كاش)' },
  { id: 'wallet', ar: 'محفظة إلكترونية' },
  { id: 'bank', ar: 'حوالة بنكية' },
];

export const DEFAULT_SETTINGS = {
  clinicNameAr: 'عيادة السعيدي لطب وجراحة الفم والأسنان',
  clinicNameEn: 'ALSSAEDY CLINIC FOR DENTISTRY',
  doctorNameAr: 'د/ صلاح الدين السعيدي',
  doctorNameEn: 'Dr. Salahaldeen Alssaedy',
  specialty: 'طب وجراحة الفم والأسنان',
  address: 'ريمة - كسمة - عزلة الضبارة',
  contacts: ['+967 716 339 366', '+967 739 550 138', '+967 775 956 520'],
  defaultCurrencyCode: 'YER',
  receiptTemplateVersion: '1',
  updatedAt: null,
};

let _db = null;

function open() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('patients')) {
        db.createObjectStore('patients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('receipts')) {
        const s = db.createObjectStore('receipts', { keyPath: 'id' });
        s.createIndex('patientId', 'patientId', { unique: false });
        s.createIndex('receiptNumber', 'receiptNumber', { unique: false });
        s.createIndex('receiptDate', 'receiptDate', { unique: false });
      }
      if (!db.objectStoreNames.contains('audits')) {
        const s = db.createObjectStore('audits', { keyPath: 'id' });
        s.createIndex('receiptId', 'receiptId', { unique: false });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(storeName, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    let result;
    try { result = fn(store); } catch (err) { reject(err); return; }
    t.oncomplete = () => resolve(result && result.__req ? result.__req.result : result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

function req(request) { return { __req: request }; }

function getAll(storeName) {
  return tx(storeName, 'readonly', (s) => req(s.getAll()));
}
function getOne(storeName, key) {
  return tx(storeName, 'readonly', (s) => req(s.get(key)));
}
function putOne(storeName, value) {
  return tx(storeName, 'readwrite', (s) => { s.put(value); return value; });
}
function deleteOne(storeName, key) {
  return tx(storeName, 'readwrite', (s) => { s.delete(key); });
}

/* ---------- Meta / settings ---------- */
export async function getSettings() {
  const row = await getOne('meta', 'settings');
  return { ...DEFAULT_SETTINGS, ...(row ? row.value : {}) };
}

export async function saveSettings(patch) {
  const current = await getSettings();
  const next = { ...current, ...patch, updatedAt: Date.now() };
  await putOne('meta', { key: 'settings', value: next });
  return next;
}

async function nextCounter(name) {
  const row = await getOne('meta', `counter:${name}`);
  const value = (row ? row.value : 0) + 1;
  await putOne('meta', { key: `counter:${name}`, value });
  return value;
}

/* ---------- Patients ---------- */
export async function listPatients({ includeArchived = false } = {}) {
  const all = await getAll('patients');
  const rows = includeArchived ? all : all.filter((p) => !p.archivedAt);
  return rows.sort((a, b) => String(a.fullName).localeCompare(String(b.fullName), 'ar'));
}

export function getPatient(id) { return getOne('patients', id); }

export async function searchPatients(query) {
  const q = String(query || '').trim().toLowerCase();
  const rows = await listPatients();
  if (!q) return rows;
  return rows.filter((p) =>
    String(p.fullName).toLowerCase().includes(q) ||
    String(p.phone || '').toLowerCase().includes(q));
}

export async function createPatient({ fullName, phone }) {
  const now = Date.now();
  const patient = {
    id: uid('pat'),
    fullName: String(fullName).trim(),
    phone: normalizePhone(phone),
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  await putOne('patients', patient);
  return patient;
}

export async function updatePatient(id, patch) {
  const current = await getPatient(id);
  if (!current) throw new Error('المريض غير موجود');
  const next = {
    ...current,
    ...patch,
    fullName: patch.fullName != null ? String(patch.fullName).trim() : current.fullName,
    phone: patch.phone != null ? normalizePhone(patch.phone) : current.phone,
    updatedAt: Date.now(),
  };
  await putOne('patients', next);
  return next;
}

export async function setPatientArchived(id, archived) {
  return updatePatient(id, { archivedAt: archived ? Date.now() : null });
}

/* ---------- Receipt numbering ---------- */
function receiptNumber(year, seq) {
  return `REC-${year}-${String(seq).padStart(4, '0')}`;
}

async function allocateReceiptNumber(dateISO) {
  const year = String(dateISO || '').slice(0, 4) || String(new Date().getFullYear());
  const seq = await nextCounter(year);
  return receiptNumber(year, seq);
}

/* ---------- Receipts ---------- */
export async function listReceipts({ includeDrafts = true, includeVoid = true } = {}) {
  const all = await getAll('receipts');
  const rows = all.filter((r) => {
    if (!includeDrafts && r.status === 'draft') return false;
    if (!includeVoid && r.status === 'voided') return false;
    return true;
  });
  return rows.sort((a, b) => {
    const d = String(b.receiptDate).localeCompare(String(a.receiptDate));
    return d !== 0 ? d : (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export function getReceipt(id) { return getOne('receipts', id); }

export async function receiptsForPatient(patientId) {
  const all = await listReceipts();
  return all.filter((r) => r.patientId === patientId);
}

function buildSnapshot(patient, settings) {
  const c = settings;
  return {
    clinicNameAr: c.clinicNameAr,
    clinicNameEn: c.clinicNameEn,
    doctorNameAr: c.doctorNameAr,
    doctorNameEn: c.doctorNameEn,
    specialty: c.specialty,
    address: c.address,
    contacts: [...(c.contacts || [])],
    logoAsset: './assets/logo.png',
  };
}

// Validate common receipt input; returns a list of { field, message }.
export function validateReceiptInput(input) {
  const errors = [];
  if (!input.patientId && !String(input.payerName || '').trim()) {
    errors.push({ field: 'payerName', message: 'اختر مريضاً أو اكتب اسم المستلم' });
  }
  if (!input.receiptDate) errors.push({ field: 'receiptDate', message: 'تاريخ السند مطلوب' });
  const paid = Number(input.paidNowMinor) || 0;
  const total = input.totalAccountMinor == null ? paid : Number(input.totalAccountMinor) || 0;
  if (paid <= 0) errors.push({ field: 'paidNowMinor', message: 'المبلغ المدفوع يجب أن يكون أكبر من صفر' });
  if (total < paid) errors.push({ field: 'totalAccountMinor', message: 'إجمالي الحساب لا يمكن أن يقل عن المدفوع' });
  if (!input.currencyCode) errors.push({ field: 'currencyCode', message: 'العملة مطلوبة' });
  if (!input.paymentMethod) errors.push({ field: 'paymentMethod', message: 'طريقة الدفع مطلوبة' });
  return errors;
}

function baseReceipt(input, settings, patient, status) {
  const now = Date.now();
  const total = input.totalAccountMinor == null ? Number(input.paidNowMinor) || 0 : Number(input.totalAccountMinor) || 0;
  const paid = Number(input.paidNowMinor) || 0;
  return {
    id: input.id || uid('rec'),
    receiptNumber: input.receiptNumber || null,
    patientId: input.patientId || null,
    payerNameSnapshot: String(input.payerNameSnapshot || (patient ? patient.fullName : input.payerName) || '').trim(),
    payerPhoneSnapshot: normalizePhone(input.payerPhoneSnapshot || (patient ? patient.phone : input.payerPhone) || ''),
    receiptDate: input.receiptDate,
    currencyCode: input.currencyCode || settings.defaultCurrencyCode || 'YER',
    totalAccountMinor: total,
    paidNowMinor: paid,
    remainingMinor: Math.max(0, total - paid),
    paymentMethod: input.paymentMethod,
    transferReference: input.transferReference || '',
    transferSource: input.transferSource || '',
    selectedServices: Array.isArray(input.selectedServices) ? [...input.selectedServices] : [],
    otherService: String(input.otherService || '').trim(),
    amountInWords: String(input.amountInWords || '').trim(),
    amountInWordsManual: !!input.amountInWordsManual,
    notes: String(input.notes || '').trim(),
    status,
    clinicSnapshot: buildSnapshot(patient, settings),
    createdAt: input.createdAt || now,
    updatedAt: now,
    issuedAt: status === 'issued' ? now : null,
    voidedAt: null,
    voidReason: null,
    schemaVersion: SCHEMA_VERSION,
  };
}

export async function saveDraft(input) {
  const settings = await getSettings();
  const patient = input.patientId ? await getPatient(input.patientId) : null;
  const receipt = baseReceipt(input, settings, patient, 'draft');
  await putOne('receipts', receipt);
  return receipt;
}

// Issue: allocate a unique receipt number and freeze identity snapshots.
export async function issueReceipt(input) {
  const settings = await getSettings();
  const patient = input.patientId ? await getPatient(input.patientId) : null;
  const receipt = baseReceipt(input, settings, patient, 'issued');
  receipt.receiptNumber = await allocateReceiptNumber(receipt.receiptDate);
  receipt.issuedAt = Date.now();
  await putOne('receipts', receipt);
  return receipt;
}

// Limited, audited correction of an issued receipt. Financial fields,
// currency, patient association, and receipt number are not silently changed.
const LOCKED_FIELDS = ['receiptNumber', 'patientId', 'currencyCode', 'totalAccountMinor', 'paidNowMinor'];

export async function correctReceipt(id, patch, reason) {
  const current = await getReceipt(id);
  if (!current) throw new Error('السند غير موجود');
  if (current.status !== 'issued') throw new Error('لا يمكن تعديل سند غير مُصدر');
  if (!String(reason || '').trim()) throw new Error('سبب التعديل مطلوب');

  const same = (a, b) => {
    if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a || []) === JSON.stringify(b || []);
    return a === b;
  };
  const changes = [];
  const next = { ...current };
  for (const key of Object.keys(patch)) {
    if (LOCKED_FIELDS.includes(key)) continue;
    if (same(patch[key], current[key])) continue;
    changes.push({ field: key, oldValue: current[key], newValue: patch[key] });
    next[key] = patch[key];
  }
  if (!changes.length) return null;

  next.updatedAt = Date.now();
  const audit = {
    id: uid('aud'),
    receiptId: id,
    changedAt: Date.now(),
    reason: String(reason).trim(),
    changes,
    correctionSequence: (await listAudits(id)).length + 1,
  };

  // Atomic: write the receipt and its audit entry in one transaction.
  await open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(['receipts', 'audits'], 'readwrite');
    t.objectStore('receipts').put(next);
    t.objectStore('audits').put(audit);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
  return next;
}

export async function voidReceipt(id, reason) {
  const current = await getReceipt(id);
  if (!current) throw new Error('السند غير موجود');
  const next = { ...current, status: 'voided', voidedAt: Date.now(), voidReason: String(reason || '').trim(), updatedAt: Date.now() };
  await putOne('receipts', next);
  return next;
}

/* ---------- Audit ---------- */
export async function listAudits(receiptId) {
  const all = await getAll('audits');
  return all.filter((a) => a.receiptId === receiptId).sort((a, b) => a.changedAt - b.changedAt);
}

/* ---------- Backup / restore ---------- */
export async function exportBackup() {
  const [patients, receipts, audits, settings] = await Promise.all([
    getAll('patients'), getAll('receipts'), getAll('audits'), getSettings(),
  ]);
  const meta = await getAll('meta');
  const counters = meta.filter((m) => String(m.key).startsWith('counter:'));
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    patients,
    receipts,
    audits,
    clinicSettings: settings,
    counters,
  };
}

// Validate a parsed backup envelope; throws with an Arabic message on failure.
export function validateBackup(data) {
  if (!data || typeof data !== 'object') throw new Error('ملف النسخة غير صالح');
  if (data.format !== BACKUP_FORMAT) throw new Error('صيغة الملف غير معروفة');
  if (Number(data.schemaVersion) > SCHEMA_VERSION) throw new Error('النسخة أحدث من التطبيق الحالي');
  for (const key of ['patients', 'receipts', 'audits']) {
    if (!Array.isArray(data[key])) throw new Error(`قسم ${key} مفقود أو تالف`);
  }
  const ids = new Set();
  for (const p of data.patients) {
    if (!p || !p.id || !p.fullName) throw new Error('توجد سجلات مرضى غير صالحة');
    if (ids.has(p.id)) throw new Error('توجد معرفات مكررة في المرضى');
    ids.add(p.id);
  }
  const rids = new Set();
  for (const r of data.receipts) {
    if (!r || !r.id || !r.receiptDate) throw new Error('توجد سندات غير صالحة');
    if (rids.has(r.id)) throw new Error('توجد معرفات مكررة في السندات');
    rids.add(r.id);
  }
  return true;
}

// Replace all current data with a validated backup, in one atomic transaction.
export async function importBackup(data) {
  validateBackup(data);
  const db = await open();
  await new Promise((resolve, reject) => {
    const t = db.transaction(['patients', 'receipts', 'audits', 'meta'], 'readwrite');
    const ps = t.objectStore('patients');
    const rs = t.objectStore('receipts');
    const as = t.objectStore('audits');
    const ms = t.objectStore('meta');
    ps.clear(); rs.clear(); as.clear();
    // Keep counters? Restore them so numbering continues safely.
    for (const p of data.patients) ps.put(p);
    for (const r of data.receipts) rs.put(r);
    for (const a of data.audits) as.put(a);
    for (const c of (data.counters || [])) ms.put(c);
    if (data.clinicSettings) ms.put({ key: 'settings', value: { ...DEFAULT_SETTINGS, ...data.clinicSettings } });
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
  return true;
}

/* ---------- Counts ---------- */
export async function counts() {
  const [patients, receipts] = await Promise.all([listPatients(), listReceipts()]);
  return {
    patients: patients.length,
    receipts: receipts.filter((r) => r.status === 'issued').length,
    drafts: receipts.filter((r) => r.status === 'draft').length,
  };
}
