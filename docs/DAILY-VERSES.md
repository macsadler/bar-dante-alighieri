# Verse of the day and the quiz

Both live in the Dante section and are **Italian and English only, on purpose**: poetry is not machine-translated. In the other five languages those two blocks are replaced by a short note with Italiano / English buttons.

## Verse of the day (`data/daily.json`)

- One JSON file, one entry per line of the rotation: `{ "ref": "Inferno III, 9", "verse": "…", "it": "riflessione", "en": "reflection" }`. Use ` / ` inside `verse` for a line break.
- The page picks the entry for **today's date in Rome** (`days since 1970 mod number of entries`). No server, no scheduler, nothing to run: every visitor sees the same verse all day, and it changes at midnight Rome time. When the list runs out it simply starts again.
- The file is ordered canto by canto, so over a cycle the daily verse walks through the poem in order. It currently has 134 entries covering all 100 cantos (34 Inferno, 33 Purgatorio, 33 Paradiso), so the cycle repeats every 134 days.
- **If the file cannot be loaded** (offline, blocked, broken JSON, empty list) the page keeps the static verse already written in `index.html`. The "Un altro verso" button then does nothing and nothing breaks.
- To make the cycle longer, just append entries to the end of the list; no code changes. Keep each one to a real line of the poem and a one-sentence reflection in Italian and in English.

### Proofreading (important)

The verses were written out from memory, in modernised spelling, because no verified text of the Commedia was reachable while building the site. Before the site goes public, have someone check every `verse` and `ref` against a printed edition (spelling and line numbers vary slightly between editions; canto numbers and the quoted words should match). The reflections are the bar's own light-hearted thoughts, not scholarship.

## Quiz "Che girone sei?" (in `script.js`, `QUIZ`)

Five questions, four answers each; every answer adds points to two of seven "circles" (Paradiso, Purgatorio, Limbo, romantics, gourmands, the fiery, the cunning). The highest score wins, ties go in the fixed order of `QUIZ.order`. Each circle suggests one drink that really is on the menu and a button that opens that menu category. All seven results are reachable and none wins less than about 10% of the time. Nothing is stored or sent anywhere.
