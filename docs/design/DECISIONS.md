# SEVEN — Design Decisions and Open Questions

**Status:** Active decision log. Approved decisions are separated from proposals and unresolved questions.

## Approved by user

| ID | Decision | Status |
|---|---|---|
| DEC-001 | Release 1 scope is patients, receipt creation/management, preview, export, history, and necessary settings only. | Approved |
| DEC-002 | AQSA7 is for understanding the idea only; do not reuse old code, design, or architecture. | Approved |
| DEC-003 | Plan pages and define button purposes before writing application code. | Approved |
| DEC-004 | Mobile phone use is the immediate priority. | Approved from project context |

## Proposed, not yet approved

| ID | Proposal | Why it is proposed |
|---|---|---|
| PROP-001 | Four primary navigation destinations: Home, Patients, History, Settings; receipt creation is a prominent action. | Keeps phone navigation compact |
| PROP-002 | Combine clinic identity and receipt settings into one Settings page with sections. | Avoids unnecessary navigation and keeps release 1 small |
| PROP-003 | Start with only patient full name and optional phone number. | Avoids collecting unnecessary personal data |
| PROP-004 | Do not show delete/void controls until receipt and patient lifecycle rules are approved. | Prevents accidental loss and undefined business rules |
| PROP-005 | Use synthetic data for settings previews and all tests. | Protects patient privacy |

## Open decisions required before final wireframes

| ID | Question | Default recommendation for discussion |
|---|---|---|
| OPEN-001 | What patient fields are required? | Full name required; phone optional; no clinical notes in Release 1 |
| OPEN-002 | Can patient records be deleted? | Prefer archive if records are referenced by receipts; define a recovery rule |
| OPEN-003 | When is a receipt saved/issued? | Explicitly save/issue before export, with a clear confirmation state |
| OPEN-004 | Can an issued receipt be edited? | Prefer immutable issued receipts plus a controlled void/correction process, if needed |
| OPEN-005 | Which currency is required? | Use the clinic's confirmed working currency; do not assume multi-currency |
| OPEN-006 | How is amount-in-words handled? | Automatic generation only if language/currency formatting can be tested reliably; otherwise allow reviewed manual text |
| OPEN-007 | Which output formats and paper sizes are required? | PDF first; approve print/image and paper profiles based on actual clinic workflow |
| OPEN-008 | What happens to historic receipt clinic identity after settings change? | Preserve a snapshot for issued receipts, if historical fidelity is important |
| OPEN-009 | Is launch single-device or multi-device? | Single-device is simpler; choose only after the user confirms workflow needs |
| OPEN-010 | Is logo upload required? | Exclude until needed and supported reliably |
| OPEN-011 | Is all-data backup/restore required in Release 1? | Must be decided before choosing persistence; do not silently add it |
| OPEN-012 | What receipt numbering rule is required? | Unique sequential numbering with no silent reuse; define cancellations/voids explicitly |

## Decision policy

- User-approved scope cannot be expanded silently.
- Recommendations are not approved decisions until confirmed.
- Technical choices wait until the data, workflows, and device expectations are known.
- Record any future decision here with date, rationale, and acceptance test.
