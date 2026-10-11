# SEVEN Product Specification — Release 1

**Status:** Scope approved by the user. Page map is a draft pending review. No UI or code has been approved yet.

## 1. Purpose

Create a new mobile-first application for the dental clinic's administrative needs: patient records and professional receipt creation, preview, export, and history. The first release is intentionally limited.

AQSA7 is a conceptual reference only. Do not reuse its code, visual design, UI components, or technical architecture. SEVEN must be designed independently.

## 2. Approved release scope

- Patient records.
- Receipt creation and management.
- Receipt preview.
- Receipt export/share/print output (exact formats and platform capabilities still require approval and verification).
- Receipt history.
- Essential clinic identity and receipt settings.

Not included unless the user explicitly approves a scope change: appointments, clinical notes, diagnoses, prescriptions, inventory, advanced accounting, staff roles, analytics, cloud sync, multi-workspace platform features, or unrelated modules.

## 3. Clinic identity and language

- Arabic is the primary interface language and uses RTL layout.
- English clinic identity is displayed LTR where appropriate.
- Arabic clinic name: عيادة السعيدي لطب وجراحة الفم والأسنان
- English identity: ALSSAEDY CLINIC FOR DENTISTRY
- Doctor: د/ صلاح الدين السعيدي / Dr. Salahaldeen Alssaedy
- Specialty: طب وجراحة الفم والأسنان
- Address: ريمة - كسمة - عزلة الضبارة
- Contact numbers supplied for this project: +967 716 339 366, +967 739 550 138, +967 775 956 520
- Do not expose contact details in unrelated screens or logs.

## 4. UX principles

- Mobile-first, designed first for use on an Android phone.
- Arabic-first RTL with reliable mixed Arabic/English/numeric text.
- No horizontal scrolling for primary workflows.
- Clear loading, empty, validation, success, and error states.
- Every control must have a documented purpose and a verified action.
- Confirm before discarding unsaved input or performing destructive actions.
- Use synthetic patient data for development and testing.
- Do not report mobile, export, print, or share acceptance unless tested.

## 5. Data and privacy requirements

- Before technology selection, decide whether Release 1 is single-device/local or requires multi-device access.
- Document patient and receipt fields, validation, relationships, identifiers, and lifecycle rules before implementation.
- Define data persistence and recovery expectations before selecting storage.
- Never commit real patient data, access tokens, API keys, OAuth secrets, or production backups.
- Do not claim encryption, backup, or synchronization behavior that is not implemented and verified.

## 6. Receipt requirements to settle during design

- Receipt numbering and uniqueness.
- Receipt date and currency.
- Amount-in-words behavior.
- Payment methods and conditional transfer fields.
- Whether receipts can be drafted, edited after issue, voided, or deleted.
- Which output formats and paper sizes are required.
- Whether historic receipts preserve the clinic identity as it was when issued or use current settings.

These decisions must be explicit in the wireframes and interaction inventory before code is written.

## 7. Architecture decision gate

No framework, storage, sync provider, or export library is selected by this specification. Choose technology only after page map, wireframes, interactions, data needs, and device expectations are approved.

## 8. Acceptance process

A feature is complete only when:
1. Its behavior is specified.
2. Success and failure states are designed.
3. It is implemented.
4. Its acceptance test is run and the result recorded.

See [Detailed Page Map](design/PAGE_MAP.md) and [Verification Checklist](VERIFICATION.md).
