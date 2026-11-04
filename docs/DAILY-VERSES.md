# Verse of the day and the quiz

Both live in the Dante section and are **Italian and English only, on purpose**: poetry is not machine-translated. In the other five languages those two blocks are replaced by a short note with Italiano / English buttons.

## Verse of the day (`data/daily.json`)

- One JSON file, one entry per line of the rotation: `{ "ref": "Inferno III, 9", "verse": "…", "it": "riflessione", "en": "reflection", "trans": "plain English rendering" }`. Use ` / ` inside `verse` and `trans` for a line break.
- **Parallel text:** the verse is shown Italian and English side by side (stacked on phones). `trans` is the bar's own plain, literal rendering, labelled as such on the page — not a literary translation. It is optional: an entry without it simply shows the Italian alone.
- **Canto by canto:** a track of 100 ticks (34 Inferno, 33 Purgatorio, 33 Paradiso) lights today's canto, worked out from `ref` ("Inferno XXVI, 1" → Inferno, canto 26). An unusual `ref` just hides the track.
- The page picks the entry for **today's date in Rome** (`days since 1970 mod number of entries`). No server, no scheduler, nothing to run: every visitor sees the same verse all day, and it changes at midnight Rome time. When the list runs out it simply starts again.
- The file is ordered canto by canto, so over a cycle the daily verse walks through the poem in order. It currently has 134 entries covering all 100 cantos (34 Inferno, 33 Purgatorio, 33 Paradiso), so the cycle repeats every 134 days.
- **If the file cannot be loaded** (offline, blocked, broken JSON, empty list) the page keeps the static verse already written in `index.html`. The "Un altro verso" button then does nothing and nothing breaks.
- To make the cycle longer, just append entries to the end of the list; no code changes. Keep each one to a real line of the poem and a one-sentence reflection in Italian and in English.

### Optional override (`data/today.json`)

An outside routine can publish a verse for *today only* by overwriting this one file, without touching anything else:

```json
{ "date": "2026-11-05", "verse": "line one / line two", "ref": "Inferno I, 1", "it": "riflessione", "en": "reflection" }
```

- After `daily.json` loads, the page fetches `data/today.json` (never from cache). It is used **only if** it parses, `date`, `verse`, `ref`, `it` and `en` are all non-empty text (the same check as `daily.json` entries), **and** `date` is today's date in Rome (`YYYY-MM-DD`). Otherwise it is ignored silently and the scheduled verse stays. A wrong, old, malformed or missing file therefore can never break the site, and yesterday's file simply stops applying at midnight Rome time.
- Text is always shown as plain text, never as HTML. An optional `trans` field is also accepted (the English column is hidden if it is absent).
- The shipped file contains only a comment (no verse), so by default it does nothing.
- The service worker fetches this file from the network first, so a freshly published verse is not hidden by an old cached copy; offline, the last copy is used (and still ignored unless it is dated today).

### Proofreading (important)

The verses were written out from memory, in modernised spelling, because no verified text of the Commedia was reachable while building the site. Before the site goes public, have someone check every `verse` and `ref` against a printed edition (spelling and line numbers vary slightly between editions; canto numbers and the quoted words should match). The reflections are the bar's own light-hearted thoughts, not scholarship.

## Quiz "Che girone sei?" (in `script.js`, `QUIZ`)

Five questions, four answers each; every answer adds points to two of seven "circles" (Paradiso, Purgatorio, Limbo, romantics, gourmands, the fiery, the cunning). The highest score wins, ties go in the fixed order of `QUIZ.order`. Each circle suggests one drink that really is on the menu and a button that opens that menu category. All seven results are reachable and none wins less than about 10% of the time. Nothing is stored or sent anywhere.
