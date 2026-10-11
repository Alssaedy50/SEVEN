# SEVEN — Official Visual Assets

**Status:** Asset locations and handling rules are defined; the original receipt image and official logo have not yet been verified in this repository.

## Required source assets

1. **Original blank receipt reference:** `docs/assets/receipt-original.png` (or `.jpg` if the supplied original is JPEG).
   - This is the source of truth for the printed receipt layout.
   - Preserve the original image bytes; do not crop, recolor, sharpen, redraw, or overwrite it.
   - If it is a photograph, retain it as the reference and document any perspective/lighting issues separately.
   - Use the written specification only to supplement details that cannot be reliably read from the source image.
2. **Official transparent clinic logo:** `assets/logo.png` (preferred for transparent raster artwork), or preserve the supplied vector original as `assets/logo.svg` if the supplied file is a genuine SVG.
   - Do not redraw, recolor, trace, compress, or replace the official logo.
   - Keep the original high-resolution file. Create optimized derivatives only if needed, never in place of the original.
   - Do not claim the logo is available until the repository file can be opened and checked.

## Upload and verification workflow

- Upload only the blank receipt template. Do not commit receipts containing real patient information.
- Use descriptive lowercase filenames and preserve the original format.
- After upload, verify the files exist in the repository, can be opened, and have the expected dimensions and file type.
- Record pixel dimensions, file size, and format in this document after actual inspection.
- Add a visual inspection note if the receipt image is skewed, blurry, cropped, or has color/lighting distortion.
- Keep source assets separate from generated Stitch screenshots and app UI mockups.
- A public repository makes committed assets public; only upload artwork and blank documents intended to be public.

## Design use

- The receipt source image guides the A5 portrait paper template. Do not claim 100% fidelity until the reference has been inspected and the rendered output has been compared against it.
- The official logo is placed from the verified original asset in the centered logo position specified by the receipt design.
- Stitch may require an explicit image upload rather than a URL. If so, download the same repository asset and import that exact file into Stitch.
- No application code is authorized until page wireframes, receipt design, data model, and interactions are reviewed and approved.
