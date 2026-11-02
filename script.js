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
      var t = L.strings[en.innerHTML];
      var sp = document.createElement('span');
      sp.setAttribute('lang', code);
      sp.setAttribute('data-gen', '');
      sp.innerHTML = t !== undefined ? t : en.innerHTML; // fall back to English
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

  /* ---------- Menu: fold-open categories on phones ---------- */
  var mq = window.matchMedia('(max-width: 820px)');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.menu-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('#menuTabs button'));

  function setOpen(card, open) {
    card.classList.toggle('open', open);
    card.querySelector('.card-toggle').setAttribute('aria-expanded', String(open));
  }
  function markChip(card) {
    chips.forEach(function (c) {
      var on = !!card && c.getAttribute('data-target') === card.id;
      c.classList.toggle('active', on);
      if (on && c.scrollIntoView) { try { c.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) {} }
    });
  }
  function openOnly(card) {
    cards.forEach(function (c) { setOpen(c, c === card); });
    markChip(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function syncMenu() {
    cards.forEach(function (c) {
      var b = c.querySelector('.card-toggle');
      b.disabled = !mq.matches; // on desktop everything is open and the header is just a title
      b.setAttribute('aria-expanded', mq.matches ? String(c.classList.contains('open')) : 'true');
    });
  }
  cards.forEach(function (card) {
    card.querySelector('.card-toggle').addEventListener('click', function () {
      if (!mq.matches) return;
      if (card.classList.contains('open')) { setOpen(card, false); markChip(null); }
      else openOnly(card);
    });
  });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      openOnly(document.getElementById(chip.getAttribute('data-target')));
    });
  });
  if (mq.addEventListener) mq.addEventListener('change', syncMenu); else if (mq.addListener) mq.addListener(syncMenu);
  syncMenu();

  /* ---------- Placeholder images that fail to load ---------- */
  document.querySelectorAll('main img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
  });

  /* ---------- Tap-to-enlarge photos (with prev/next, arrow keys, swipe, counter) ---------- */
  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lightboxImg');
  var boxCount = document.getElementById('lightboxCount');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var photos = Array.prototype.slice.call(document.querySelectorAll('main img'));
  var list = [];
  var idx = 0;
  var lastFocus = null;

  function show(i) {
    var n = list.length;
    idx = (i + n) % n;
    var img = list[idx];
    boxImg.style.visibility = ''; // the broken-image handler must never hide the lightbox image
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt || '';
    boxCount.textContent = (idx + 1) + ' / ' + n;
    prevBtn.hidden = nextBtn.hidden = n < 2;
    boxCount.hidden = n < 2;
    if (n > 1) { // warm the neighbours so swiping feels instant
      [list[(idx + 1) % n], list[(idx - 1 + n) % n]].forEach(function (nb) { new Image().src = nb.currentSrc || nb.src; });
    }
  }
  function openBox(img) {
    if (img.style.visibility === 'hidden') return;
    list = photos.filter(function (p) { return p.style.visibility !== 'hidden'; });
    lastFocus = document.activeElement;
    show(list.indexOf(img));
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

  photos.forEach(function (img) {
    if (img.classList.contains('hero-img')) return;
    img.classList.add('zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { openBox(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(img); }
    });
  });
  document.getElementById('heroZoom').addEventListener('click', function () {
    openBox(document.querySelector('.hero-img'));
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

  // Swipe left/right on phones
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
  // a swipe must not also count as a tap-to-close
  box.addEventListener('click', function (e) { if (Date.now() - swipedAt < 400) e.stopImmediatePropagation(); }, true);
})();
