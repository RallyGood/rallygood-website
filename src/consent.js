/* Consent-gated Google Analytics 4. Nothing from Google loads until the visitor accepts.
   Choice is stored in this browser only (localStorage key rg_consent_v1) for up to 180 days. */
(function () {
  'use strict';
  var tag = document.currentScript;
  var ID = tag && tag.getAttribute('data-ga4-id');
  if (!ID || !/^G-[A-Z0-9]{4,}$/.test(ID)) return;

  var KEY = 'rg_consent_v1';
  var MAX_MS = 180 * 24 * 3600 * 1000;
  var loaded = false;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && typeof v.analytics === 'boolean' && v.exp > Date.now()) return v;
    } catch (e) { /* storage unavailable or corrupt: treat as no choice */ }
    return null;
  }
  function write(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: analytics, exp: Date.now() + MAX_MS, v: 1 })); } catch (e) { /* ignore */ }
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  /* Defaults are set before any other command. This only queues data locally; no request is made. */
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

  function load() {
    if (loaded) return;
    loaded = true;
    window['ga-disable-' + ID] = false;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);
  }

  function clearGaCookies() {
    var host = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < host.length - 1; i++) domains.push('; domain=.' + host.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0) {
        domains.forEach(function (d) { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d; });
      }
    });
  }

  function revoke() {
    window['ga-disable-' + ID] = true;
    if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' });
    clearGaCookies();
  }

  /* Events: only sent after consent and once the tag has loaded. */
  window.rgTrack = function (name, params) {
    var c = read();
    if (c && c.analytics && loaded) gtag('event', name, params || {});
  };

  /* ---------- Banner ---------- */
  var banner = null;
  var opener = null;

  function build() {
    banner = document.createElement('section');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.hidden = true;
    banner.innerHTML =
      '<h2 id="consent-title" class="sr-only" tabindex="-1">Analytics cookies</h2>' +
      '<p>We use analytics cookies to understand how visitors use this site. You can accept or reject non-essential cookies. <a class="text-link" href="/privacy.html">Cookie policy</a>.</p>' +
      '<p class="consent-state" id="consent-state" aria-live="polite"></p>' +
      '<div class="consent-actions"><button type="button" class="consent-btn consent-btn-primary" data-choice="accept">Yes, that’s fine</button><button type="button" class="consent-btn" data-choice="reject">No thanks</button></div>';
    document.body.appendChild(banner);
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-choice]');
      if (!b) return;
      var accept = b.getAttribute('data-choice') === 'accept';
      write(accept);
      if (accept) load(); else revoke();
      banner.hidden = true;
      if (opener) { opener.focus(); opener = null; }
    });
    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && read()) { banner.hidden = true; if (opener) { opener.focus(); opener = null; } }
    });
  }

  function show(fromControl) {
    if (!banner) build();
    var c = read();
    document.getElementById('consent-state').textContent = c ? ('Your current choice: analytics ' + (c.analytics ? 'accepted' : 'rejected') + '.') : '';
    banner.hidden = false;
    if (fromControl) { opener = fromControl; document.getElementById('consent-title').focus(); }
  }

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-consent-open]');
    if (open) { e.preventDefault(); show(open); return; }
    var a = e.target.closest('a[href*="topic=updates"]');
    if (a && window.rgTrack) window.rgTrack('launch_updates_click', { source_page: location.pathname });
  });

  var existing = read();
  if (existing && existing.analytics) load();
  else if (!existing) show(null);
})();
