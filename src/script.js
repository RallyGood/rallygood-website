(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('#nav-menu');
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dropdown')).map(function (d) {
    var btn = d.querySelector('.nav-dropdown-toggle');
    var list = d.querySelector('.nav-dropdown-menu');
    var api = {
      el: d, btn: btn,
      isOpen: function () { return btn.getAttribute('aria-expanded') === 'true'; },
      set: function (open) { btn.setAttribute('aria-expanded', String(open)); list.hidden = !open; }
    };
    api.set(false);
    btn.addEventListener('click', function () { api.set(!api.isOpen()); });
    d.addEventListener('focusout', function (e) { if (api.isOpen() && e.relatedTarget && !d.contains(e.relatedTarget)) api.set(false); });
    return api;
  });
  document.addEventListener('click', function (e) { dropdowns.forEach(function (d) { if (d.isOpen() && !d.el.contains(e.target)) d.set(false); }); });
  function setMenu(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) dropdowns.forEach(function (d) { d.set(false); });
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openDd = dropdowns.filter(function (d) { return d.isOpen(); })[0];
    if (openDd) { openDd.set(false); openDd.btn.focus(); return; }
    if (toggle && menu) { setMenu(false); toggle.focus(); }
  });

  var gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  var gbp2 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Example Drops ---------- */
  var grid = document.querySelector('#drop-grid');
  if (grid) {
    var drops = [];
    var render = function (list) {
      grid.innerHTML = list.map(function (d) {
        var tag = d.category.toLowerCase().replace(/[^a-z0-9]/g, '');
        return '<article class="drop-card" data-category="' + esc(d.category) + '">' +
          '<div class="card-topline"><span class="tag ' + tag + '">' + esc(d.category) + '</span><span class="status-pill planned">Planned example</span></div>' +
          '<h3>' + esc(d.title) + '</h3><p>' + esc(d.summary) + '</p>' +
          '<div class="proof-points">' + d.proofPlan.slice(0, 4).map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('') + '</div>' +
          '<div class="drop-meta"><span>Example target ' + gbp0.format(d.exampleTarget) + '</span><span>Raised £0</span></div>' +
          '<div class="appeal-progress" role="img" aria-label="Not yet open, no funds raised"><span style="--p:0%"></span></div>' +
          '<details class="drop-details"><summary>Drop details</summary><div class="detail-grid">' +
          '<div><strong>Need</strong><span>' + esc(d.need) + '</span></div>' +
          '<div><strong>What it would fund</strong><span>' + d.items.map(esc).join(', ') + '</span></div>' +
          '<div><strong>Illustrative unit cost</strong><span>' + gbp0.format(d.unitCost) + ' per ' + esc(d.unitLabel) + '</span></div>' +
          '<div><strong>Partner</strong><span>To be confirmed after due diligence</span></div>' +
          '<div><strong>Region</strong><span>To be confirmed</span></div>' +
          '<div><strong>Close-out</strong><span>Published after delivery</span></div>' +
          '</div></details>' +
          '<a class="button button-light full" href="contact.html?topic=updates">Tell me when it launches</a>' +
          '</article>';
      }).join('') || '<p class="notice-card">No example Drops in this category.</p>';
    };
    fetch('/data/drops.json').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (data) {
      drops = data;
      render(drops);
    }).catch(function () {
      grid.innerHTML = '<p class="notice-card">The example Drops could not be loaded. Please refresh, or <a class="text-link" href="contact.html">contact us</a>.</p>';
    });
    document.querySelectorAll('.filter-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-button').forEach(function (b) {
          b.classList.remove('active'); b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
        var f = btn.dataset.filter;
        render(f === 'all' ? drops : drops.filter(function (d) { return d.category === f; }));
      });
    });
  }

  /* ---------- Product gallery ---------- */
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var main = gallery.querySelector('.product-main');
    var thumbs = gallery.querySelectorAll('.gallery-thumb');
    var colourSel = document.querySelector('#opt-colour');
    var showColour = function (id) {
      thumbs.forEach(function (t) {
        var on = t.dataset.colour === id;
        t.classList.toggle('active', on);
        t.setAttribute('aria-pressed', String(on));
        if (on) { main.src = t.dataset.image; main.alt = t.dataset.alt; }
      });
      if (colourSel && colourSel.value !== id) colourSel.value = id;
    };
    thumbs.forEach(function (t) { t.addEventListener('click', function () { showColour(t.dataset.colour); }); });
    if (colourSel) colourSel.addEventListener('change', function () { showColour(colourSel.value); });
  }

  /* ---------- Donation allocation: highlight a part (both explanations stay visible) ---------- */
  document.querySelectorAll('[data-alloc]').forEach(function (root) {
    var btns = root.querySelectorAll('.alloc-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        btns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', String(on));
        if (on) root.setAttribute('data-selected', btn.getAttribute('data-seg')); else root.removeAttribute('data-selected');
      });
    });
  });

  /* ---------- Demonstration giving forms: nothing is stored, sent or tracked ---------- */
  document.querySelectorAll('[data-demo]').forEach(function (root) {
    var custom = root.querySelector('[data-demo-custom]');
    var btns = root.querySelectorAll('.demo-amount');
    var err = root.querySelector('.demo-error');
    var conf = root.querySelector('.demo-confirm');
    var res = root.querySelector('[data-demo-result]');
    var sel = root.querySelector('[data-demo-purpose]');
    var stat = root.querySelector('.demo-summary-static');
    var per = root.getAttribute('data-per') || '';
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
        custom.value = b.getAttribute('data-amount'); err.hidden = true; conf.hidden = true;
      });
    });
    custom.addEventListener('input', function () {
      btns.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      err.hidden = true; conf.hidden = true;
    });
    if (sel) sel.addEventListener('change', function () { conf.hidden = true; });
    root.querySelector('[data-demo-submit]').addEventListener('click', function () {
      var amt = parseFloat(custom.value);
      if (!(amt >= 1)) { err.hidden = false; conf.hidden = true; custom.focus(); return; }
      err.hidden = true;
      res.textContent = 'Amount: ' + gbp2.format(amt) + per + '. ' + (stat ? stat.textContent + ' ' : '') + (sel ? 'Purpose: ' + sel.value + '.' : '');
      conf.hidden = false;
    });
  });

  /* ---------- Contact form (posts to the configured endpoint, else opens the visitor's email app) ---------- */
  var form = document.querySelector('#contact-form');
  if (form) {
    var EMAIL = 'info@rallygood.org.uk';
    var topics = { general: 'General question', updates: 'Launch updates', shop: 'Shop launch updates', team: 'Rally Team', sponsor: 'Business sponsorship', partner: 'Delivery partner enquiry', concern: 'Raise a concern' };
    var qs = new URLSearchParams(location.search).get('topic');
    if (qs && topics[qs]) form.elements.topic.value = qs;

    var show = function (id, bad) { var el = document.getElementById(id); if (el) el.hidden = !bad; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      show('cf-name-err', !name); show('cf-email-err', !okEmail);
      show('cf-message-err', !msg); show('cf-consent-err', !form.elements.consent.checked);
      form.elements.name.setAttribute('aria-invalid', String(!name));
      form.elements.email.setAttribute('aria-invalid', String(!okEmail));
      form.elements.message.setAttribute('aria-invalid', String(!msg));
      if (!name || !okEmail || !msg || !form.elements.consent.checked) {
        var first = form.querySelector('[aria-invalid="true"], #cf-consent:invalid, #cf-consent:not(:checked)');
        if (first) first.focus();
        return;
      }
      var endpoint = '{{CONTACT_ENDPOINT}}';
      var subject = 'RallyGood website: ' + topics[form.elements.topic.value];
      var body = msg + '\n\n-\n' + name + '\n' + email;
      var statusEl = document.getElementById('cf-status');
      if (endpoint) {
        if (form.elements._gotcha && form.elements._gotcha.value) return;
        var sentTopic = form.elements.topic.value;
        var btn = form.querySelector('button[type=submit]'); btn.disabled = true; statusEl.textContent = 'Sending…';
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ access_key: '{{WEBFORMS_KEY}}', name: name, email: email, topic: topics[form.elements.topic.value], message: msg, subject: subject, _subject: subject, botcheck: '' }) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw new Error(r.status); }); })
            .then(function () { if (window.rgTrack) window.rgTrack('contact_form_submit', { topic: sentTopic }); form.reset(); statusEl.textContent = 'Thank you. Your message has been sent. We will reply to the email address you gave.'; })
          .catch(function () { statusEl.innerHTML = 'Sorry, that did not send. Please email <a class="text-link" href="mailto:' + EMAIL + '">' + EMAIL + '</a> directly.'; })
          .then(function () { btn.disabled = false; });
        return;
      }
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      document.getElementById('cf-status').textContent = 'Your email app should now open with your message ready to send. If it does not, please email ' + EMAIL + ' directly.';
    });
  }

  /* ---------- Newsletter sign-up ---------- */
  var nl = document.querySelector('#newsletter-form');
  if (nl) {
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = document.getElementById('nl-status');
      var email = nl.elements.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { st.textContent = 'Please enter a valid email address.'; nl.elements.email.focus(); return; }
      if (!nl.elements.consent.checked) { st.textContent = 'Please tick the box to agree to receive updates.'; nl.elements.consent.focus(); return; }
      if (nl.elements._gotcha && nl.elements._gotcha.value) return;
      window.location.href = 'mailto:info@rallygood.org.uk?subject=' + encodeURIComponent('Subscribe me to RallyGood updates') + '&body=' + encodeURIComponent('Please add ' + email + ' to the RallyGood updates list. I agree to receive updates and understand I can unsubscribe at any time.');
      st.textContent = 'Your email app should open with a subscribe request. Press send to finish.';
    });
  }
})();
