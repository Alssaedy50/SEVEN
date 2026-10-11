# SEVEN — Detailed Page Map (Release 1)

**Status:** Updated draft aligned with approved operating decisions. Wireframes and detailed interactions still require review; no application code is authorized by this document.

## 1. Approved release boundary

Release 1 includes only:
1. Patient records.
2. Receipt creation and management.
3. Receipt preview.
4. Receipt export/share/print output.
5. Receipt history.
6. Essential clinic and receipt settings.

No appointments, clinical notes, diagnoses, prescriptions, inventory, staff accounts, analytics, subscriptions, cloud sync, or unrelated modules are included unless separately approved.

## 2. Design and implementation rules

- SEVEN is a clean-room project: AQSA7 may inform product questions only. Do not copy its code, UI, styling, components, or technical architecture.
- Design and approve the page map first, then page wireframes, then control/action specifications, then visual design, and only then implementation.
- This map is a proposal; the user must approve or amend it before detailed interface design.
- Mobile-first for Android phone screens; Arabic is primary and right-to-left. English clinic identity and mixed-direction values must render correctly.
- Every control needs a documented purpose, preconditions, result, error state, and test.
- Do not imply that export, printing, sharing, or persistence works until tested on the intended environment.
- Patient data is sensitive. Do not use real patient information in test data.

## 3. Proposed app navigation

**Recommended primary navigation:** a compact mobile navigation with four destinations:
- **الرئيسية** — overview and shortcuts.
- **المرضى** — patient directory and patient records.
- **السجل** — receipt history.
- **الإعدادات** — clinic identity and essential output settings.

A prominent **سند جديد** action should be reachable from Home, Patients, and History. It opens the receipt form. This avoids giving receipt creation a separate permanent navigation tab while keeping it easy to reach.

This navigation arrangement remains a design proposal for review; storage, default currency, and required patient phone decisions are already approved.

## 4. Page inventory

### P01 — Home / الرئيسية

**Purpose:** A quick starting point for the clinic's two core tasks, not a reporting dashboard.

**Content:**
- Clinic identity in a compact header.
- Primary action: إنشاء سند قبض.
- Secondary action: إضافة مريض.
- Shortcuts to المرضى and سجل السندات.
- Optional small counts (number of saved patients / receipts) only if reliable and useful; no charts or business analytics.

**Actions and destinations:**
- إنشاء سند قبض → P04 Receipt Form.
- إضافة مريض → P03 Patient Form in create mode.
- عرض المرضى → P02 Patient List.
- عرض السجل → P07 Receipt History.
- الإعدادات → P09 Settings.

**States:** initial loading; first-use empty state; normal state; data-load error with a retry action.

**Out of scope:** financial performance charts, clinical metrics, reminders, appointment widgets.

### P02 — Patient List / المرضى

**Purpose:** Find a patient or start a patient record.

**Content:**
- Search field.
- Patient list rows with only the approved identifying fields (proposed: full name and one secondary identifier such as phone number).
- Add-patient action.
- Clear empty state with add-patient action.
- Search-no-results state.

**Actions and destinations:**
- إضافة مريض → P03 Patient Form in create mode.
- Select patient → P05 Patient Details.
- Clear search → full list.
- إنشاء سند → P04 Receipt Form; if launched from a patient row, preselect that patient.

**Approved field rule:** full name and phone number are required. Phone uniqueness is not decided; do not reject shared family phone numbers by default. Archive/deletion behavior remains open.

### P03 — Patient Form / إضافة أو تعديل مريض

**Purpose:** Create a new patient or edit an existing patient's basic record.

**Proposed fields (final list requires approval):**
- Full name (required).
- Phone number (required; validate and normalize as text, not a number).
- Optional patient note or secondary identifier only if clearly needed for receipt identification; no clinical record fields in Release 1.

**Actions:**
- حفظ → validate, save, and open P05 Patient Details (new patient) or return to P05 (edit).
- إلغاء / رجوع → leave without saving; if there are unsaved changes, ask for confirmation.
- Validation messages → shown next to the relevant field in clear Arabic.

**States:** create; edit; validation errors; saving; save failure; unsaved-changes confirmation.

**Important:** this page is for patient identity/administration only, not diagnoses, examinations, or medical notes.

### P04 — Receipt Form / سند قبض جديد

**Purpose:** Enter and save the receipt details before previewing/exporting.

**Entry points:** Home, Patient List, Patient Details, Receipt History.

**Proposed fields:**
- Patient: select an existing patient, or record a received-from name when the payer is not an existing patient.
- Receipt date (default to current local date, editable).
- Amount paid (required, numeric, greater than zero).
- Currency (default to the clinic-approved currency).
- Payment method (Cash or transfer/wallet/bank, based on approved choices).
- Transfer reference and sender details only when relevant to the selected method.
- Amount in words: determine whether it is generated automatically, manually entered, or optional before wireframing.
- Receipt number: generated by a documented rule; never rely on a visible label alone.

**Actions:**
- معاينة السند → validate and open P06 Receipt Preview; clarify whether preview is before or after saving.
- حفظ كمسودة → include only if draft workflow is approved.
- إلغاء → return to origin; warn if entered data would be lost.
- Select/add patient → use P02/P03 without losing the receipt form unexpectedly; exact flow to be designed.

**States:** blank; partially filled; invalid values; conditional transfer fields; saving; save failure; duplicate-number protection.

**Decision still open:** whether preview saves a draft or follows explicit issue. Never allocate an issued receipt number merely because the form opens.

### P05 — Patient Details / ملف المريض

**Purpose:** Show the selected patient's administrative details and related receipts.

**Content:**
- Patient name and approved identity fields.
- Edit-patient action.
- Related receipt list (most recent first), with date, receipt number, and amount.
- Empty state when no receipts are linked.

**Actions:**
- تعديل البيانات → P03 Patient Form in edit mode.
- سند جديد لهذا المريض → P04 with patient preselected.
- Open receipt → P06 Receipt Preview in view-existing mode.
- Back → return to the originating list when possible.

**States:** loading; normal; no related receipts; patient not found; load error.

### P06 — Receipt Preview / معاينة السند

**Purpose:** Display the exact receipt output before the user exports, prints, or shares it.

**Content:**
- Receipt design using clinic settings and stored receipt data.
- Clinic/doctor identity and approved contact details.
- Receipt number, date, received-from/patient name, amount, currency, amount in words if enabled, payment method, and transfer details if relevant.
- Output profile selector only if multiple profiles are approved.

**Actions:**
- تصدير PDF / تنزيل PDF → create a real PDF file.
- مشاركة → invoke the supported phone share flow with the actual output file, or show a truthful failure message.
- طباعة → invoke supported print behavior if implemented and tested.
- تعديل البيانات → return to P04 for a new/unsaved receipt or to an approved edit flow for an existing receipt.
- رجوع → return to the correct originating context.

**States:** render loading; preview ready; missing required data; export in progress; export success; export/share/print failure.

**Output candidates for later approval:** A5 portrait (148 × 210 mm), A4, and/or 80 mm thermal. Do not assume all formats are required until the user approves them. Screen preview and final output dimensions must match.

### P07 — Receipt History / سجل السندات

**Purpose:** Find and reopen saved receipts.

**Content:**
- Search by receipt number, patient/received-from name, and any supported identifier.
- Date filter; payment-method filter only if useful and straightforward.
- Receipt rows with number, date, recipient, amount, and status if lifecycle statuses are approved.
- Empty and no-results states.

**Actions:**
- Open receipt → P06 in view-existing mode.
- سند جديد → P04.
- Clear filters → full history.
- Any void/delete action must be separately specified, confirmed, and recoverable according to an approved policy; do not add it by default.

**States:** loading; empty history; search no results; normal list; data-load error.

### P08 — Clinic Identity Settings / بيانات العيادة

**Purpose:** Manage the clinic details printed on the receipt.

**Proposed fields based on information supplied for this project:**
- Arabic clinic name.
- English clinic name.
- Doctor name in Arabic and English, if both are needed on the receipt.
- Specialty.
- Address.
- Contact numbers.
- Logo upload only if it can be implemented reliably and the user wants it.

**Actions:**
- حفظ التغييرات → validate and persist settings.
- إلغاء → discard unsaved changes with confirmation if needed.
- Preview receipt → open a representative preview using non-patient sample data, if practical.

**States:** initial setup; editing; validation; saving; failure.

**Privacy note:** settings belong on the receipt and relevant settings page only; avoid displaying contact details elsewhere unnecessarily.

### P09 — Essential Receipt Settings / إعدادات السند

**Purpose:** Configure only options required to generate a consistent receipt.

**Candidate settings requiring approval:**
- Default currency.
- Default paper/output profile.
- Receipt numbering rule or next-number policy, if configurable.
- Amount-in-words behavior.
- Optional logo and a small set of receipt appearance choices only if essential.

**Actions:**
- حفظ → persist settings.
- استعادة الافتراضي → only if a clear confirmation and sensible defaults exist.

**Out of scope by default:** large template marketplace, extensive theme controls, font laboratory, multi-workspace configuration, sync providers, cloud accounts, and advanced backup management.

### P10 — Confirmation and Feedback Dialogs / نوافذ التأكيد والرسائل

These are reusable interaction patterns, not separate primary navigation pages.

**Required dialogs/messages:**
- Unsaved changes: stay / discard.
- Confirm any destructive or irreversible action.
- Save success/failure.
- Export/share/print success/failure based on the actual result.
- Missing/invalid required fields.
- No search results and no records yet.
- Data unavailable / retry.

**Rule:** never show success before the operation has actually succeeded.

## 5. Main user flows

### Flow A — Add a patient
Home or Patient List → Patient Form → validation/save → Patient Details → optionally create a receipt for this patient.

### Flow B — Create and export a receipt
Home or Patient Details → Receipt Form → validate → Preview → export/share/print → return to preview or receipt details.

The save/issue point must be decided before the final wireframe so a receipt cannot be exported without an intentional and understood persistence state.

### Flow C — Find an old receipt
Receipt History → search/filter → open receipt preview → export/share/print again if allowed.

### Flow D — Update clinic receipt identity
Settings → Clinic Identity → edit → save → new preview reflects saved identity. Existing receipt behavior after a settings change must be decided: preserve a historical snapshot or render using current clinic settings.

## 6. Global layout and navigation rules

- Primary language Arabic with RTL alignment; English brand text and international digits must remain readable.
- Mobile-first layout; no horizontal scrolling for primary tasks.
- Primary action placement must be consistent.
- Back navigation should preserve list search/filter context where practical.
- Form errors must be actionable and located near the relevant field.
- Confirm before discarding unsaved input.
- Loading and error states must not look like an empty list.
- Do not rely on color alone for status or errors.
- No visible button may be decorative or inert.

## 7. Decisions to settle before wireframes

1. Review the proposed page inventory and four-destination navigation.
2. Decide patient archive/deletion behavior; name and phone are required, but phone uniqueness is not decided.
3. Define the draft/issue/preview sequence and receipt numbering.
4. Define the field allowlist for limited post-issue corrections, audit reason and display, and void/reissue handling for material financial changes.
5. Confirm output deliverables and verify A5 portrait (148 × 210 mm), PDF/PNG/print/share behavior.
6. Define supported alternative currencies, precision, and amount-in-words behavior; YER is the default.
7. Confirm the clinic/patient identity snapshot behavior for issued receipts.
8. Verify the actual logo asset and decide whether logo upload/change is in Release 1.
9. Design manual full-data backup and restore, including invalid-file handling and explicit replacement confirmation.
10. Confirm the PWA/local-storage technical stack only after the design and data model are approved.

## 8. Approval gate

Do not begin visual UI design until the user has reviewed this map and confirmed changes. After approval, produce low-fidelity wireframes for each approved page, then an interaction inventory (each control, action, validation, success/error states, and test). No app code until the wireframes and interaction inventory are approved.
