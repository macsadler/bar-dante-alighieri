# Table QR codes and WhatsApp ordering — setup and care

This is for whoever sets the bar up once. Nothing here has to be maintained afterwards.

## How an order travels

1. A guest scans the QR code on their table. The link carries the table number (`…/?table=7#carta`), so the menu opens straight away and the site already knows the table.
2. They tap **Ordina dal tavolo**, pick items with + and −, and tap **Rivedi e invia**.
3. WhatsApp opens on *their* phone with the order already typed (items, quantities, table, optional name and note) addressed to the bar's number. They press Send.
4. The bar's dedicated phone buzzes. Staff reads it, confirms in the chat and serves the table. Payment stays at the counter.

The site stores nothing, has no accounts and no server. A person confirms every order in the chat. The message is always written in Italian, whatever language the guest used.

## Go-live checklist (all three are required)

- [ ] **Put the bar's order number in `config.js`** — digits only, country code first, no `+` or spaces (for example `39XXXXXXXXXX`). Until this is set, the ordering buttons, the WhatsApp button and the WhatsApp feedback button stay hidden, so nothing on the site is a dead end.
- [ ] **Print the table QR codes:** open `tools/qr-sheet.html` *on the live site* (so the address inside the QR is the real one), choose the table numbers, press Print (A4, 6 codes per page). Cut and laminate.
- [ ] **Do one real test order:** scan table 1, order one coffee, press Send in WhatsApp, and confirm it arrives on the order phone with "Ordine dal tavolo 1".

Tips for the order phone (WhatsApp Business is free): switch on a quick reply such as "Ordine ricevuto, arriviamo subito", and mute the phone's other notifications so an order is never missed.

## Keeping the QR codes safe

QR stickers can be pasted over the real ones ("quishing") to send guests somewhere else. Every few days, look at the table codes: if one looks like a sticker on top of a sticker, or the scan lands on an address that is not the bar's site, peel it off and replace it with a fresh print. Laminated cards (rather than stickers) kept on the table make tampering easier to spot.

## Reviewing the features before the number exists

Add these to the site address to see features that are switched off for the public:

- `?preview=order` — the whole ordering flow; "Send" shows the message in a box with a Copy button instead of opening WhatsApp. Combine with `&table=7`.
- `?preview=gallery` — the photo gallery with clearly labelled sample tiles.
- `?preview=photos` — ornamental stand-in tiles beside every dish.
- `?cat=panini` — opens the menu on one category (handy for a dedicated QR, e.g. the cocktail list).
