# SEVEN — Data Model and Persistence Contract

**Status:** Proposed schema aligned with user-approved decisions. This document is a design artifact, not implementation. Field-level receipt-correction rules and several validation details remain open.

## 1. Principles

- Store records locally on the device in Release 1; no cloud sync.
- Support explicit manual full-data backup and restore.
- Use stable generated IDs; never use patient name or phone as a primary key.
- Keep patient records separate from receipts; one patient can be linked to many receipts.
- Store historical snapshots for issued receipt identity.
- Use synthetic data in tests. Never place real patient data in GitHub.
- Store money as integer minor units where supported by the currency, or use a carefully validated decimal representation; never use imprecise binary floating-point arithmetic as the authoritative money value.
- Store timestamps in a consistent machine-readable format and receipt date as a local calendar date to avoid timezone shifts.

## 2. Patient

| Field | Type / rule | Notes |
|---|---|---|
| id | Stable string ID, required, immutable | Primary key |
| fullName | String, required after trimming | Reject blank-only input |
| phone | String, required after normalization/validation | Preserve leading + when present; do not treat as numeric |
| createdAt | Timestamp | Set on creation |
| updatedAt | Timestamp | Update on edits |
| archivedAt | Timestamp or null | Proposed archive behavior; deletion policy remains to be finalized |

Phone number uniqueness is not approved. Do not block shared family phone numbers unless separately decided. Exact phone normalization and supported formats remain open.

## 3. Receipt

| Field | Type / rule | Notes |
|---|---|---|
| id | Stable string ID, immutable | Primary key |
| receiptNumber | Unique string, nullable before issue | Allocated according to approved sequence at issue time |
| patientId | Patient ID or null only if payer-not-patient flow is approved | Relationship must be explicit |
| payerNameSnapshot | String | Preserve name as printed at issue time |
| payerPhoneSnapshot | String | Preserve phone as printed at issue time |
| receiptDate | Local date in ISO year-month-day format | Editable according to lifecycle rules |
| currencyCode | Supported currency code; default YER | Other currencies must be explicitly supported |
| totalAccountMinor | Integer / exact decimal in currency minor units | Total service/account amount |
| paidNowMinor | Integer / exact decimal in currency minor units | Amount received for this receipt |
| remainingMinor | Derived or verified persisted value | Must equal total account minus paid now for the approved single-transaction model |
| paymentMethod | Enum, e.g. cash, wallet, bank transfer | Final labels/options to be approved |
| transferReference | Optional string | Shown when relevant |
| selectedServices | Array of approved service IDs | Eight defined treatment categories |
| otherService | Optional string | For “خدمات أخرى” |
| amountInWords | String plus generation/source metadata if editable | Must match amount/currency; exact strategy remains open |
| status | draft, issued, or voided | Lifecycle behavior must be designed |
| clinicSnapshot | Structured identity snapshot | Prevent current settings from rewriting issued receipt |
| createdAt / updatedAt | Timestamps | Audit lifecycle |
| issuedAt | Timestamp or null | Set on issue |
| voidedAt / voidReason | Timestamp/string or null | If voiding is approved |
| schemaVersion | Integer | Supports backup migration |

The remaining value should preferably be derived from totalAccount and paidNow; if persisted for output or querying, validate it against the formula. Prevent negative amounts unless an explicitly approved workflow defines refunds/credits.

If the application allows a payer who is not the patient, define whether patientId may be null and require payer name/phone snapshots. Do not silently create a patient record just to print a receipt.

## 4. Issued-receipt correction audit

Each correction creates a separate immutable audit entry. Do not overwrite or discard the old values.

| Field | Type / rule | Notes |
|---|---|---|
| id | Stable string ID | Primary key |
| receiptId | Required reference | Receipt being corrected |
| changedAt | Timestamp | When correction was saved |
| reason | Non-empty text | Required for an issued receipt correction |
| changes | Array of field-change records | Each has field, oldValue, newValue |
| actorLabel | Optional local label | No staff-account/role system is implied |
| correctionSequence | Integer | Monotonic per receipt if practical |

Design constraint: receipt number, currency, financial amounts, and patient association must not be silently modified. The final field allowlist and whether material changes require void-and-reissue are open design decisions. A correction must be atomic: either the receipt and audit record both save, or neither does.

## 5. Clinic settings

| Field | Type / rule | Notes |
|---|---|---|
| clinicNameAr | Required string | Arabic clinic name |
| clinicNameEn | String | English LTR name |
| doctorNameAr / doctorNameEn | Strings | Supplied clinic identity |
| specialty | String | Clinic specialty |
| address | String | Supplied clinic address |
| contacts | String array | Supplied contact numbers |
| logoAsset | Optional local asset/blob reference | Only after the actual approved logo is supplied |
| defaultCurrencyCode | Defaults to YER | Alternative supported currency may be chosen |
| receiptTemplateVersion | String/integer | Helps keep output reproducible |
| updatedAt | Timestamp | Settings update time |

An issued receipt should carry the relevant clinicSnapshot, rather than relying solely on the current settings.

## 6. Backup envelope

Manual backup contains a versioned envelope such as:
- format: fixed application backup format identifier
- schemaVersion: supported data schema version
- exportedAt: timestamp
- patients: records
- receipts: records
- receiptCorrectionAudit: audit entries
- clinicSettings: settings

Backup rules:
1. User initiates export and chooses where to save/share the file.
2. Do not claim the backup succeeded until the file is actually produced.
3. On restore, parse and validate the entire file, format identifier, version, IDs, relationships, and record shapes before changing current data.
4. Show a clear summary and require confirmation before replacing or merging data.
5. If validation or persistence fails, keep the existing data intact.
6. Test corrupt, unsupported-version, incomplete, and duplicate-ID backups.
7. Explain that local data may be lost if browser storage is cleared or the device is lost; users need to store backups somewhere separate.

## 7. Open schema decisions

- Whether patient phone must be unique (currently not assumed).
- Patient archive/deletion behavior.
- Whether receipts may be issued to a payer who is not an existing patient.
- Exact numbering sequence and void/gap behavior.
- Exact list of editable fields after issue and required correction reason.
- Supported alternative currencies and decimal precision.
- Whether amount-in-words is generated, manually adjusted, or both.
- Whether remaining is purely derived or stored as a verified snapshot.
- Whether a receipt represents one partial payment or the entire account settlement.

## 8. Gate

This model must be reconciled with the approved page map and wireframes. No app code, database implementation, or migration should begin until the user approves the final model and receipt lifecycle.
