# Changelog — what each round added

Newest first. Each round is one set of changes pushed to the preview branch.

## Round 14 — 5 Nov 2026 · the gallery only shows photos that exist
- The gallery (and its "Foto" menu link and hero button) now appears only once a listed photo really loads, and a photo that cannot load removes its own tile. A list pointing at files that are not uploaded yet therefore shows nothing instead of blank squares. `?preview=gallery` still shows sample tiles when no listed photo loads.
- When the offline cache is renamed (the owner bumped it to `bda-site-v2` in `6054eb4`), the old caches, with their cached photos, are now deleted from visitors' phones instead of being left behind.
- The gallery check runs only after the page has finished loading and the browser is idle, at low priority, so the 3.6 MB of photos can never slow the menu's first view; only the first 8 photos load until "Show all photos" is tapped, and the full-screen viewer still steps through all 15.
- Owner updates since Round 13: the verse for 5 Nov published through `data/today.json` (`a6196ce`), and 15 photos added to `photos/` with their list in `photos.js` (`e6b39b6` … `bc5f473`): the gallery is now live.

## Round 17 — 6 Nov 2026 · verse of the day: browse and read more (owner, `61fcf87` … `a49acf8`)
- **Previous / Today / Next** buttons walk through the verses (wrapping around the list); "Today" returns to the day's verse, including a verse published through `data/today.json`.
- **"Leggi di più / Read more"** opens a short bilingual summary of the verse's canto (`data/canti.json`, all 100 cantos) and a link to the Italian text of that canto on the Princeton Dante Project. Changing verse closes it. Still Italian and English only.
- On the smallest phones (320 px) the three buttons were clipping their arrows; there Previous and Next now sit side by side with Today full width below. The owner also made the buttons equal width and the canto link language-aware (`2a0eefb`).
- Checked here: navigation and wrap-around, expand/collapse, the override, the other languages (the block stays hidden), no errors; spot-checked five canto summaries (Inferno V and XXVI, Purgatorio V, Paradiso XVII and XXXIII) and they are accurate. The owner added `tests/check-daily.py` (needs Python Playwright).

## Round 16 — 6 Nov 2026 · 31 languages
- Owner: the picker now offers 29 machine-translated languages plus Italiano and English (`5eddfb8` … `b70427a`). All 29 language files are in the repository; each loads, covers the same text and fits a phone screen. They are machine translations and need native review.
- **Right-to-left done properly:** Arabic, Farsi and Hebrew now switch the whole page to right-to-left (text alignment, header, menu, hours, bullets), not just the text spans.
- **No dead buttons:** a language whose file is missing or broken (as 12 of them were for a few hours while the batches were uploaded) greys itself out as "prossimamente / coming soon" the first time it is tapped, instead of doing nothing.

## Round 15 — 5 Nov 2026 · the owner's photos woven through the page
- The owner added photos to About, the menu, Wines and the visit block (`660b667`). Made them fit the design: on phones the three menu photos are one slim swipeable row, so the menu stays the first thing you see; About shows the photo above the history panel; the photo viewer counts each photo once (15, not 21).
- Alt text now describes what each photo shows, and the caption that did not match its picture was removed.

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
