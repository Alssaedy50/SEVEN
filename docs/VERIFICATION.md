# Verification Checklist

Use this checklist for every milestone. Mark an item PASS only after the stated behavior was actually exercised; otherwise leave it OPEN and record the limitation.

## Legacy audit
- [ ] Inventory all screens, routes, dialogs, and visible controls in AQSA7.
- [ ] Inventory all data entities, settings, migrations, and persistence paths.
- [ ] Inventory receipt lifecycle rules and numbering/date behavior.
- [ ] Inventory export formats, paper profiles, and print CSS contracts.
- [ ] Inventory backup, restore, sync, OAuth, and provider integrations.
- [ ] Capture mobile screenshots of the important legacy workflows.
- [ ] Convert findings into testable acceptance criteria.

## Mobile shell and navigation
- [ ] Initial load works at phone viewport width.
- [ ] All navigation destinations open and return correctly.
- [ ] Refresh/restart does not silently lose saved local records.
- [ ] Empty, loading, and error states are understandable in Arabic.
- [ ] No console errors during the main workflows.

## Patient records
- [ ] Create a patient and confirm it appears in the list.
- [ ] Reload/reopen and confirm persistence.
- [ ] Search by supported identifiers/name.
- [ ] Edit a record and verify the updated values.
- [ ] Confirm patient-related receipts are correctly associated.
- [ ] Validate required fields and malformed inputs.
- [ ] Test deletion/archival and any confirmation/recovery behavior.

## Receipts
- [ ] Create a receipt with all common fields.
- [ ] Save, reopen, and confirm the values match.
- [ ] Verify numbering uniqueness and date handling.
- [ ] Verify currency labels and amount-in-words behavior.
- [ ] Search/filter history and open an existing receipt.
- [ ] Verify edit/void lifecycle restrictions.
- [ ] Test long names, large amounts, missing optional fields, and Arabic text.

## Export and print
- [ ] Preview matches the saved receipt.
- [ ] A5 portrait output measures 148 × 210 mm.
- [ ] A4 and 80 mm thermal profiles behave as specified.
- [ ] PDF/print output has no clipping, blank extra pages, or misplaced RTL.
- [ ] Image export succeeds if included in the accepted scope.
- [ ] Share action produces a real file or a clear, honest error.
- [ ] Test output on an Android phone or document that physical-device testing remains open.

## Data safety
- [ ] Backup contains no unrelated secrets.
- [ ] Restore recovers records and settings.
- [ ] Invalid backup is rejected without corrupting existing data.
- [ ] Schema migration has a test from the previous supported version.
- [ ] Cloud sync is not marked PASS until authenticated multi-device tests complete.
- [ ] Conflict and deletion behavior are tested if sync is included.

## Release
- [ ] Automated tests pass.
- [ ] Build/package is reproducible.
- [ ] Deployed URL points to the expected commit.
- [ ] Install/launch and core workflows tested on Android.
- [ ] Release notes list verified capabilities and known limitations.
