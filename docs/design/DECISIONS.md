# SEVEN — Design Decisions and Open Questions

**Status:** Active decision log. User-approved decisions are separated from proposals and unresolved details.

## Approved decisions

| ID | Decision | Status |
|---|---|---|
| DEC-001 | Release 1 is limited to patient records, receipt creation/management, preview, export/share/print, receipt history, and essential settings. | Approved |
| DEC-002 | SEVEN uses its own approved requirements, design assets, and implementation decisions. | Approved |
| DEC-003 | Define and approve pages, wireframes, and interaction behavior before application code. | Approved |
| DEC-004 | Mobile-first Android use; Arabic-first RTL with correct English LTR. | Approved |
| DEC-005 | Patient and receipt data are stored locally on the phone in Release 1; users can create a manual backup and restore it. No cloud synchronization in Release 1. | Approved |
| DEC-006 | Yemeni rial (YER) is the default currency. An alternative currency may be selected when needed. | Approved |
| DEC-007 | Patient phone number is required when creating or saving a patient. | Approved |
| DEC-008 | Issued receipts allow limited corrections only through a controlled flow that records an audit trail; no silent edits. The exact field allowlist and correction UX must be finalized in design. | Approved principle; details open |
| DEC-009 | Receipt print target includes an A5 portrait page (148 × 210 mm) and two output modes: blank paper template and digitally filled receipt. | Approved requirement from project brief; exact visual fidelity requires original sample |
| DEC-010 | Clinic identity and the supplied eight treatment-service categories must be represented in the receipt design. | Approved requirement |
| DEC-011 | The clinic’s supplied identity and contact details are project data; do not expose them in unrelated views or logs. | Approved |

## Proposals / implementation guidance (not independent user approvals)

| ID | Proposal | Rationale |
|---|---|---|
| PROP-001 | Four primary destinations: Home, Patients, Receipt History, Settings; provide a prominent New Receipt action. | Compact mobile navigation |
| PROP-002 | Keep clinic identity and receipt preferences in one Settings page with clear sections. | Reduce navigation complexity |
| PROP-003 | Use stable internal IDs independent of patient names and phone numbers. | Names/phone values may change |
| PROP-004 | Preserve an immutable snapshot of relevant patient and clinic identity on issued receipts. | Historical receipt fidelity |
| PROP-005 | Use IndexedDB for local structured storage, plus explicit backup export/import with schema validation. | Suitable browser storage for a PWA; must be verified |
| PROP-006 | Do not allow hard deletion of issued receipts through ordinary UI; retain void/correction history. | Auditability |
| PROP-007 | Use synthetic patient data for design previews and tests. | Privacy |
| PROP-008 | Keep the receipt layout separate from the data-entry form; prefer vector-based PDF output and generate PNG only when requested. | Print quality and predictable dimensions |

## Open decisions before implementation

| ID | Question | Required next step |
|---|---|---|
| OPEN-001 | Is patient phone unique? What phone formats/country codes should be accepted? | Decide validation; do not reject shared family phone numbers without approval |
| OPEN-002 | Are patient records archived rather than deleted? What happens when receipts reference a patient? | Specify archive and recovery behavior |
| OPEN-003 | At what point is a receipt issued and its number allocated? | Design explicit Save Draft / Issue / Preview flow, including export of drafts |
| OPEN-004 | Which fields may be corrected after issue? Which changes require a reason, a replacement receipt, or voiding? | Create field-level correction matrix and audit UI |
| OPEN-005 | Which non-YER currencies are supported, and what decimal precision/formatting applies to each? | Define supported list and test amount-in-words |
| OPEN-006 | Is Arabic amount-in-words generated automatically, editable, or both? How are other currencies expressed? | Validate linguistic and numeric behavior |
| OPEN-007 | Confirm final receipt field meanings, especially total account, paid now, and remaining; ensure they are non-negative and consistent. | Specify validation and partial-payment behavior |
| OPEN-008 | Confirm output deliverables: PDF, PNG, print, and sharing; test A5 sizing and practical Android behavior. | Keep each format unclaimed until tested |
| OPEN-009 | What exact sequence format/start value is used, and how do gaps caused by issued/voided receipts display? | Define non-reuse and ordering rules |
| OPEN-010 | Confirm the clinic-logo asset is available and approved before adding it to the repository. | Verify actual file and licensing/ownership |
| OPEN-011 | Confirm the original paper receipt sample is available for precise visual matching. | Without it, design against the written specification only |
| OPEN-012 | How long should backups be retained and where should the user be reminded to store them? | Explain that local data can be lost with browser/device data deletion |

## Decision policy

- User-approved scope and decisions cannot be silently expanded or reversed.
- Technical proposals are not user approvals unless explicitly accepted.
- Record future decisions with rationale and acceptance tests.
- No application implementation until page map, wireframes, interactions, data model, backup/restore behavior, and output specifications are approved.
