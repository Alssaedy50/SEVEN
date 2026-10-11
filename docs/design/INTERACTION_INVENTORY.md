# SEVEN — Interaction Inventory (Draft)

**Status:** Updated draft aligned with approved data/storage/currency decisions. This document defines intended behavior, not implemented behavior. No application code is authorized by this document.

## 1. Global behavior

| ID | Surface/control | Action and preconditions | Expected result | Failure/edge handling | Acceptance test |
|---|---|---|---|---|---|
| G-01 | Primary navigation | Open one of the approved destinations | Correct page opens; active destination is indicated | Show an error/retry if page data cannot load; never show a blank screen silently | Open each destination from every relevant context |
| G-02 | Back navigation | Return from a child page | Return to originating context where possible | If origin no longer exists, return to the relevant list/home | Verify search/filter context is preserved |
| G-03 | Save | Validate form before persisting | Persist once and show success only after confirmed save | Keep user input and show actionable error on failure | Simulate invalid data and save failure |
| G-04 | Cancel/back with unsaved changes | Detect dirty form state | Show Stay / Discard confirmation | Never silently discard input | Edit fields, navigate away, test both choices |
| G-05 | Search | Apply text to the page's supported search fields | Filter results without changing saved records | Show no-results state separately from empty-data state | Search match, partial match, no match, clear |
| G-06 | Empty/error/loading states | Render according to actual data state | User can distinguish no records from loading and failure | Retry only when retry is meaningful | Exercise all states with test fixtures |
| G-07 | Success feedback | Operation has actually succeeded | Show a concise success message | Do not show success before completion | Force operation failure and verify no success state |
| G-08 | Destructive action | Action is explicitly approved and available | Explain consequence and require confirmation | Prefer archive/void over irreversible deletion if product policy chooses so | Cancel and confirm paths; verify data integrity |

## 2. Home (P01)

| ID | Control | Behavior | Destination / result | Status |
|---|---|---|---|---|
| H-01 | إنشاء سند قبض | Start a new receipt | P04, no patient preselected | Proposed |
| H-02 | إضافة مريض | Start patient creation | P03 create mode | Proposed |
| H-03 | عرض المرضى | Open patient directory | P02 | Proposed |
| H-04 | عرض السجل | Open receipt history | P07 | Proposed |
| H-05 | الإعدادات | Open settings | P08/P09 or consolidated Settings page | Needs navigation decision |

Home counts, if shown, must derive from saved records and be omitted if they do not help the core workflow.

## 3. Patient List (P02)

| ID | Control | Behavior | Validation / edge cases | Status |
|---|---|---|---|---|
| PTL-01 | Search field | Search approved patient fields | Empty query shows full list; no match shows dedicated message | Proposed |
| PTL-02 | Patient row | Open selected patient's record | P05; never open a different patient due to list reordering | Proposed |
| PTL-03 | إضافة مريض | Open create form | P03 create mode | Proposed |
| PTL-04 | سند جديد | Open receipt form | P04; patient is preselected only if launched from a specific patient context | Proposed |
| PTL-05 | Clear search | Remove current query | Full list returns | Proposed |

## 4. Patient Form (P03)

| ID | Control | Behavior | Validation / edge cases | Status |
|---|---|---|---|---|
| PTF-01 | اسم المريض | Enter full name | Required; trim leading/trailing whitespace; reject blank-only values | Proposed |
| PTF-02 | رقم الهاتف | Enter required phone | Required; validate/normalize as text, preserve leading `+`; do not assume phone is globally unique | Updated draft |
| PTF-03 | أي حقل إضافي | Only include after field list approval | Must have a clear Release 1 purpose | Not approved |
| PTF-04 | حفظ | Validate and save new/edit record | P05 after success; prevent accidental duplicate submission | Proposed |
| PTF-05 | إلغاء/رجوع | Leave form | If dirty, show confirmation | Proposed |
| PTF-06 | Field validation message | Explain what needs fixing in Arabic | Focus/identify the relevant field; preserve other values | Proposed |

## 5. Patient Details (P05)

| ID | Control | Behavior | Destination / result | Status |
|---|---|---|---|---|
| PD-01 | تعديل البيانات | Edit selected patient | P03 edit mode | Proposed |
| PD-02 | سند جديد لهذا المريض | Start receipt with patient preselected | P04 | Proposed |
| PD-03 | Related receipt row | Open receipt details | P06 view-existing mode | Proposed |
| PD-04 | Back | Return to prior page | Preserve list context where possible | Proposed |

## 6. Receipt Form (P04)

| ID | Control | Behavior | Validation / edge cases | Status |
|---|---|---|---|---|
| RF-01 | Patient/received-from selector | Select existing patient or enter a payer name | Must prevent accidental loss of partially entered receipt data when opening patient creation | Design decision needed |
| RF-02 | Receipt date | Select date | Use a documented local-date rule; prevent invalid date values | Proposed |
| RF-03 | Amount | Enter monetary amount | Required, numeric, greater than zero; define allowed decimal precision with currency | Proposed |
| RF-04 | Currency | Select currency | Default is YER; allow another explicitly supported currency; changing currency must not silently reinterpret the amount | Updated draft; alternative list open |
| RF-05 | Payment method | Select one approved method | Conditional fields appear only for transfer/wallet/bank methods | Decision needed |
| RF-06 | Transfer reference/sender | Enter relevant transfer details | Requiredness depends on payment method and clinic policy | Decision needed |
| RF-07 | Amount in words | Display or enter amount in words | Decide auto-generated versus manual; prevent mismatch with numeric amount | Decision needed |
| RF-08 | Receipt number | Allocate a unique number at issue, not on form open | Define sequence and void/gap behavior; never reuse an issued number | Decision needed |
| RF-09 | معاينة السند | Validate and proceed to preview | P06; save/issue timing must be explicit before implementation | Decision needed |
| RF-10 | Save draft (optional) | Save incomplete receipt only if drafts are approved | Must be visibly marked draft and excluded from issued history/output rules as specified | Not approved |
| RF-11 | Cancel | Return to origin | Warn if receipt data would be lost | Proposed |

## 7. Receipt Preview (P06)

| ID | Control | Behavior | Preconditions / failure | Status |
|---|---|---|---|---|
| RP-01 | Preview canvas/document | Render receipt from the current saved or pending data state | State must be labelled internally and behavior made clear to user | Decision needed |
| RP-02 | Export PDF | Generate a real PDF | Disable while running; report actual success/failure; avoid duplicate jobs | Proposed |
| RP-03 | Share | Share the actual exported file using a supported device mechanism | If unsupported, explain and provide an available alternative; never fake success | Proposed |
| RP-04 | Print | Open supported print workflow | Availability depends on target browser/WebView/device; verify on Android | Proposed |
| RP-05 | Edit | Return to the appropriate form with values preserved | Existing issued receipt follows the approved edit policy | Decision needed |
| RP-06 | Back | Return to originating workflow | Do not lose the receipt state | Proposed |
| RP-07 | Output profile selector | Change paper profile only if multiple profiles are approved | Preview dimensions and exported output must match | Decision needed |

## 8. Receipt History (P07)

| ID | Control | Behavior | Validation / edge cases | Status |
|---|---|---|---|---|
| RH-01 | Search | Search by receipt number, patient/payer name, and approved identifiers | No-results state distinct from empty history | Proposed |
| RH-02 | Date filter | Filter by date/range | Define inclusive boundaries and local time/date handling | Decision needed |
| RH-03 | Payment-method filter | Filter by method if retained | Combine predictably with search/date filters | Optional |
| RH-04 | Receipt row | Open selected receipt | P06 view-existing mode | Proposed |
| RH-05 | Clear filters | Reset search and filters | Return to unfiltered history | Proposed |
| RH-06 | Void/delete | Not displayed until lifecycle policy is approved | Confirmation, auditability, and recovery policy required | Not approved |

## 9. Settings (P08/P09 — consolidation recommended)

To keep Release 1 simple, the current page map's P08 Clinic Identity Settings and P09 Essential Receipt Settings should probably become **one Settings page with two sections** unless testing or content volume shows a strong reason to split them.

| ID | Control | Behavior | Validation / edge cases | Status |
|---|---|---|---|---|
| ST-01 | Arabic clinic name | Edit printed Arabic identity | Required if shown on receipt | Proposed |
| ST-02 | English clinic name | Edit printed English identity | Optional if English identity is not mandatory; LTR rendering | Proposed |
| ST-03 | Doctor/specialty/address/contacts | Edit approved receipt identity fields | Validate only what is required for the chosen receipt design | Proposed |
| ST-04 | Logo upload | Not included unless explicitly approved | Validate type/size; show preview and recover from failure | Not approved |
| ST-05 | Default currency | Choose currency | Defaults to YER; alternative choices must be explicitly supported by formatting and amount-in-words behavior | Updated draft; supported list open |
| ST-06 | Default output profile | Choose from approved output formats | Only show formats that have been implemented and tested | Decision needed |
| ST-07 | Receipt numbering settings | Configure only if user-facing configuration is needed | Do not expose internal numbering controls unnecessarily | Decision needed |
| ST-08 | Save settings | Persist settings | Existing/historic receipt behavior after settings changes must be defined | Decision needed |
| ST-09 | Preview sample receipt | Preview with synthetic sample data | Must never insert fake sample patient data into the real patient list | Proposed |
| ST-10 | Restore defaults | Restore only explicitly defined defaults | Confirm; must not reset clinic identity without warning | Not approved |

## 10. Dialogs and system feedback (P10)

| ID | Dialog/message | Actions | Required behavior |
|---|---|---|---|
| D-01 | Unsaved changes | البقاء / تجاهل التغييرات | Preserve form if user stays; discard only after explicit choice |
| D-02 | Confirm destructive action | إلغاء / تأكيد | Explain impact in plain Arabic; not present until action policy is approved |
| D-03 | Validation error | تصحيح الحقول | Point to exact field(s), preserve valid entries |
| D-04 | Save success | متابعة / إغلاق as appropriate | Show only after persistence confirms success |
| D-05 | Save/export failure | إعادة المحاولة / رجوع | State what failed and preserve recoverable data |
| D-06 | Empty state | Add/create action | Explain how to begin, not just a blank screen |
| D-07 | No search results | Clear search | Do not imply there are no records at all |
| D-08 | Unsupported print/share | إغلاق / use available alternative | Be honest about device/browser limitations |

## 11. Decisions required before visual wireframes can be finalized

1. Patient fields: full name only, or full name plus phone? Any other identifier?
2. Patient deletion: disallow, archive, or permit deletion with confirmation?
3. Receipt persistence: save as draft before preview, save/issue before preview, or save/issue from preview?
4. Define the allowed fields for limited corrections to issued receipts, audit reason/display, and which material changes require void/reissue.
5. Confirm amount-in-words generation/editing and alternative-currency precision.
6. Confirm PDF, PNG, print, and share outputs and the A5 layout details.
7. Confirm whether issued receipts preserve a clinic/patient identity snapshot.
8. Verify the original logo asset and decide whether logo change/upload belongs in Release 1.
9. Design manual backup/restore, invalid-file handling, and restore confirmation.
10. Define the receipt-number sequence, start value, and void/cancel gap behavior.
11. Review the proposed four-destination navigation and consolidated Settings page.
12. Decide patient archive/deletion and whether a receipt can name a payer who is not an existing patient.

## 12. Approval gate

This inventory is a draft. Review it alongside the page map. After the page map and core behavior decisions are approved, create low-fidelity wireframes and revise this inventory against those wireframes. Do not implement code until the page map, wireframes, and interaction inventory are approved.
