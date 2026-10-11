# SEVEN Product Specification (Initial Baseline)

Status: Draft baseline derived from the AQSA7 repository README and source inspection. Each workflow must be checked against the legacy UI and code before it is marked accepted.

## 1. Purpose

Rebuild the AQSA7 platform's dental-clinic workspace as a maintainable mobile-first application. The immediate core outcome is to record patients and issue, view, store, and export professional receipt vouchers. The rebuild must preserve agreed legacy behavior while replacing the implementation architecture.

## 2. Clinic identity and language

- Arabic is the primary interface language and uses RTL layout.
- English clinic identity is displayed LTR where appropriate.
- Clinic name: عيادة السعيدي لطب وجراحة الفم والأسنان
- English identity: ALSSAEDY CLINIC FOR DENTISTRY
- Doctor: د/ صلاح الدين السعيدي / Dr. Salahaldeen Alssaedy
- Specialty: طب وجراحة الفم والأسنان
- Address: ريمة - كسمة - عزلة الضبارة
- Contacts supplied for the legacy project: +967 716 339 366, +967 739 550 138, +967 775 956 520
- Do not expose contact details in unrelated screens or logs.

## 3. Core workflows

### Patients
- Create and save a patient record.
- View patient details and related receipts.
- Edit patient details.
- Search and filter patient records.
- Validate required fields and show clear Arabic feedback.
- Prevent accidental duplicate or destructive actions where practical.

### Receipts
- Create a receipt with receipt number, date, patient/received-from identity, amount paid, currency, amount in words, payment method, and transfer reference/sender when relevant.
- Support receipt lifecycle states, including issued and voided, if confirmed in the legacy behavior.
- View receipt details and preview before export.
- Edit an issued receipt only according to the agreed lifecycle rules.
- Browse, search, and filter receipt history.
- Keep receipt totals and formatted currency consistent throughout the interface.

### Receipt output
- Arabic RTL with correctly isolated English/LTR identity and numeric values.
- Preserve supported physical profiles from the legacy baseline: A5 portrait (148 × 210 mm), A4, and 80 mm thermal.
- Provide a professional print/PDF output and image export if confirmed in legacy behavior.
- Preview dimensions must match print/export dimensions.
- Test long Arabic names, long amounts, blank fields, and page overflow.
- Sharing must provide a real output file or a truthful error, not a fake success message.

### Settings and supporting capabilities
Audit the old implementation and explicitly inventory:
- Clinic identity and logo settings.
- Currency and receipt appearance settings.
- Receipt templates and paper profiles.
- Backup, restore, migration, and recovery.
- Local/cloud synchronization and provider integrations.
- Theme, font, and sizing preferences.
- Platform shell and product/workspace navigation.

These are not considered implemented until their data behavior and acceptance tests are documented.

## 4. Data and privacy requirements

- Use a documented, versioned data model for patients, receipts, and settings.
- Local data must persist after app reload and normal app restart.
- Include schema migration and backup/restore tests before a production release.
- Never commit real patient data, access tokens, API keys, OAuth secrets, or production backups.
- If cloud sync is included, document authentication, access control, conflict behavior, deletion propagation, and data retention.
- Do not claim end-to-end encryption or atomic conflict-free synchronization unless implemented and verified.
- Clearly distinguish local-only operation from authenticated cloud features.

## 5. UX requirements

- Mobile-first layout; primary tasks should work at phone width without horizontal scrolling.
- Clear loading, empty, success, and error states.
- Every button, tab, menu, and dialog must perform its advertised action.
- Destructive operations require confirmation and an understandable recovery policy.
- Arabic labels must be natural and consistent.
- Keyboard focus, labels, and touch targets should be usable on mobile.

## 6. Architecture direction

- Separate UI, domain/business logic, persistence, and export.
- One authoritative data access layer; no competing storage paths.
- Use stable IDs and explicit schema versions.
- Keep export rendering isolated from screen-only styles.
- Keep the Android wrapper thin if Android packaging is retained.
- Select the stack after the legacy audit and a short technical decision record; do not add dependencies without a clear need.

## 7. Non-goals until explicitly approved

- Adding unrelated clinic modules or billing features beyond receipt and patient requirements.
- Claiming production cloud sync or OAuth readiness without credentials and live tests.
- Reusing live patient data in development.
- Releasing based solely on screenshots or a successful build.
