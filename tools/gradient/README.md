# Background Gradient Generator (DA app)

A [Document Authoring](https://docs.da.live/developers/guides/developing-apps-and-plugins)
app that recreates a branded background as a **pure CSS gradient** using only the
Unify Rare brand palette.

## Files

| File | Purpose |
| --- | --- |
| `/tools/gradient.html` | App page — loads the DA SDK + the module below |
| `/tools/gradient/gradient.js` | App logic (gradient recipe, controls, DA integration) |
| `/tools/gradient/gradient.css` | App styles |

## What it does

- Builds a layered "mesh gradient" from the brand palette:
  1. Gold highlight (top-right, very low opacity)
  2. Right-side cyan bloom
  3. Large central cyan glow
  4. Deep navy shadow (left-side depth)
  5. Bottom darkening
  6. Base navy linear gradient
- **Presets**: *Dark hero* (low-contrast navy banner) and *Brighter form*
  (stronger cyan bloom + warm gold).
- **Controls**: glow strength, right-side bloom, gold strength, shadow strength,
  glow size, glow position X/Y, base angle.
- **Comparison slider**: paste a reference image URL (e.g. the original
  `background_form.jpg`) and drag to compare it against the CSS recreation.
- **Copy CSS** to clipboard; **Insert into document** appears only when the app
  is running inside DA (uses `actions.sendHTML`).

The palette is locked to brand colours — `#002F6C` base navy, `#111C4E` shadow
navy, `#59CBE8` cyan glow, `#FCA300` warm gold (3–8% opacity) — so it never
invents off-brand blues.

## Registering the app in DA

1. Open the site config sheet: `https://da.live/config#/cpilsworth/unifyrare/`
2. Add an **apps** sheet (or row) with these columns:

   | title | path | ref |
   | --- | --- | --- |
   | Background Gradient | /tools/gradient | main |

3. The card then appears at `https://da.live/apps#/cpilsworth/unifyrare`.

## Testing

- **Direct**: `https://da.live/app/cpilsworth/unifyrare/tools/gradient`
- **Branch**: append `?ref={branch-name}`
- **Local**: append `?ref=local` to iframe from `http://localhost:3000`
- **Standalone**: open `/tools/gradient.html` directly — everything works except
  the *Insert into document* button (which requires the DA host).
