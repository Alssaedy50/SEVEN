# AQSA7 Conceptual Audit — Preliminary

**Purpose:** Understand the problem domain and identify questions to ask while defining SEVEN. This is not a specification to reproduce.

Reference repository: https://github.com/Alssaedy50/AQSA7

## Clean-room rule

AQSA7 is a conceptual reference only. **Do not copy or reuse any source code, UI, visual design, components, CSS, or technical architecture.** SEVEN's page map, interaction design, data model, technology choices, and implementation must be independently specified and approved.

The notes below record possible domain concepts observed during a preliminary review. They do not mean these concepts must be included in SEVEN.

## Potentially relevant domain concepts

- Patient records and their relationship to receipts.
- Receipt creation, numbering, history, and viewing.
- Receipt preview and output.
- Clinic identity and receipt settings.
- Arabic RTL with English LTR identity.
- Possible output profiles such as A5 portrait (148 × 210 mm), A4, and 80 mm thermal.
- Possible local persistence, backup, recovery, and synchronization requirements that need separate product decisions.

## Questions that remain open

- Which patient fields are truly necessary for Release 1?
- What is the receipt lifecycle and when is a receipt considered saved/issued?
- Can issued receipts be edited, voided, or deleted?
- Which output formats and paper sizes are required?
- Is Release 1 single-device or multi-device?
- What backup/recovery expectations are essential?
- Which clinic settings should be editable?
- What must happen if export, print, or share fails?

## Audit boundary

This preliminary audit does not certify every AQSA7 screen, control, module, test, or integration. No feature is added to SEVEN just because it existed in AQSA7. Only the user-approved scope and explicitly approved design decisions determine Release 1.
