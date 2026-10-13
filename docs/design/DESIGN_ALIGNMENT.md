# SEVEN — Stitch Export Alignment

**Status:** Working alignment note produced while converting the Stitch export into application code.

This note reconciles the imported Stitch screens under
`design/stitch-export/stitch_seven_dental_clinic_app/` with the design documents in
`docs/design/`. It records how each approved page from `PAGE_MAP.md` maps onto the
Stitch exports, and lists the decisions taken during implementation.

## 1. Screen mapping

The Stitch export uses `p01`–`p12` with its own names; `PAGE_MAP.md` uses `P01`–`P10`
with a different breakdown (its `P10` is the dialog set, not a page). The application
navigation follows `PAGE_MAP.md` section 3 (four destinations: الرئيسية، المرضى، السجل،
الإعدادات, with a prominent سند جديد action). Receipt number, date, and the immediate
stamp were deliberately separated from payment method to match the physical voucher.

| PAGE_MAP page | Stitch export | Application route | Notes |
|---|---|---|---|
| P01 Home | p01_home_dashboard | `#/home` | Action hub; no analytics. Patient/receipt counts derived from stored records. |
| P02 Patient List | p02_patient_list | `#/patients` | Search, empty, and no-results states kept. |
| P03 Patient Form (create) | p03_add_patient | `#/patients/new` | Full name + phone required. |
| P03 Patient Form (edit) | p11_edit_patient | `#/patients/:id/edit` | Stitch split edit into its own screen. |
| P04 Receipt Form | p04_create_receipt | `#/receipts/new` | |
| P05 Patient Details | p05_patient_details | `#/patients/:id` | Related receipts + archive. |
| P06 Receipt Preview / Output | p06_receipt_preview | `#/receipts/:id` | A5 portrait output; print / share / export. |
| P06 / P07 view existing | p08_receipt_details | (same as `#/receipts/:id`) | Stitch split the read-only view from the print preview. |
| P07 Receipt History | p07_receipt_history | `#/receipts` | Search + filters. |
| P08 + P09 Settings | p09_clinic_settings | `#/settings` | Consolidated into one page with two sections (see INTERACTION_INVENTORY section 9). |
| Backup / restore | p10_backup_restore | `#/backup` | Included; see `DATA_MODEL.md` section 6. |
| Edit receipt | p12_edit_receipt | `#/receipts/:id/edit` | Corrects an issued receipt through the audited flow. |
| Dialogs (P10) | inline in several screens | global dialog component | Unsaved-changes, confirm, success, failure, empty, no-results. |

## 2. Decisions taken during implementation

These are implementation choices made while converting the export. They follow the
approved decisions in `DECISIONS.md` and fill the open items (OPEN-00x) at a level
sufficient to build a testable Release 1. Items that change approved scope or financial
policy must still be reviewed before release.

1. **Screens are a visual source, not application code.** The exports use the Tailwind
   CDN, remote Google fonts and Material Symbols, demo data, and Google-hosted logo
   images. The application uses the same tokens (colors, radii, spacing, IBM Plex Sans)
   in a self-contained stylesheet and a local logo asset so it can work offline.
2. **Persistence.** IndexedDB, with a versioned store, per `DATA_MODEL.md`. A small
   promise wrapper is used instead of a framework.
3. **Money.** Stored as integer minor units. YER has no minor unit, so the stored value
   is whole riyals; the formatter adds thousands separators.
4. **Amount in words.** Arabic riyal number-to-words generator, with a manual override
   that is recorded in the audit trail when it differs from the generated value.
5. **Receipt number.** Allocated at issue time as `REC-YYYY-NNNN`, sequence reset per
   year, never reused for voided receipts.
6. **Save vs. issue.** `حفظ السند المالي` issues the receipt (status `issued`, number and
   identity snapshots allocated). `معاينة` previews the pending form without allocating a
   number. A draft is only created when the user explicitly chooses `حفظ كمسودة`.
7. **Snapshots.** Issued receipts store `clinicSnapshot` and `payerNameSnapshot` /
   `payerPhoneSnapshot` per `PROP-004`, so later settings edits do not rewrite history.
8. **Patient records.** The Stitch screens show gender, visit dates, treatment status,
   and balances. These are clinical/financial fields outside the approved Release 1
   patient scope (`PAGE_MAP.md` P03). Only name and phone are stored and shown; the
   extra Stitch fields are dropped until separately approved.
9. **Services.** The eight approved treatment categories are stored and printed.
   Stitch adds a ninth "زراعة وتثبيت" and a free-text "خدمات أخرى"; only the approved
   eight plus the free-text field are kept until the ninth category is approved.
10. **Patient archive (not delete).** Aligns with `PROP-006` / `OPEN-002`. Archiving is
    reversible and does not delete receipts that reference the patient.
11. **Logo.** The repository `assets/logo.png` (1.18 MB) is referenced directly by the
    app and the receipt; it is not duplicated under `src/`, so there is a single copy to
    replace. The raw Stitch exports keep their remote Google-hosted image.
12. **Settings delivery.** Consolidated single Settings page with sections, per
    `INTERACTION_INVENTORY.md` section 9.

## 3. Items that remain open (not resolved here)

- OPEN-001 patient phone uniqueness and accepted formats.
- OPEN-005 supported alternative currencies and precision.
- OPEN-008 final output deliverables (PDF / PNG / print / share) and device testing.
- OPEN-010 logo licensing/ownership confirmation.
- OPEN-011 original paper receipt for exact fidelity comparison.
- Whether a receipt may be issued to a payer who is not an existing patient.

No physical Android device test has been run. Print, share, and PDF export are wired to
standard browser/WebView mechanisms and must be verified on the target phone before they
are marked complete in `VERIFICATION.md`.
