(function () {
  var root = document.documentElement;
  var origTitle = document.title;

  /* ---------- Language ---------- */
  // Italiano and English are written by hand in the HTML. The languages below are
  // machine translations, each in lang/<code>.js, loaded only when picked.
  var MACHINE = { de: 1, fr: 1, es: 1, ja: 1, zh: 1 };
  window.BDA_LANG = window.BDA_LANG || {};
  var picker = document.getElementById('langPicker');
  var moreBtn = document.getElementById('moreLangBtn');
  var panel = document.getElementById('langPanel');
  var notes = [document.getElementById('mtNote'), document.getElementById('mtNoteFoot')];
  var token = 0;

  function clearGenerated() {
    document.querySelectorAll('[data-gen]').forEach(function (n) { n.parentNode.removeChild(n); });
  }

  function applyText(code) {
    clearGenerated();
    var L = window.BDA_LANG[code];
    document.querySelectorAll('span[lang="en"]').forEach(function (en) {
      if (en.closest('.ie-only')) return; // quiz and daily verse stay Italian/English only
      var key = en.getAttribute('data-tpl') || en.innerHTML; // the open-now text is keyed by its {t} template
      var t = L.strings[key];
      var sp = document.createElement('span');
      sp.setAttribute('lang', code);
      sp.setAttribute('data-gen', '');
      sp.innerHTML = t !== undefined ? t : key; // fall back to English
      en.parentNode.insertBefore(sp, en.nextSibling);
    });
    document.title = L.title || origTitle;
  }

  function finish(code) {
    var machine = !!MACHINE[code];
    if (machine) { applyText(code); } else { clearGenerated(); document.title = origTitle; }
    root.setAttribute('lang', code);
    root.setAttribute('data-lang', code);
    document.querySelectorAll('[data-lang-code]').forEach(function (b) {
      var on = b.getAttribute('data-lang-code') === code;
      if (b.classList.contains('lang-btn')) b.setAttribute('aria-pressed', String(on));
      else if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    moreBtn.classList.toggle('active', machine);
    notes.forEach(function (n) { if (n) n.hidden = !machine; });
    try { localStorage.setItem('bda-lang', code); } catch (e) {}
    document.dispatchEvent(new Event('bda-lang'));
  }

  function setLang(code) {
    var mine = ++token;
    if (code === 'it' || code === 'en') { finish(code); return; }
    if (!MACHINE[code]) return;
    if (window.BDA_LANG[code]) { finish(code); return; }
    var s = document.createElement('script');
    s.src = 'lang/' + code + '.js';
    s.onload = function () { if (mine === token && window.BDA_LANG[code]) finish(code); };
    s.onerror = function () { if (s.parentNode) s.parentNode.removeChild(s); };
    document.head.appendChild(s);
  }

  function closePanel() {
    panel.hidden = true;
    moreBtn.setAttribute('aria-expanded', 'false');
  }
  moreBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = panel.hidden;
    if (open) closeMenu();
    panel.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
  });
  panel.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { closePanel(); moreBtn.focus(); }
  });
  document.querySelectorAll('[data-lang-code]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang-code')); closePanel(); closeMenu(); });
  });

  // Default is Italiano; a visitor's earlier choice is remembered.
  var saved = null;
  try { saved = localStorage.getItem('bda-lang'); } catch (e) {}
  finish('it');
  if (saved === 'en' || MACHINE[saved]) setLang(saved);

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Menu: category filter, and fold-open categories on phones ---------- */
  var mq = window.matchMedia('(max-width: 820px)');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.menu-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('#menuFilter button'));
  var currentCat = 'all';

  function setOpen(card, open) {
    card.classList.toggle('open', open);
    card.querySelector('.card-toggle').setAttribute('aria-expanded', String(open));
  }
  function applyFilter(cat, scrollTo) {
    if (!chips.some(function (c) { return c.getAttribute('data-filter') === cat; })) cat = 'all';
    currentCat = cat;
    chips.forEach(function (c) {
      var on = c.getAttribute('data-filter') === cat;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', String(on));
      if (on) { // centre the chosen chip inside the chip row only (never scroll the page itself)
        var row = c.parentNode;
        row.scrollLeft = c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2;
      }
    });
    var shown = [];
    cards.forEach(function (card) {
      var show = cat === 'all' || card.getAttribute('data-cats').split(' ').indexOf(cat) > -1;
      card.hidden = !show;
      if (show) shown.push(card);
      setOpen(card, show && cat !== 'all'); // a chosen category opens by itself; "Tutto" starts folded on phones
    });
    if (scrollTo && shown.length) shown[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function syncMenu() {
    cards.forEach(function (c) {
      var b = c.querySelector('.card-toggle');
      b.disabled = !mq.matches; // on bigger screens everything is open and the header is just a title
      b.setAttribute('aria-expanded', mq.matches ? String(c.classList.contains('open')) : 'true');
    });
  }
  cards.forEach(function (card) {
    card.querySelector('.card-toggle').addEventListener('click', function () {
      if (mq.matches) setOpen(card, !card.classList.contains('open'));
    });
  });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter'), mq.matches); });
  });
  // links elsewhere on the page that jump straight to a category (e.g. the Dante section -> sandwiches)
  document.querySelectorAll('[data-filter-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      applyFilter(a.getAttribute('data-filter-link'), false);
      document.getElementById('carta').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  if (mq.addEventListener) mq.addEventListener('change', syncMenu); else if (mq.addListener) mq.addListener(syncMenu);
  // deep link for the QR code: index.html?cat=panini
  var wanted = 'all';
  try { wanted = new URLSearchParams(location.search).get('cat') || 'all'; } catch (e) {}
  applyFilter(wanted, false);
  syncMenu();

  /* ---------- Open now: reads data/hours.json (built-in copy used if it cannot be loaded) ---------- */
  var HOURS = { 0: [495, 1290], 1: [390, 1290], 2: null, 3: [390, 1290], 4: [390, 1290], 5: [390, 1290], 6: [390, 1290] };
  var HOURS_TZ = 'Europe/Rome';
  var hourRows = Array.prototype.slice.call(document.querySelectorAll('.hours tr'));
  hourRows.forEach(function (tr) { tr.querySelector('td').setAttribute('data-orig', tr.querySelector('td').innerHTML); });
  function toMins(s) { var m = /^(\d{1,2}):(\d{2})$/.exec(String(s)); return m ? (+m[1]) * 60 + (+m[2]) : NaN; }
  function fmt(mins) { return Math.floor(mins / 60) + ':' + ('0' + (mins % 60)).slice(-2); }
  function loadHours(d) { // accepts the shape of data/hours.json; ignores anything malformed
    if (!d || !d.week) return false;
    var out = {};
    for (var k = 0; k < 7; k++) {
      var w = d.week[k];
      if (w === null) { out[k] = null; continue; }
      if (!w || w.length !== 2 || isNaN(toMins(w[0])) || isNaN(toMins(w[1]))) return false;
      out[k] = [toMins(w[0]), toMins(w[1])];
    }
    HOURS = out; if (d.timezone) HOURS_TZ = d.timezone;
    return true;
  }
  function renderHoursTable() { // the table shows what the data file says
    hourRows.forEach(function (tr) {
      var day = parseInt(tr.getAttribute('data-day'), 10), td = tr.querySelector('td'), h = HOURS[day];
      if (h) { td.textContent = fmt(h[0]) + ' – ' + fmt(h[1]); tr.classList.remove('closed'); }
      else { td.innerHTML = td.getAttribute('data-orig'); tr.classList.add('closed'); }
    });
  }
  function fillTimes(h) { // put the closing time into the "until {t}" text, in whichever language is showing
    document.querySelectorAll('.ob-open span').forEach(function (sp) {
      if (!sp.hasAttribute('data-tpl')) sp.setAttribute('data-tpl', sp.textContent);
      sp.textContent = sp.getAttribute('data-tpl').replace('{t}', h ? fmt(h[1]) : '');
    });
  }
  function updateOpen() {
    var day = null, mins = null;
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: HOURS_TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
      mins = (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10);
    } catch (e) { return; }
    if (day === undefined || isNaN(mins)) return;
    var h = HOURS[day];
    var state = !h ? 'closedtoday' : (mins >= h[0] && mins < h[1] ? 'open' : 'closed');
    fillTimes(h);
    document.querySelectorAll('[data-open]').forEach(function (b) { b.setAttribute('data-state', state); });
    hourRows.forEach(function (tr) { tr.classList.toggle('today', parseInt(tr.getAttribute('data-day'), 10) === day); });
  }
  renderHoursTable();
  updateOpen();
  setInterval(updateOpen, 60000);
  document.addEventListener('bda-lang', updateOpen); // new language -> new "until {t}" text needs its time
  if (location.protocol.indexOf('http') === 0 && window.fetch) {
    fetch('data/hours.json').then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
      if (loadHours(d)) { renderHoursTable(); updateOpen(); }
    }).catch(function () { /* built-in hours stay */ });
  }

  /* ---------- Optional contacts from config.js (empty = not shown) ---------- */
  var cfg = window.BDA_CONFIG || {};
  var wa = String(cfg.whatsapp || '').replace(/\D/g, '');
  var waOk = wa.length >= 8 && wa.length <= 15;
  if (waOk) {
    var waBtn = document.getElementById('waBtn');
    waBtn.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Ciao! / Hello!');
    waBtn.hidden = false;
  }
  var extra = document.getElementById('extraContacts');
  function addRow(label, href, text) {
    var dt = document.createElement('dt'); dt.textContent = label;
    var dd = document.createElement('dd'); var a = document.createElement('a');
    a.href = href; a.textContent = text;
    if (href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
    dd.appendChild(a); extra.appendChild(dt); extra.appendChild(dd); extra.hidden = false;
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(cfg.email || ''))) addRow('Email', 'mailto:' + cfg.email, cfg.email);
  if (/^[A-Za-z0-9._]{1,30}$/.test(String(cfg.instagram || ''))) addRow('Instagram', 'https://www.instagram.com/' + cfg.instagram + '/', '@' + cfg.instagram);

  /* ---------- Map: ignore finger drags until tapped, so the page keeps scrolling ---------- */
  var mapFrame = document.getElementById('mapFrame');
  var mapShield = document.getElementById('mapShield');
  var mapLock = document.getElementById('mapLock');
  function wakeMap() { mapFrame.classList.add('active'); mapLock.hidden = false; }
  function sleepMap() { mapFrame.classList.remove('active'); mapLock.hidden = true; }
  mapShield.addEventListener('click', wakeMap);
  mapLock.addEventListener('click', sleepMap);
  // touching anywhere outside the map puts it back to sleep for the next scroll past it
  document.addEventListener('pointerdown', function (e) {
    if (mapFrame.classList.contains('active') && !mapFrame.contains(e.target)) sleepMap();
  });

  /* ---------- Install to the home screen + offline menu (no tracking) ---------- */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  (function () {
    var row = document.getElementById('installRow'), btn = document.getElementById('installBtn'), ios = document.getElementById('iosHint');
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone;
    if (standalone) return;
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) { // Android / desktop Chrome: a real install button, only when it can work
      e.preventDefault(); deferred = e; btn.hidden = false; row.hidden = false;
    });
    btn.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; btn.hidden = true; row.hidden = !ios || ios.hidden; });
    });
    window.addEventListener('appinstalled', function () { btn.hidden = true; row.hidden = true; });
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) { ios.hidden = false; row.hidden = false; } // iOS Safari has no install event
  })();

  /* ---------- Photo-ready menu: a dish shows a picture only if menu-photos.js lists one ---------- */
  (function () {
    var map = window.BDA_MENU_PHOTOS || {};
    var wantPreview = false;
    try { wantPreview = (new URLSearchParams(location.search).get('preview') || '').split(',').indexOf('photos') > -1; } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('.menu-card li'), function (li) {
      var name = li.querySelector('strong').textContent.trim();
      var el = null;
      if (map[name]) {
        el = document.createElement('img');
        el.className = 'dish-photo'; el.src = map[name]; el.alt = name; el.loading = 'lazy'; el.decoding = 'async';
        el.addEventListener('error', function () { el.style.display = 'none'; });
      } else if (wantPreview) { // ornamental stand-in, only for layout review; clearly not a photo
        el = document.createElement('span');
        el.className = 'dish-photo ph'; el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<svg viewBox="0 0 200 200"><use href="#laurel"/></svg>';
      }
      if (el) { li.classList.add('has-photo'); li.insertBefore(el, li.firstChild); }
    });
  })();

  /* ---------- Photos: gallery (hidden until photos are listed in photos.js) + tap-to-enlarge viewer ---------- */
  var params = null;
  try { params = new URLSearchParams(location.search); } catch (e) {}
  var preview = ((params && params.get('preview')) || '').split(',');

  function sampleTiles() { // clearly-labelled sample tiles so the layout can be reviewed; never real photos
    var out = [];
    for (var i = 0; i < 14; i++) {
      var hue = i % 2 ? 22 : 70;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + hue + ',55%,' + (38 + (i % 4) * 4) + '%)"/><stop offset="1" stop-color="hsl(' + hue + ',45%,24%)"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><circle cx="400" cy="400" r="190" fill="none" stroke="#faf3e6" stroke-opacity=".35" stroke-width="6"/><text x="400" y="420" font-family="Georgia,serif" font-size="92" text-anchor="middle" fill="#faf3e6" fill-opacity=".85">' + (i + 1) + '</text><text x="400" y="740" font-family="sans-serif" font-size="30" letter-spacing="6" text-anchor="middle" fill="#faf3e6" fill-opacity=".7">ANTEPRIMA / SAMPLE</text></svg>';
      out.push({ src: 'data:image/svg+xml,' + encodeURIComponent(svg), alt: 'Anteprima / Sample ' + (i + 1) });
    }
    return out;
  }
  var gallerySet = (Array.isArray(window.BDA_PHOTOS) ? window.BDA_PHOTOS : []).filter(function (p) { return p && p.src; });
  if (!gallerySet.length && preview.indexOf('gallery') > -1) gallerySet = sampleTiles();

  function hideBroken(img) { img.addEventListener('error', function () { img.style.visibility = 'hidden'; }); }
  if (gallerySet.length) {
    var gal = document.getElementById('gallery');
    gallerySet.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'g-tile';
      var im = document.createElement('img');
      im.src = p.src; im.alt = p.alt || ''; im.loading = 'lazy'; im.decoding = 'async';
      if (p.full) im.setAttribute('data-full', p.full);
      hideBroken(im);
      b.appendChild(im); gal.appendChild(b);
    });
    document.getElementById('galleria').hidden = false;
    ['navGallery', 'galleryCta'].forEach(function (id) { document.getElementById(id).hidden = false; });
    var more = document.getElementById('galleryMore');
    if (gallerySet.length > 8) {
      more.hidden = false;
      more.addEventListener('click', function () {
        var c = gal.classList.toggle('collapsed');
        more.setAttribute('aria-expanded', String(!c));
        if (!c) more.hidden = true;
      });
    } else { gal.classList.remove('collapsed'); }
  }

  document.querySelectorAll('main img').forEach(hideBroken);

  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lightboxImg');
  var boxCount = document.getElementById('lightboxCount');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var list = [];
  var idx = 0;
  var lastFocus = null;

  function show(i) {
    var n = list.length;
    idx = (i + n) % n;
    var img = list[idx];
    boxImg.style.visibility = ''; // the broken-image handler must never hide the lightbox image
    boxImg.src = img.getAttribute('data-full') || img.currentSrc || img.src;
    boxImg.alt = img.alt || '';
    boxCount.textContent = (idx + 1) + ' / ' + n;
    prevBtn.hidden = nextBtn.hidden = boxCount.hidden = n < 2;
    if (n > 1) { // warm the neighbours so swiping feels instant, even with dozens of photos
      [list[(idx + 1) % n], list[(idx - 1 + n) % n]].forEach(function (nb) {
        new Image().src = nb.getAttribute('data-full') || nb.currentSrc || nb.src;
      });
    }
  }
  function openBox(img) {
    list = Array.prototype.filter.call(document.querySelectorAll('main img'), function (p) {
      return p.style.visibility !== 'hidden' && !p.closest('[hidden]') && p.offsetParent !== null;
    });
    var i = list.indexOf(img);
    if (i < 0) return;
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lightboxClose').focus();
  }
  function closeBox() {
    box.hidden = true;
    boxImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var img = e.target && e.target.closest ? e.target.closest('main img') : null;
    if (img && !box.contains(img)) openBox(img);
  });
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  document.getElementById('lightboxClose').addEventListener('click', function (e) { e.stopPropagation(); closeBox(); });
  box.addEventListener('click', closeBox);
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') closeBox();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
  });
  var sx = 0, sy = 0, swipedAt = 0;
  box.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener('touchend', function (e) {
    var t = e.changedTouches[0];
    var dx = t.clientX - sx, dy = t.clientY - sy;
    if (list.length > 1 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipedAt = Date.now();
      show(dx < 0 ? idx + 1 : idx - 1);
    }
  }, { passive: true });
  box.addEventListener('click', function (e) { if (Date.now() - swipedAt < 400) e.stopImmediatePropagation(); }, true);

  /* ---------- Dante: verse of the day + quiz (Italian and English only; no upkeep) ---------- */
  var dailyEntries = null;      // from data/daily.json; stays null (static default shown) if the file cannot be loaded
  var dailyIndex = 0;
  var dailyOffset = 0;          // "Another verse" steps forward from today's entry
  function romeDateString() { // today's date in Rome, as YYYY-MM-DD
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function romeDayNumber() {
    var p = romeDateString().split('-');
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }
  // one validator for both files: daily.json entries and the optional data/today.json override
  function validEntry(x) {
    return !!x && ['verse', 'ref', 'it', 'en'].every(function (k) { return typeof x[k] === 'string' && x[k].trim() !== ''; });
  }
  var todayOverride = null;     // set only if data/today.json is valid AND dated today (Rome)
  function ieLang() { return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'it'; }
  function renderDaily() {
    if (!dailyEntries || !dailyEntries.length) return; // keep the static default
    var e = (todayOverride && dailyOffset === 0) ? todayOverride : dailyEntries[(dailyIndex + dailyOffset) % dailyEntries.length];
    document.getElementById('verseText').textContent = String(e.verse).replace(/ \/ /g, '\n');
    var g = document.getElementById('verseGloss');
    g.innerHTML = '';
    ['it', 'en'].forEach(function (l) {
      var sp = document.createElement('span'); sp.setAttribute('lang', l); sp.textContent = e[l] || ''; g.appendChild(sp);
    });
    var ref = document.createElement('span'); ref.className = 'verse-ref'; ref.textContent = ' — ' + e.ref; g.appendChild(ref);
  }
  if (location.protocol.indexOf('http') === 0 && window.fetch) {
    fetch('data/daily.json', { cache: 'default' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
      if (Array.isArray(d) && d.length && d.every(validEntry)) {
        dailyEntries = d;
        dailyIndex = romeDayNumber() % d.length;
        renderDaily();
        // Optional override: an outside routine may publish today's verse by writing only data/today.json.
        // It is used only if it parses, has date + verse + ref + it + en, and its date is today in Rome. Anything else is ignored silently.
        fetch('data/today.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (t) {
          if (validEntry(t) && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && t.date === romeDateString()) {
            todayOverride = { verse: t.verse, ref: t.ref, it: t.it, en: t.en };
            renderDaily();
          }
        }).catch(function () { /* ignored: the scheduled pick stays */ });
      }
    }).catch(function () { /* static default stays */ });
  }
  document.getElementById('verseNext').addEventListener('click', function () {
    if (dailyEntries) { dailyOffset += 1; renderDaily(); }
  });

  // --- the quiz: five light questions, each answer feeds two of seven "circles"; each circle is a drink from our menu ---
  var T = function (it, en) { return { it: it, en: en }; };
  var QUIZ = {
    questions: [
      { q: T('È sabato sera. Dove sei?', "It's Saturday night. Where are you?"), a: [
        { t: T('In piazza, a chiacchierare con tutti', 'In the square, chatting with everyone'), s: { P: 2, G: 1 } },
        { t: T('A casa con un buon libro', 'At home with a good book'), s: { L: 1, U: 1, X: 1 } },
        { t: T('Dove c\'è musica e si balla', 'Wherever there is music and dancing'), s: { X: 2, R: 1 } },
        { t: T('In giro a combinare qualcosa', 'Out and about, up to something'), s: { F: 2, G: 1 } } ] },
      { q: T('Il tuo difetto più simpatico?', 'Your most endearing flaw?'), a: [
        { t: T('Testardo come un mulo', 'Stubborn as a mule'), s: { R: 2, U: 1 } },
        { t: T('Un po\' sognatore', 'A bit of a dreamer'), s: { L: 2, U: 1 } },
        { t: T('Non resisto a un buon dolce', 'I can\'t resist a good dessert'), s: { G: 2, P: 1 } },
        { t: T('Furbetto, ma a fin di bene', 'Sly, but with good intentions'), s: { F: 2, P: 1 } } ] },
      { q: T('Come prendi una decisione?', 'How do you make a decision?'), a: [
        { t: T('D\'istinto, col cuore', 'By instinct, with my heart'), s: { X: 2, P: 1 } },
        { t: T('Dopo lunga meditazione', 'After long thought'), s: { L: 2, U: 1 } },
        { t: T('Chiedo agli amici', 'I ask my friends'), s: { P: 2, G: 1 } },
        { t: T('Trovo sempre una scappatoia', 'I always find a loophole'), s: { F: 2, R: 1 } } ] },
      { q: T('La cena ideale?', 'Your ideal dinner?'), a: [
        { t: T('Lunga, con tutta la famiglia', 'Long, with the whole family'), s: { G: 2, P: 1 } },
        { t: T('Tranquilla, a lume di candela', 'Quiet, by candlelight'), s: { X: 2, L: 1 } },
        { t: T('Veloce: ho ancora molto da fare', 'Quick — I still have a lot to do'), s: { U: 2, R: 1 } },
        { t: T('Una sfida: chi ne mangia di più?', 'A challenge: who can eat the most?'), s: { R: 2, G: 1 } } ] },
      { q: T('Cosa cerchi davanti a un bicchiere?', 'What do you look for in a glass?'), a: [
        { t: T('Compagnia', 'Company'), s: { P: 1, G: 1, X: 1 } },
        { t: T('Un momento di silenzio', 'A moment of quiet'), s: { L: 2 } },
        { t: T('Un po\' di brio', 'A bit of sparkle'), s: { R: 1, X: 1, F: 1 } },
        { t: T('Un\'idea brillante', 'A brilliant idea'), s: { F: 2, U: 1 } } ] }
    ],
    order: ['P', 'U', 'L', 'X', 'G', 'R', 'F'], // tie-break order
    results: {
      P: { name: T('Paradiso', 'Paradiso'), line: T('Sei luce e compagnia: le stelle ti stanno bene.', 'You are light and company — the stars suit you.'), drink: T('Un Prosecco, per brindare con tutti.', 'A Prosecco, to toast with everyone.'), cat: 'aperitivi' },
      U: { name: T('Purgatorio', 'Purgatorio'), line: T('Pazienza e costanza: la salita non ti spaventa.', 'Patience and steadiness — the climb doesn\'t scare you.'), drink: T('Una limonata fresca, per ripartire leggero.', 'A fresh lemonade, to set off light.'), cat: 'caffe' },
      L: { name: T('Limbo', 'Limbo'), line: T('Mente curiosa e animo gentile: i grandi pensatori ti farebbero posto.', 'Curious mind, gentle soul — the great thinkers would make room for you.'), drink: T('Un espresso, da gustare in silenzio.', 'An espresso, to enjoy in peace.'), cat: 'caffe' },
      X: { name: T('Il girone dei romantici', 'The circle of romantics'), line: T('Segui il cuore, anche quando il cuore fa le bizze.', 'You follow your heart, even when it misbehaves.'), drink: T('Un Bellini, dolce e un po\' pericoloso.', 'A Bellini, sweet and a little dangerous.'), cat: 'aperitivi' },
      G: { name: T('Il girone dei golosi', 'The circle of gourmands'), line: T('Per te la tavola è una festa, e la festa non finisce mai troppo presto.', 'For you the table is a celebration — and it never ends too soon.'), drink: T('Un Chianti Classico di Radda, con una bruschetta.', 'A Chianti Classico di Radda, with a bruschetta.'), cat: 'vini' },
      R: { name: T('Il girone dei focosi', 'The circle of the fiery'), line: T('Carattere forte e cuore caldo: dietro la scintilla c\'è un amico fedele.', 'Strong character, warm heart — behind the spark is a loyal friend.'), drink: T('Un Negroni, deciso come te.', 'A Negroni, bold like you.'), cat: 'aperitivi' },
      F: { name: T('Il girone dei furbetti', 'The circle of the cunning'), line: T('Brillante e scaltro, ma con il sorriso: la tua scappatoia è sempre elegante.', 'Brilliant and sly, but smiling — your loophole is always elegant.'), drink: T('Un Hugo, fresco e un po\' ingannevole.', 'An Hugo, fresh and a little deceptive.'), cat: 'aperitivi' }
    },
    ui: {
      start: T('Cominciamo', 'Let\'s begin'), q: T('Domanda', 'Question'), of: T('di', 'of'),
      yourCircle: T('Il tuo girone', 'Your circle'), suggest: T('Ti consigliamo', 'We suggest'),
      seeMenu: T('Vedi nel menù', 'See it in the menu'), again: T('Rifai il quiz', 'Take it again'),
      intro: T('Cinque domande, un drink consigliato. Solo per gioco!', 'Five questions, one suggested drink. Just for fun!'),
      fun: T('Per gioco, naturalmente: bevi con moderazione.', 'Just for fun, of course — please drink responsibly.')
    }
  };
  var quizState = { step: -1, score: null };
  function quizResult() {
    var best = null;
    QUIZ.order.forEach(function (k) { if (best === null || quizState.score[k] > quizState.score[best]) best = k; });
    return best;
  }
  function renderQuiz() {
    var body = document.getElementById('quizBody');
    var l = ieLang();
    var U = QUIZ.ui;
    body.innerHTML = '';
    function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
    function btn(text, cls, fn) { var b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b; }
    if (quizState.step < 0) {
      body.appendChild(el('p', 'quiz-intro', U.intro[l]));
      body.appendChild(btn(U.start[l], 'btn btn-light', function () {
        quizState = { step: 0, score: { P: 0, U: 0, L: 0, X: 0, G: 0, R: 0, F: 0 } }; renderQuiz();
      }));
    } else if (quizState.step < QUIZ.questions.length) {
      var q = QUIZ.questions[quizState.step];
      body.appendChild(el('p', 'quiz-step', U.q[l] + ' ' + (quizState.step + 1) + ' ' + U.of[l] + ' ' + QUIZ.questions.length));
      body.appendChild(el('p', 'quiz-q', q.q[l]));
      var list = el('div', 'quiz-answers');
      q.a.forEach(function (ans) {
        list.appendChild(btn(ans.t[l], 'quiz-answer', function () {
          Object.keys(ans.s).forEach(function (k) { quizState.score[k] += ans.s[k]; });
          quizState.step += 1; renderQuiz();
        }));
      });
      body.appendChild(list);
    } else {
      var key = quizResult(), r = QUIZ.results[key];
      body.appendChild(el('p', 'quiz-step', U.yourCircle[l]));
      body.appendChild(el('p', 'quiz-result', r.name[l]));
      body.appendChild(el('p', 'quiz-line', r.line[l]));
      body.appendChild(el('p', 'quiz-drink', U.suggest[l] + ': ' + r.drink[l]));
      var row = el('div', 'quiz-actions');
      row.appendChild(btn(U.seeMenu[l], 'btn btn-light', function () {
        applyFilter(r.cat, false);
        document.getElementById('carta').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
      row.appendChild(btn(U.again[l], 'btn btn-ghost', function () { quizState = { step: -1, score: null }; renderQuiz(); }));
      body.appendChild(row);
      body.appendChild(el('p', 'quiz-fun', U.fun[l]));
    }
  }
  renderQuiz();
  window.__bdaQuizForTest = { QUIZ: QUIZ };
  // keep the Italian/English-only blocks in step with the language switch
  document.addEventListener('bda-lang', function () { renderQuiz(); });

  /* ---------- Wi-Fi (only if the family sets it in config.js) ---------- */
  if (cfg.wifi && cfg.wifi.ssid && cfg.wifi.password) {
    document.getElementById('wifiName').textContent = cfg.wifi.ssid;
    document.getElementById('wifiRow').hidden = false;
    document.getElementById('wifiCopy').addEventListener('click', function () {
      function done() { var d = document.getElementById('wifiDone'); d.hidden = false; setTimeout(function () { d.hidden = true; }, 2500); }
      var pw = String(cfg.wifi.password);
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(pw).then(done, fallbackCopy); } else { fallbackCopy(); }
      function fallbackCopy() {
        var ta = document.createElement('textarea'); ta.value = pw; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { if (document.execCommand('copy')) done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Feedback by WhatsApp (only with a number) ---------- */
  if (waOk) {
    var fb = document.getElementById('waFeedback');
    fb.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Feedback sul Bar Dante Alighieri: ');
    fb.hidden = false;
  }

  /* ---------- Order from your table, composed as a WhatsApp message ---------- */
  // Works only with a real number in config.js (the order lands on the bar's own WhatsApp, nothing else to run).
  // ?preview=order shows the whole flow with a copyable message instead of sending anywhere.
  var orderLive = waOk, orderDemo = !waOk && preview.indexOf('order') > -1;
  if (orderLive || orderDemo) {
    var lines = {};          // key -> { name, variant, qty }
    var ordering = false, built = false;
    var $ = function (id) { return document.getElementById(id); };
    var tableFromUrl = params ? (params.get('table') || params.get('t') || '') : '';
    if (!/^[A-Za-z0-9\-]{1,12}$/.test(tableFromUrl)) tableFromUrl = '';
    try {
      var saved = JSON.parse(sessionStorage.getItem('bda-order') || 'null');
      if (saved && saved.lines) { lines = saved.lines; $('orderName').value = saved.name || ''; $('orderNote').value = saved.note || ''; $('orderTable').value = saved.table || ''; }
    } catch (e) {}
    if (tableFromUrl) $('orderTable').value = tableFromUrl;
    $('orderIntro').hidden = false;
    if (tableFromUrl) { $('tableNum').textContent = tableFromUrl; $('tableBadge').hidden = false; }

    var keyOf = function (name, variant) { return variant ? name + '|' + variant : name; };
    function total() { var n = 0; Object.keys(lines).forEach(function (k) { n += lines[k].qty; }); return n; }
    function persist() {
      try { sessionStorage.setItem('bda-order', JSON.stringify({ lines: lines, name: $('orderName').value, note: $('orderNote').value, table: $('orderTable').value })); } catch (e) {}
    }
    function stepper(key) {
      var d = document.createElement('div');
      d.className = 'stepper'; d.setAttribute('data-key', key);
      d.innerHTML = '<button type="button" data-d="-1" aria-label="−">−</button><span class="qty">0</span><button type="button" data-d="1" aria-label="+">+</button>';
      return d;
    }
    function build() {
      built = true;
      cards.forEach(function (card) {
        Array.prototype.forEach.call(card.querySelectorAll('li'), function (li) {
          var name = li.querySelector('strong').textContent.trim();
          var row = document.createElement('div');
          row.className = 'order-row';
          var opts = (li.getAttribute('data-opts') || '').split('|').filter(Boolean);
          if (opts.length) {
            opts.forEach(function (o) {
              var wrap = document.createElement('div'); wrap.className = 'opt';
              var lab = document.createElement('span'); lab.textContent = o; lab.className = 'opt-label';
              var st = stepper(keyOf(name, o));
              st.setAttribute('data-name', name); st.setAttribute('data-variant', o);
              wrap.appendChild(lab); wrap.appendChild(st); row.appendChild(wrap);
            });
          } else {
            var s = stepper(keyOf(name, '')); s.setAttribute('data-name', name); s.setAttribute('data-variant', ''); row.appendChild(s);
          }
          li.appendChild(row);
        });
      });
    }
    function bump(name, variant, d) {
      var k = keyOf(name, variant);
      var cur = lines[k] ? lines[k].qty : 0;
      var q = Math.max(0, Math.min(20, cur + d));
      if (q === 0) delete lines[k]; else lines[k] = { name: name, variant: variant, qty: q };
      render();
    }
    function render() {
      document.querySelectorAll('.stepper').forEach(function (s) {
        var k = s.getAttribute('data-key');
        s.querySelector('.qty').textContent = lines[k] ? lines[k].qty : 0;
      });
      var n = total();
      $('orderCount').textContent = n;
      $('orderBar').hidden = !(ordering && n > 0);
      // sheet list
      var ul = $('orderLines'); ul.innerHTML = '';
      Object.keys(lines).forEach(function (k) {
        var l = lines[k];
        var li = document.createElement('li');
        var t = document.createElement('span'); t.textContent = l.name + (l.variant ? ' (' + l.variant + ')' : '');
        li.appendChild(t);
        var st = stepper(k); st.setAttribute('data-name', l.name); st.setAttribute('data-variant', l.variant);
        st.querySelector('.qty').textContent = l.qty;
        li.appendChild(st); ul.appendChild(li);
      });
      $('orderEmpty').hidden = n > 0;
      persist();
    }
    function message() {
      var t = $('orderTable').value.trim();
      var out = ['Ordine dal tavolo ' + t];
      Object.keys(lines).forEach(function (k) { var l = lines[k]; out.push(l.qty + ' × ' + l.name + (l.variant ? ' (' + l.variant + ')' : '')); });
      var nm = $('orderName').value.trim(), nt = $('orderNote').value.trim();
      if (nm) out.push('Nome: ' + nm);
      if (nt) out.push('Note: ' + nt);
      return out.join('\n'); // always Italian, so the bar reads it the same whatever language the guest uses
    }
    function setOrdering(on) {
      ordering = on;
      if (on && !built) build();
      document.querySelector('.menu-grid').classList.toggle('ordering', on);
      $('orderToggle').setAttribute('aria-pressed', String(on));
      $('orderHint').hidden = !on;
      if (on) cards.forEach(function (c) { c.hidden = false; setOpen(c, mq.matches ? c.classList.contains('open') : true); });
      render();
    }
    function openSheet() { $('orderSheet').hidden = false; document.body.style.overflow = 'hidden'; $('orderAfter').hidden = true; render(); }
    function closeSheet() { $('orderSheet').hidden = true; document.body.style.overflow = ''; }

    $('orderToggle').addEventListener('click', function () { setOrdering(!ordering); });
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.stepper button') : null;
      if (!b) return;
      var s = b.parentNode;
      bump(s.getAttribute('data-name'), s.getAttribute('data-variant'), parseInt(b.getAttribute('data-d'), 10));
    });
    $('orderOpen').addEventListener('click', openSheet);
    $('orderClose').addEventListener('click', closeSheet);
    $('orderSheet').addEventListener('click', function (e) { if (e.target === $('orderSheet')) closeSheet(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('orderSheet').hidden) closeSheet(); });
    ['orderTable', 'orderName', 'orderNote'].forEach(function (id) { $(id).addEventListener('input', function () { $('orderWarn').hidden = true; persist(); }); });
    $('orderClear').addEventListener('click', function () { lines = {}; render(); });
    $('orderSend').addEventListener('click', function () {
      if (!total()) return;
      if (!$('orderTable').value.trim()) { $('orderWarn').hidden = false; $('orderTable').focus(); return; }
      var text = message();
      if (orderLive) {
        $('orderAfter').hidden = false;
        window.location.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
      } else {
        $('orderText').textContent = text;
        $('orderPreview').hidden = false;
      }
    });
    $('orderCopy').addEventListener('click', function () {
      var ta = document.createElement('textarea'); ta.value = $('orderText').textContent; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    });
    if (tableFromUrl) setOrdering(true); else if (total() > 0) setOrdering(true); else render();
  }
})();
