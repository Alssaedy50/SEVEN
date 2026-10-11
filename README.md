# SEVEN — AQSA7 Rebuild

SEVEN is the clean-room rebuild of the AQSA7 / ALSSAEDY CLINIC application, prioritizing a reliable mobile-first workflow for patient records and professional digital receipt issuance/export.

## Source of truth

The previous implementation is available at https://github.com/Alssaedy50/AQSA7. It must be inspected as a behavioral reference before implementing replacements. Rebuild from clean architecture; do not copy the old application's tangled structure wholesale, and do not silently drop features that are part of the agreed scope.

## Product priorities

1. Mobile-first clinic workflow.
2. Create, view, edit, and manage patient records.
3. Create and store receipt vouchers linked to patients when applicable.
4. Render a professional receipt preview with Arabic RTL and English LTR identity.
5. Export/print receipts reliably; verify actual output rather than treating visible buttons as completed features.
6. Search/filter history, settings, templates, backup/restore, and synchronization only with explicit acceptance tests.
7. Protect patient data; document storage, backup, and sync limitations honestly.

## Working rules

- Inspect and document the legacy behavior before coding.
- Build in small, verifiable milestones.
- Every visible control must work or be clearly disabled with an explanation.
- Test at mobile viewport sizes and on Android where possible.
- Never claim device, OAuth, print/share, or multi-device sync acceptance unless it was actually tested.
- Keep secrets out of source control.
- Do not use production patient information in tests.
- Prefer readable modular code and automated regression tests over one large HTML/JS file.

## Milestones

- M0: Legacy audit and acceptance criteria.
- M1: Mobile shell, navigation, data model, durable local persistence.
- M2: Patient records and search.
- M3: Receipt creation, preview, and history.
- M4: PDF/print/image export and regression tests.
- M5: Settings, templates, backup/restore, and any approved sync.
- M6: Android/mobile acceptance, deployment, and release checklist.

See [Product specification](docs/PRODUCT_SPEC.md) and [Verification checklist](docs/VERIFICATION.md).
