---
name: Clinical Clarity & Dental Care
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#476080'
  on-secondary: '#ffffff'
  secondary-container: '#c0d9fe'
  on-secondary-container: '#465f7f'
  tertiary: '#00685d'
  on-tertiary: '#ffffff'
  tertiary-container: '#008376'
  on-tertiary-container: '#f4fffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#afc8ed'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#2f4867'
  tertiary-fixed: '#8df5e4'
  tertiary-fixed-dim: '#70d8c8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: IBM Plex Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
  headline-xl-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-lg:
    fontFamily: IBM Plex Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an authoritative, clinical, and reassuring visual language tailored for dental clinic administration, patient management, electronic health records (EHR), and point-of-sale receipting. Designed specifically for native right-to-left (RTL) Arabic interaction while maintaining seamless bidirectional numeric/code readability, the aesthetic balances modern healthcare precision with patient trust.

The visual narrative bridges digital efficiency with the tangible clarity of printed dental documentation (treatment receipts, tooth charting, appointment slips). Visual motifs draw directly from medical cleanroom standards: structured surfaces, high-contrast legibility against pale clinical tints, and clear separation between operational data (patient IDs, tooth quadrant numbers, financial balances) and procedural actions.

Key emotional attributes:
- **Trustworthy & Hygienic:** Crisp cerulean blue combined with clinical navy commands confidence, evoking sterilized precision and dental excellence.
- **Systematic & Uncluttered:** Dense medical data is systematically compartmentalized into rounded cards and structured field blocks, reducing cognitive fatigue for dentists and receptionists under time pressure.
- **Accessible & Mobile-Resilient:** Prioritized for one-handed operation on Android clinic tablets and mobile phones alongside multi-column desktop charting views.

## Colors

The color palette leverages medical blue archetypes to denote actions, clinic statuses, and dental procedures:

- **Primary (`#0284C7` - Cerulean Clinical Blue):** Drives key interactive targets, selected odontogram states, primary buttons, active navigation, and highlighted patient metrics.
- **Secondary (`#0E2A47` - Deep Navy):** Represents ultimate authority, clinical branding, high-priority headings, print receipt headers, and high-contrast text layers.
- **Tertiary (`#00897B` - Medical Teal):** Utilized for treatment completion badges, successful transaction receipts, sterile state confirmations, and tooth restoration statuses.
- **Accent Cyan (`#00B4D8`):** Serves as an auxiliary state for diagnostic imaging notices, pending lab work indicators, and focused input halos.
- **Surface & Backgrounds:**
  - Base Page Canvas: `#F6F9FF` (clean clinical tint reducing eye glare under clinic LED lighting).
  - Surface Container / Accent Card Tint: `#F0F9FF` (soft ice blue used for receipt blocks, totals, and callouts).
  - Pure Surface: `#FFFFFF` for primary cards, data rows, and input surfaces.
- **Borders & Dividers:** `#E2E8F0` provides crisp, non-distracting bounds matching formal medical station forms.
- **Status & Alerts:**
  - Critical/Extraction Alert: `#DC2626`
  - Pending/Under Treatment: `#F59E0B`
  - Scheduled/Routine: `#0284C7`

## Typography

The typography is built around **IBM Plex Sans** (including its dedicated Arabic glyph set), offering exceptional legibility for both complex Arabic medical nomenclature and Western alphanumeric data (Universal Numbering System tooth indices, currency values, phone codes, and laboratory specs).

Typographic Guidelines:
- **RTL Baseline Alignment:** Arabic letters require adequate vertical clearance; line-heights are set slightly looser (`1.5` to `1.625` relative ratio) to eliminate overlap on accented diacritics and dots.
- **Numbers & Metrics:** Use tabular numeral formatting (`tnum`) for monetary figures, remaining balances, and dental ledger rows.
- **Labeling Hierarchy:** Receipts and forms utilize medium/semibold weights for labels (`label-md`) coupled with `#0E2A47` for high-priority values and `#64748B` for secondary annotations.

## Layout & Spacing

The layout model implements a fluid grid calibrated for Android handheld devices (reception tablets, smartphone views) and scales dynamically to 12-column desktop charting displays.

- **Canvas Breakpoints:**
  - **Compact (Mobile < 640px):** 4 columns, `16px` margins, single-column receipt flow, full-width touch targets (minimum 48px height).
  - **Medium (Tablet 640px - 1024px):** 8 columns, `20px` margins, split-screen patient ledger and procedure checklist.
  - **Expanded (Desktop > 1024px):** 12 columns, `32px` margins, side-by-side dental chart, appointment timeline, and billing invoice panel.
- **RTL Flow Principles:**
  - Main flow proceeds strictly right-to-left: start padding maps to the physical right, end padding to the physical left.
  - Action sequences (e.g., Save, Print Receipt, Settle Bill) place the primary confirming action at the logical start/right side in dialog actions.
  - Form field inputs and currency indicators format with native Arabic right-alignment, while international phone numbers and tooth IDs retain bidirectional integrity.

## Elevation & Depth

To sustain a hygienic, medical-grade aesthetic, elevation relies on subtle, soft ambient shadows tinted with medical slate and indigo rather than muddy grays. Visual depth distinguishes interactive layers from foundational clinical forms:

- **Surface Level 0 (Base):** Canvas tint `#F6F9FF` with flat outline `#E2E8F0`.
- **Surface Level 1 (Cards, Form Containers):** `#FFFFFF` filled card, border `1px solid #E2E8F0`, shadow: `0 1px 3px 0 rgba(14, 42, 71, 0.05), 0 1px 2px -1px rgba(14, 42, 71, 0.03)`.
- **Surface Level 2 (Active Treatment Records, Hovered Rows):** `#FFFFFF`, shadow: `0 4px 6px -1px rgba(2, 132, 199, 0.08), 0 2px 4px -2px rgba(14, 42, 71, 0.05)`.
- **Surface Level 3 (Modals, Tooth Selector Popovers, Floating Action Bars):** `#FFFFFF`, shadow: `0 10px 15px -3px rgba(14, 42, 71, 0.12), 0 4px 6px -4px rgba(14, 42, 71, 0.06)`.
- **Inverted Container (Receipt Headers):** `#0E2A47` flat fill with high-contrast `#FFFFFF` text and no ambient shadow, creating clear visual anchor points identical to official clinical printed vouchers.

## Shapes

The design system uses **Roundedness 2** (base `0.5rem` / `8px` corner radius) across standard components, providing a balanced, approachable medical presence that feels ergonomic on Android mobile screens without feeling overly playful.

- **Micro elements (Badges, Chips, Checkboxes):** `0.25rem` (4px) to `0.375rem` (6px).
- **Interactive Controls (Inputs, Buttons, Dropdowns):** `0.5rem` (8px).
- **Structural Cards (Receipt Vouchers, Odontogram blocks):** `rounded-lg` (`1rem` / 16px).
- **Dialogs & Bottom Sheets:** `rounded-xl` (`1.5rem` / 24px) on top headers for fluid Android drawer interactions.
- **Pill Exceptions:** Filter tags, receipt badge status markers (e.g., "سند قبض", "تم الدفع"), and procedure badges use complete pill radiuses (`9999px`) for quick visual scanning.

## Components

### Buttons
- **Primary Action (e.g., "حفظ العلاج", "إصدار سند"):** Solid `#0284C7` background, `#FFFFFF` text, `0.5rem` radius, min-height `44px` (48px on mobile). On hover: `#0369A1`. Focus: `0 0 0 3px rgba(2, 132, 199, 0.25)`.
- **Secondary (Navy Clinic Action):** Solid `#0E2A47` background, `#FFFFFF` text. Used for printing and administrative authorizations.
- **Outline / Ghost:** Border `1.5px solid #E2E8F0`, `#0E2A47` label, `#FFFFFF` background. Hover changes to `#F0F9FF` with `#0284C7` border.

### Receipt & Data Cards (سند قبض / سجل المريض)
- Designed to replicate physical clinical vouchers:
  - Header band: Deep Navy `#0E2A47` with centered white badge pill (`#0284C7` or `#FFFFFF` outline).
  - Body container: `#FFFFFF` with `#E2E8F0` border and `16px` padding.
  - Calculation summaries (المتبقي / المدفوع حالياً / إجمالي الحساب): Split horizontal 3-column card tinted in `#F0F9FF` with bold cerulean or navy summary values.

### Input Fields & Search Bars
- Background: `#FFFFFF`. Border: `1px solid #CBD5E1`.
- Focus state: Border shifts to `#0284C7` with a 3px outer glow in `rgba(0, 180, 216, 0.2)`.
- RTL Alignment: Text and placeholders strictly align right. Unit labels (e.g., "ريال يمني") dock cleanly to the left slot of the input.

### Checkboxes & Procedure Selectors
- Based on printed multi-check treatment sections (e.g., "علاج عصب وجذور", "خلع وجراحة", "تنظيف وتجليح لثة"):
  - Border: `2px solid #94A3B8`, radius `6px`.
  - Selected state: Solid `#0284C7` fill with white checkmark.
  - Group cards: Packaged inside lightweight outlined tiles that illuminate with `#F0F9FF` background when active.

### Chips & Dental Procedure Status Badges
- Paid / Completed: `#00897B` text over `#E6F4F1` surface.
- In Progress: `#0284C7` text over `#E0F2FE` surface.
- Remaining Balance / Critical: `#DC2626` text over `#FEF2F2` surface.
- Radius: Full pill shape (`9999px`) with `0.25rem 0.75rem` padding and `label-md` typography.

### Odontogram (Dental Chart Module)
- Visual 32-tooth interactive layout divided into 4 standard quadrants.
- Neutral tooth state: `#FFFFFF` fill with `#94A3B8` contour strokes.
- Treated tooth: Filled `#0284C7` with `#0E2A47` restoration outline.
- Missing/Extracted: Translucent `#F1F5F9` with dashed strike-through.