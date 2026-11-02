# Bar Dante Alighieri — website

Static bilingual (IT/EN) one-page site. No build step: open `index.html` or serve the folder from any static host.

Files: `index.html`, `styles.css`, `script.js`.

## Things to replace / confirm
Search `index.html` for:
- `PLACEHOLDER` — every photo is a temporary TripAdvisor guest photo (user-uploaded, not licensed for public use); swap in the family's own photos before launch.
- `TO-CONFIRM` — still open: P.IVA, email/WhatsApp (not shown until provided), Instagram handle (unverified), map pin, and the whole menu (2022-era, from the previous owners' site; new owners to confirm dishes and prices).

Confirmed: phone and hours (Google Business listing), TripAdvisor URL.

## Languages
Italiano and English are written by hand in `index.html` (a `<span lang="it">` / `<span lang="en">` pair for every text). Français, Español, Deutsch, 日本語 and 中文 are **machine translations** in `lang/<code>.js`, loaded only when picked; each shows an "automatic translation — awaiting native-speaker review" note. A language file maps the exact English text to its translation (missing keys fall back to English). To add a language: create `lang/<code>.js`, add the code to `MACHINE` in `script.js`, and enable its button in the globe panel.
