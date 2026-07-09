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
    toggle.textContent = open ? 'Menu' : 'Close';
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

/* -- Newsletter signup --
   ------------------------------------------------------------
   This posts to your existing Netlify serverless function that
   proxies the Kit (ConvertKit) API. Set ENDPOINT below to match
   the function you already have in /netlify/functions/.
   It expects the function to accept { email, first_name } as JSON
   and subscribe them to form 8495408.

   Prefer zero backend? You can instead delete this block and drop
   Kit's own embed form onto the newsletter page — but this keeps
   signups on your domain with your styling, which is nicer.
   ------------------------------------------------------------ */
(function () {
  var ENDPOINT = '/.netlify/functions/subscribe'; // <-- match your function name

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
    if (!email || email.indexOf('@') === -1) { say('Enter a valid email address.', 'err'); return; }

    var original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    say('', '');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, first_name: name })
    })
      .then(function (r) { if (!r.ok) throw new Error('bad status'); return r.json().catch(function () { return {}; }); })
      .then(function () {
        form.reset();
        say('You\u2019re in. Check your inbox to confirm your first Wednesday.', 'ok');
      })
      .catch(function () {
        say('Something went wrong. Try again in a moment.', 'err');
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
  });
})();
