(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('[data-set-lang]');

  function setLang(lang) {
    root.setAttribute('lang', lang);
    root.setAttribute('data-lang', lang);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang));
    });
    try { localStorage.setItem('bda-lang', lang); } catch (e) {}
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
  });

  var saved = null;
  try { saved = localStorage.getItem('bda-lang'); } catch (e) {}
  if (saved !== 'it' && saved !== 'en') {
    saved = (navigator.language || '').toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
  }
  setLang(saved);

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
})();
