# Verification and Design Approval Checklist

Use this checklist for every milestone. Mark an item PASS only after the stated behavior was actually exercised; otherwise leave it OPEN and record the limitation.

## Design gates — must be completed before application code

- [ ] User-approved release scope is recorded.
- [ ] Detailed page map reviewed and approved.
- [ ] Required fields for patient and receipt forms approved.
- [ ] Receipt save/issue/edit/void lifecycle approved.
- [ ] Navigation and page entry/exit paths approved.
- [ ] Low-fidelity wireframes created for all approved pages.
- [ ] Every button, field, tab, menu, and dialog is listed in the interaction inventory.
- [ ] Validation, loading, empty, success, and error states are specified.
- [ ] Currency, numbering, amount-in-words, output format, and paper-size decisions are recorded.
- [ ] Storage, backup/recovery, and single-device versus multi-device expectations are decided.
- [ ] User approves the wireframes and interaction inventory.
- [ ] Technical stack is selected only after the above requirements are clear.

## Clean-room rule

- [ ] SEVEN does not reuse AQSA7 code, UI, styling, components, or architecture.
- [ ] AQSA7 notes are used only to formulate product questions and understand the domain.
- [ ] Test data is synthetic; no real patient information is used.

## Implementation verification (do not start until design gates are approved)

### Mobile shell and navigation
- [ ] Initial load works at phone viewport width.
- [ ] All navigation destinations open and return correctly.
- [ ] Refresh/restart behavior matches the documented persistence policy.
- [ ] Empty, loading, and error states are understandable in Arabic.
- [ ] No console errors during the main workflows.

### Patient records
- [ ] Create a patient and confirm it appears in the list.
- [ ] Reload/reopen and confirm persistence according to the chosen storage model.
- [ ] Search by approved identifiers/name.
- [ ] Edit a record and verify the updated values.
- [ ] Confirm patient-related receipts are correctly associated.
- [ ] Validate required fields and malformed inputs.
- [ ] Test archive/deletion and confirmation/recovery behavior only if included.

### Receipts
- [ ] Create a receipt with all approved common fields.
- [ ] Save, reopen, and confirm the values match.
- [ ] Verify numbering uniqueness and date handling.
- [ ] Verify currency labels and amount-in-words behavior.
- [ ] Search/filter history and open an existing receipt.
- [ ] Verify approved edit/void lifecycle restrictions.
- [ ] Test long names, large amounts, missing optional fields, and Arabic text.

### Export and print
- [ ] Preview matches the saved receipt.
- [ ] Every approved output profile matches its intended dimensions.
- [ ] PDF/print output has no clipping, blank extra pages, or misplaced RTL.
- [ ] Image export succeeds only if included in the approved scope.
- [ ] Share action produces a real file or a clear, honest error.
- [ ] Test output on an Android phone or explicitly leave physical-device testing OPEN.

### Data safety
- [ ] Backup/restore is tested if included in the approved scope.
- [ ] Invalid backup is rejected without corrupting existing data.
- [ ] Schema migration has a test from the previous supported version if migrations exist.
- [ ] Cloud sync is not included or claimed unless separately approved and tested.
- [ ] Conflict and deletion behavior are tested if multi-device sync is approved.

## Release
- [ ] Automated tests pass.
- [ ] Build/package is reproducible.
- [ ] Deployed URL points to the expected commit.
- [ ] Install/launch and core workflows tested on Android.
- [ ] Release notes list verified capabilities and known limitations.
