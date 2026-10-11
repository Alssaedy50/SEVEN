# AQSA7 Legacy Audit — Preliminary

Status: IN PROGRESS. This is an initial source-based inventory, not a claim that every screen and interaction has been audited.

Reference repository: https://github.com/Alssaedy50/AQSA7

## Source files directly inspected

- `README.md`: describes platform/product hierarchy, current release, architecture, receipt paper profiles, local-first storage, sync limitations, and release caveats.
- `index.html`: main UI document (about 60.8k characters at the inspected revision); includes platform home/products navigation and clinic workspace UI.
- `js/app.js`: route/context and app-level behavior (about 35.2k characters).
- `js/storage.js`: receipt/patient/history/settings domain behavior (about 59.8k characters).
- `js/repository.js`: IndexedDB repository and sync tombstone behavior (about 11.4k characters).
- `js/export.js`: receipt output/export behavior (about 37.0k characters).
- `package.json`: currently declares `@vercel/blob` and Node 24.x.

File contents are a reference for behavior; the rebuild should not inherit their architecture automatically.

## Confirmed high-level product structure

- AQSA7 platform shell.
- Products/projects selection.
- Dental Clinic product/workspace.
- Receipt issuance and digital receipt mode.
- Receipt template/print mode.
- Patient records/account views.
- Receipt history, search/filtering, and record viewing.
- Preview and share dialogs.
- Settings and receipt appearance controls.
- Backup/recovery and sync-related modules described in the project README.
- Browser/PWA and Android WebView packaging described in the README.

## Confirmed output/data contracts to preserve or explicitly reconsider

- Arabic RTL interface with English LTR identity.
- Receipt profiles: A5 portrait (148 × 210 mm), A4, and 80 mm thermal.
- IndexedDB is described as the durable local data authority.
- Main domain stores: receipts, patients, settings.
- Existing source has receipt lifecycle handling including issued/voided status.
- Existing sync design uses stable IDs, timestamps, and deletion tombstones.
- README explicitly does not claim atomic no-lost-update guarantees for simultaneous Vercel Blob writes.
- Production Google OAuth, physical-device printing/sharing, and live two-device acceptance were documented as unverified in the inspected README.

## Still to inspect before calling the audit complete

- Every visible control and its actual event handler.
- All remaining JavaScript modules and CSS responsibilities.
- Existing test suites and CI workflows.
- Existing migrations, backup/restore formats, and provider integrations.
- Receipt numbering, amount-in-words, currency, edit/void, and deletion edge cases.
- Actual PDF/print/image export behavior and paper dimensions.
- Mobile screenshots and responsive behavior of the legacy application.
- Which legacy features are required for the first release versus later milestones.

## Rule for completion

A feature is not considered understood or implemented from a filename, button label, or README statement alone. Trace the relevant source behavior, write an acceptance criterion, and test the replacement.
