# SEVEN Product Specification — Release 1

**Status:** Product scope and key operating decisions approved. Page map, wireframes, interaction inventory, and detailed data model remain subject to design review. No application implementation is authorized yet.

## 1. Purpose

Create a new mobile-first application for the dental clinic's administrative needs: patient records and professional receipt creation, preview, export, and history.

SEVEN is developed independently using only its own approved product requirements and design assets.

## 2. Approved release scope

- Patient records.
- Receipt creation and controlled management/correction.
- Receipt preview.
- Receipt export/share/print output.
- Receipt history and audit trail for issued-receipt corrections.
- Essential clinic identity and receipt settings.
- Manual export and restoration of a complete local-data backup.

Not included unless the user explicitly approves a scope change: appointments, clinical notes, diagnoses, prescriptions, inventory, advanced accounting, staff roles, analytics, cloud sync, multi-workspace platform features, or unrelated modules.

## 3. Clinic identity and language

- Arabic is the primary interface language and uses RTL layout.
- English clinic identity is displayed LTR where appropriate.
- Arabic clinic name: عيادة السعيدي لطب وجراحة الفم والأسنان
- English identity: ALSSAEDY CLINIC FOR DENTISTRY
- Doctor: د/ صلاح الدين السعيدي / Dr. Salahaldeen Alssaedy
- Specialty: طب وجراحة الفم والأسنان
- Address: ريمة - كسمة - عزلة الضبارة
- Contact numbers: +967 716 339 366, +967 739 550 138, +967 775 956 520
- Visual direction supplied: navy #0E2A47, cyan #00B4D8, teal #00897B, with cool silver/gray accents.
- The logo must only be included once the actual approved transparent asset is available and verified; do not invent or claim an asset exists.
- Do not expose clinic contact details in unrelated screens or logs.

## 4. UX principles

- Mobile-first, designed first for use on an Android phone.
- Arabic-first RTL with reliable mixed Arabic/English/numeric text.
- No horizontal scrolling for primary workflows.
- Clear loading, empty, validation, success, and error states.
- Every control must have a documented purpose and a verified action.
- Confirm before discarding unsaved input or performing destructive actions.
- Use synthetic patient data for development and testing.
- Do not report mobile, export, print, share, backup, or restore acceptance unless tested.

## 5. Approved data, storage, and privacy decisions

- Release 1 is single-device/local: patient, receipt, settings, and audit data are stored locally on the phone.
- Manual full-data backup and restore are in Release 1; cloud synchronization is not.
- IndexedDB is the current engineering recommendation for structured local web-app data, subject to validation during stack selection.
- Patient full name and phone number are required. Phone uniqueness is not decided; do not assume it.
- Use stable internal IDs independent of names and phone numbers.
- Never commit real patient data, access tokens, API keys, OAuth secrets, or production backups.
- Local storage is not itself a backup. Clearly warn that clearing browser/app data or losing the device may cause data loss unless a current backup exists.
- Backups must be user-initiated, validate format/schema before restore, and not overwrite current data until validation and explicit confirmation succeed.
- Do not claim encryption, cloud sync, or recovery behavior that is not implemented and verified.

## 6. Receipt requirements

### 6.1 Core receipt data

The design must distinguish:
- Total account amount.
- Amount paid now / received.
- Remaining amount.

Remaining amount is derived as total account amount minus amount paid now, and must not be negative under the agreed single-transaction interpretation. The design must clarify partial-payment behavior before implementation.

Default currency is Yemeni rial (YER). An alternative supported currency may be selected when needed. The supported alternative-currency list and precision/amount-in-words rules remain open.

### 6.2 Lifecycle and numbering

- Draft, issue, and preview behavior must be explicit.
- Receipt numbers are unique and are allocated according to an approved rule when a receipt is issued, not merely because a form is opened.
- An issued receipt cannot be silently edited.
- Limited corrections to issued receipts are allowed through a controlled workflow and must produce an audit record.
- The audit record should retain receipt ID, field(s) changed, prior value, new value, timestamp, reason, and correction actor/device label if available. Do not fabricate a user-account system in this single-device release.
- The exact editable-field allowlist and treatment of material financial changes remain open. Amount, currency, patient association, and receipt number must not be silently changed.
- Voiding/replacement rules and number gaps must be documented before implementation.
- Issued receipts and their correction history must remain discoverable in history.

### 6.3 Amount in words

Arabic amount-in-words is required by the supplied receipt brief. Choose and test a reliable approach for supported currencies; define rounding and decimal/subunit handling. A manually reviewed override may be considered if clearly documented. Do not display a generated value as reliable until tested across representative amounts.

### 6.4 A5 paper template and digital receipt

The target print format is A5 portrait (148 × 210 mm), with two modes:
1. Blank print template for paper receipt books, with empty fields and service checkboxes, no real patient information or issued receipt number.
2. Digitally filled receipt, populated from saved/pending data and showing selected services, currency, amount in words, total account, paid now, and remaining.

The specified layout includes Arabic doctor identity on the right, logo centered, English clinic/doctor identity on the left; central “سند قبض” badge; receipt number/date; patient/payer name and phone; amount/currency; amount in words; payment method and transfer reference when applicable; eight treatment-service choices plus other services; total/paid/remaining boxes; receiver/accountant signature lines; clinic address and contacts in footer.

Services:
1. كشف ومعاينة
2. حشوات وتجميل
3. علاج عصب وجذور
4. خلع وجراحة
5. تنظيف وتجليج لثة
6. تركيبات أسنان
7. تقويم أسنان
8. أشعة تشخيصية

Separate the receipt print component from data-entry screens. Prefer vector-based PDF for crisp text and layout; generate high-resolution PNG as a derived export when needed. Exact 100% matching to an existing paper original cannot be claimed without inspecting that original. Verify actual A5 dimensions, margins, RTL, and Android print/share behavior.

### 6.5 Historical identity

The proposed behavior is to store a snapshot of the clinic and patient/payer identity used on an issued receipt so later settings edits do not rewrite the historical document. Confirm this behavior in the wireframes before implementation.

## 7. Technical direction (provisional)

Proposed: responsive web app installable as a PWA on Android, with local structured storage (likely IndexedDB), manual backup/restore, and a separately rendered receipt template. This is a recommendation, not a completed implementation or final stack approval.

Do not select libraries or begin coding until page map, wireframes, interaction inventory, data model, backup/restore behavior, receipt lifecycle, and output specifications are approved.

## 8. Acceptance process

A feature is complete only when:
1. Its behavior is specified.
2. Success and failure states are designed.
3. It is implemented.
4. Its acceptance test is run and the result recorded.

See [Detailed Page Map](design/PAGE_MAP.md), [Data Model](DATA_MODEL.md), [Interaction Inventory](design/INTERACTION_INVENTORY.md), and [Verification Checklist](VERIFICATION.md).
