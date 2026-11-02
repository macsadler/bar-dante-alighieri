(function () {
  var root = document.documentElement;
  var select = document.getElementById('langSelect');

  function setLang(lang) {
    root.setAttribute('lang', lang);
    root.setAttribute('data-lang', lang);
    select.value = lang;
    try { localStorage.setItem('bda-lang', lang); } catch (e) {}
  }

  select.addEventListener('change', function () {
    if (select.value === 'it' || select.value === 'en') setLang(select.value);
  });

  // Default is Italiano; a visitor's earlier choice is remembered.
  var saved = null;
  try { saved = localStorage.getItem('bda-lang'); } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'it');

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

  // Hide any placeholder image that fails to load, so no broken-image icon shows.
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
  });

  // Tap-to-enlarge photos
  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lightboxImg');
  var lastFocus = null;

  function openBox(img) {
    if (img.style.visibility === 'hidden') return;
    lastFocus = document.activeElement;
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt || '';
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

  document.querySelectorAll('main img').forEach(function (img) {
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
  box.addEventListener('click', closeBox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) closeBox();
  });
})();
