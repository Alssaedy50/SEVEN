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

SEVEN is an independent clinic application. Its requirements, approved designs, implementation, and release decisions are maintained within this repository.

## Design-first process

1. Agree on the first-release scope.
2. Review and approve the detailed page map.
3. Design and approve low-fidelity wireframes.
4. Document every button, field, navigation item, dialog, validation, success/error state, and test.
5. Select technology based on the approved product and constraints.
6. Implement in small increments and test each milestone.
7. Test on the target Android phone before claiming mobile acceptance.

**No page should be coded before its design and interactions are approved.** No control is considered complete just because it appears on screen. No export, print, share, persistence, or recovery feature is marked complete until it has been exercised and verified.

## Approved operating decisions

- Local single-device data storage in Release 1; no cloud synchronization.
- Manual full-data backup and restore are in scope.
- Yemeni rial (YER) is the default currency; supported alternative currency is optional.
- Patient full name and phone number are both required; phone uniqueness is not assumed.
- Issued receipts permit limited, audited corrections; exact editable fields remain a design decision.
- A5 portrait receipt output (148 × 210 mm) includes both blank-template and digitally filled modes.

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
- [Stitch export alignment](docs/design/DESIGN_ALIGNMENT.md)
- [Product specification](docs/PRODUCT_SPEC.md)
- [Verification checklist](docs/VERIFICATION.md)

## Running the app

The app is a dependency-free static PWA (local CSS, local SVG icons, no CDN). Serve the
project root over HTTP and open it in a browser:

```bash
python3 -m http.server 12000
# then open http://localhost:12000/
```

Data is stored in IndexedDB on the device. Use **الإعدادات → النسخ الاحتياطي** to export
or restore a full `.sevenbak` snapshot. Refresh the browser to pick up code changes; the
service worker uses a network-first strategy when online and falls back to the cached
shell offline.

## Source layout

```
index.html              App shell
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline shell)
assets/                 Clinic logo used by the app and receipts
src/css/app.css         Design tokens + components (matches docs/design)
src/js/icons.js         Inline SVG icon set
src/js/utils.js         Money, Arabic number-to-words, dates, dialogs, toast
src/js/store.js         IndexedDB data layer, lifecycle, backup/restore
src/js/receipt.js       A5 receipt template + print/share/export
src/js/views.js         Screen renderers (home, patients, receipts, settings, backup)
src/js/app.js           Hash router + bootstrap
```
