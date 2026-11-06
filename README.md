# Bar Dante Alighieri — website

> **A gift, not a business.** No ads, no bookings, no commercial partnerships, no tracking or analytics, no third-party scripts. Ordering from the table goes straight to the bar's own WhatsApp: no platform, no commission, no subscription. Fonts are self-hosted. The only outside contents are the OpenStreetMap map and plain links (TripAdvisor, Digital Dante, Dante Project), which are not partnerships.

Static bilingual (IT/EN) one-page site. No build step: open `index.html` or serve the folder from any static host.

Files: `index.html`, `styles.css`, `script.js`.

What changed and when: see `CHANGELOG.md`. Opening hours live in `data/hours.json`; the site installs to the home screen and the menu works offline (`manifest.webmanifest`, `sw.js`).

## Things that wait on the family
Everything below is already built and switched off; it appears by itself once the value exists. See `docs/QR-TABLES.md` for the table-ordering setup.

- **WhatsApp number** (`config.js`) — switches on ordering from the table, the WhatsApp contact button and WhatsApp feedback.
- **Email, Instagram, guest Wi-Fi** (`config.js`) — each shows up only when filled in.
- **Photos** — `photos.js` (gallery) and `menu-photos.js` (a picture beside each dish). No stock or guest photo stands in for the bar.
- **Menu prices** — the menu is the 2022 one from the previous owners' site; Caffetteria and Dolci have no prices yet ("al banco"). Edit `index.html`, search for `PLACEHOLDER MENU`.
- **P.IVA** — not shown until confirmed (search `index.html` for `TO-CONFIRM`).

Confirmed: phone and hours (Google Business listing), TripAdvisor listing.

## Dante thread
A short Dante section (facts only), a **verse of the day** (`data/daily.json`, one entry per day by Rome date, with a built-in fallback) and a playful drink quiz. The verse and the quiz are Italian and English only on purpose. See `docs/DAILY-VERSES.md`.

## Languages
Italiano and English are written by hand in `index.html` (a `<span lang="it">` / `<span lang="en">` pair for every text). Français, Español, Deutsch, 日本語 and 中文 are **machine translations** in `lang/<code>.js`, loaded only when picked; each shows an "automatic translation — awaiting native-speaker review" note. A language file maps the exact English text to its translation (missing keys fall back to English). To add a language: create `lang/<code>.js`, add the code to `MACHINE` in `script.js`, and enable its button in the globe panel.
