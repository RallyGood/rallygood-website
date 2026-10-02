(function () {
  'use strict';

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('#nav-menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); toggle.focus(); } });
  }

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

  /* ---------- 85/15 illustration ---------- */
  var split = document.querySelector('[data-split]');
  if (split) {
    var input = split.querySelector('#custom-amount');
    var proj = split.querySelector('#project-share');
    var ops = split.querySelector('#ops-share');
    var btns = split.querySelectorAll('.amount-grid button');
    var update = function () {
      var amt = Math.max(0, Number(input.value) || 0);
      var opsPence = Math.round(amt * 100 * 0.15);
      var projPence = Math.round(amt * 100) - opsPence;
      proj.textContent = gbp2.format(projPence / 100);
      ops.textContent = gbp2.format(opsPence / 100);
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active'); input.value = b.dataset.amount; update();
      });
    });
    input.addEventListener('input', function () { btns.forEach(function (x) { x.classList.remove('active'); }); update(); });
    update();
  }

  /* ---------- Contact form (opens the visitor's email app; no server involved) ---------- */
  var form = document.querySelector('#contact-form');
  if (form) {
    var EMAIL = 'info@rallygood.org.uk';
    var topics = { general: 'General question', updates: 'Launch updates', team: 'Rally Team', sponsor: 'Business sponsorship', partner: 'Delivery partner enquiry', concern: 'Raise a concern' };
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
      var subject = 'RallyGood website: ' + topics[form.elements.topic.value];
      var body = msg + '\n\n—\n' + name + '\n' + email;
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      document.getElementById('cf-status').textContent = 'Your email app should now open with your message ready to send. If it does not, please email ' + EMAIL + ' directly.';
    });
  }
})();
