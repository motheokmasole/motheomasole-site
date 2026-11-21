/* ============================================================
   Motheo Masole — With Intention
   Shared behaviour: nav, scroll reveal, newsletter form.
   ============================================================ */

/* -- Mobile nav -- */
(function () {
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (!nav || !toggle) return;
  toggle.addEventListener('click', function () {
    var open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.textContent = open ? 'Menu' : 'Close';
  });
})();

/* -- Spotify player: only loads when the visitor asks for it -- */
(function () {
  var frame = document.querySelector('[data-spotify]');
  var btn = document.querySelector('[data-spotify-load]');
  if (!frame || !btn) return;
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.title = 'With Intention on Spotify';
    f.src = frame.getAttribute('data-spotify');
    f.width = '100%'; f.height = '352';
    f.style.border = '0'; f.style.borderRadius = '12px';
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.innerHTML = '';
    frame.appendChild(f);
  });
})();

/* -- Scroll reveal -- */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

/* -- Footer year -- */
(function () {
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();

/* -- Signup forms --
   Posts { email, first_name, list } to the Netlify function in
   netlify/functions/subscribe.js, which adds the person to Kit.
   data-list on the form picks the list: "newsletter" or "iha". -- */
(function () {
  var ENDPOINT = '/.netlify/functions/subscribe';

  var form = document.querySelector('[data-signup]');
  if (!form) return;
  var msg = form.querySelector('.form-msg');
  var btn = form.querySelector('button[type="submit"]');

  function say(text, state) {
    if (!msg) return;
    msg.textContent = text;
    msg.setAttribute('data-state', state || '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (form.querySelector('input[type="email"]') || {}).value || '';
    var name = (form.querySelector('input[name="first_name"]') || {}).value || '';
    if (!email || email.indexOf('@') === -1) { say('Enter a valid email address.', 'err'); form.querySelector('input[type="email"]').focus(); return; }

    var original = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }
    say('', '');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, first_name: name, list: form.getAttribute('data-list') || 'newsletter' })
    })
      .then(function (r) { if (!r.ok) throw new Error('bad status'); return r.json().catch(function () { return {}; }); })
      .then(function () {
        form.reset();
        say(form.getAttribute('data-success') || 'You\u2019re in. Check your inbox to confirm your first Wednesday.', 'ok');
      })
      .catch(function () {
        say('Something went wrong and you haven\u2019t been added yet. Try again in a moment.', 'err');
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      });
  });
})();
