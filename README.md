# SEVEN — Clean-Room Clinic App

SEVEN is a new, mobile-first project for recording patients and creating, previewing, and exporting professional dental-clinic receipt vouchers.

## Product source of truth

The first-release scope is limited to:
- Patient records.
- Receipt creation and management.
- Receipt preview.
- Receipt export/share/print output.
- Receipt history.
- Essential clinic and receipt settings.

AQSA7 (https://github.com/Alssaedy50/AQSA7) is a **conceptual reference only** for understanding the problem domain and possible user needs. Do not copy or reuse its code, UI, styles, components, or technical architecture. SEVEN must have its own approved page map, wireframes, interaction specification, and implementation decisions.

## Design-first process

1. Agree on the first-release scope.
2. Review and approve the detailed page map.
3. Design and approve low-fidelity wireframes.
4. Document every button, field, navigation item, dialog, validation, success/error state, and test.
5. Select technology based on the approved product and constraints.
6. Implement in small increments and test each milestone.
7. Test on the target Android phone before claiming mobile acceptance.

**No page should be coded before its design and interactions are approved.** No control is considered complete just because it appears on screen. No export, print, share, persistence, or recovery feature is marked complete until it has been exercised and verified.

## Design principles

- Mobile-first, Arabic-first RTL, with correct English LTR rendering.
- Simple, stable, readable workflows.
- Protect patient data and use only synthetic test data.
- Make empty, loading, validation, success, and error states explicit.
- Document storage and backup limitations honestly.
- Keep release 1 focused; do not add unapproved modules.

## Project documents

- [Detailed page map](docs/design/PAGE_MAP.md)
- [Interaction inventory](docs/design/INTERACTION_INVENTORY.md)
- [Design decisions and open questions](docs/design/DECISIONS.md)
- [Product specification](docs/PRODUCT_SPEC.md)
- [Verification checklist](docs/VERIFICATION.md)
- [Preliminary conceptual audit of AQSA7](docs/LEGACY_AUDIT.md)
