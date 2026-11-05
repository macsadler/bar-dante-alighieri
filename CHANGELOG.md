# Changelog — what each round added

Newest first. Each round is one set of changes pushed to the preview branch.

## Round 14 — 5 Nov 2026 · the gallery only shows photos that exist
- The gallery (and its "Foto" menu link and hero button) now appears only once a listed photo really loads, and a photo that cannot load removes its own tile. A list pointing at files that are not uploaded yet therefore shows nothing instead of blank squares. `?preview=gallery` still shows sample tiles when no listed photo loads.
- Owner updates since Round 13: the verse for 5 Nov published through `data/today.json` (`a6196ce`), and the photo list restored in `photos.js` (`e6b39b6`) — **the image files themselves (`photos/photo-01.jpg` … `photo-16.jpg`) are not in the repository yet.**

## Round 13 — 4 Nov 2026 · design polish from the references
- **A storied café feel:** gilt hairlines and a small diamond ornament under headings, a printed-menu double rule on the menu cards, a gilt frame and "forty years on the square" line in the hero.
- **A bolder, friendlier menu:** bigger dish names, prices as little pills, a "Cosa ti va oggi?" question, chunkier category buttons with small food icons.
- **Dante, canto by canto:** the verse of the day is now parallel text — Italian beside the bar's own plain English rendering — with a 100-tick track that lights today's canto, and links to Digital Dante (Columbia) and the Dante Project (Princeton). Every verse in `data/daily.json` has its English rendering.
- **Fonts are self-hosted** (no request to Google; works offline). The page now contacts no outside host except the map.
- A "gift, not a business" note in the README (no ads, no bookings, no partnerships, no tracking).

## Round 12 — 4 Nov 2026 · verse-of-the-day override
- **`data/today.json`:** an outside routine can publish today's verse by writing only that file. It is used only when it is valid and dated today (Rome); anything else is ignored silently, so it can never break the site. Details in `docs/DAILY-VERSES.md`.

## Round 11 — 4 Nov 2026 · installable, offline menu, hours from a file
- **Installable:** add the site to the phone home screen (icon, full-screen app look). An "Install" button appears only where the phone supports it; iPhone users get a one-line hint.
- **Menu works offline:** after one visit the menu, hours and daily verse open with no signal. No tracking, no analytics, nothing is sent anywhere.
- **"Open now" reads `data/hours.json`:** the badge, the closing time and the hours table all follow that one file (built-in copy if it ever fails to load).

## Round 10 — 4 Nov 2026 · the in-bar menu (`5e68b74`)
- Menu filter (Tutto, Caffetteria, Aperitivi, Vini, Birra, Panini, Bruschette, Cucina, Dolci), fold-open categories on phones, two columns on desktop; Caffetteria and Dolci cards (no prices yet).
- **Dante section:** the sandwich names explained, a verse of the day (`data/daily.json`), the "Che girone sei?" drink quiz (Italian + English only).
- **Order from the table by WhatsApp** and a printable **QR sheet per table** (`tools/qr-sheet.html`): built, switched on when the bar's number is set in `config.js`.
- "Open now" badge, contact block (call, directions), gallery and dish photos that appear once real photos exist.
- Removed everything that was not the bar's own: stock/guest photos, unattributed quotes, unverified Instagram link.

## Owner fix — 3 Nov 2026 (`e03d3bf`)
- Family name spelling corrected to Midollini.

## Round 9 — 2 Nov 2026 · map no longer traps scrolling (`88072d1`)
- Tap the map once to use it; until then a finger drag scrolls the page.

## Round 8 — 2 Nov 2026 · small fixes (`5eeab6d`)
- Photo viewer with previous/next, arrow keys, swipe and counter; hidden from search engines (`noindex`); "famous" bruschetta; IT/EN buttons and globe in the phone header.

## Round 7 — 2 Nov 2026 · full name (`da7265d`)
- "Bar Dante Alighieri" everywhere, in all seven languages.

## Round 6 — 2 Nov 2026 · languages and a shorter menu (`f4c096b`)
- Language picker (IT, EN and a globe list of 28 languages) and machine translations of Français, Español, Deutsch, 日本語, 中文 (need native review); collapsible menu categories.

## Round 5 — 2 Nov 2026 (`b12f71f`)
- Tap-to-enlarge photos; language dropdown; a gallery photo showing the previous owner removed.

## Round 4 — 2 Nov 2026 (`ff0992f`)
- Temporary guest photos in place of stock images (later removed in Round 10).

## Round 3 — 2 Nov 2026 (`aa86690`)
- Full 2022 menu from the previous owners' site, with prices (to be confirmed by the new owners).

## Round 2 — 2 Nov 2026 (`13c646e`)
- Real phone number and opening hours (Google listing), direct TripAdvisor link.

## Round 1 — 2 Nov 2026 · first version (`aab2abd`)
- Bilingual (Italian/English) one-page site: home, about, menu, wines, find us (map), gallery.
