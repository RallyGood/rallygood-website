// Static site builder: src/ -> dist/. No dependencies (Node 18+).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadShop } from './shop.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/site.config.json'), 'utf8'));
const registered = cfg.registrationStatus === 'registered';
const ga4 = cfg.ga4MeasurementId || '';
if (ga4 && !/^G-[A-Z0-9]{4,}$/.test(ga4)) throw new Error('ga4MeasurementId must look like G-XXXXXXXXXX');
const shopMod = loadShop(root, cfg);

const regLine = registered
  ? `Registered charity in England and Wales, no. ${cfg.charityNumber}`
  : 'Charity registration pending';
const banner = registered
  ? `Registered charity no. ${cfg.charityNumber}`
  : 'Charity registration pending · We are not yet accepting donations';

const tokens = {
  EMAIL: cfg.contactEmail,
  DOMAIN: cfg.domain,
  SITE_URL: cfg.siteUrl,
  REG_LINE: regLine,
  REG_BANNER: banner,
  LEGAL_LINE: registered
    ? `Registered charity in England and Wales, no. ${cfg.charityNumber}. RallyGood is a charitable incorporated organisation (CIO).`
    : 'Charity registration pending. RallyGood is being set up as a charitable incorporated organisation (CIO) in England.',
  CREDIT: cfg.designerUrl
    ? `<a href="${cfg.designerUrl}" rel="noopener">${cfg.designerName}</a>`
    : cfg.designerName,
  FOOTNOTE: registered
    ? 'Any Drops shown on this site are illustrative examples unless marked as live.'
    : 'RallyGood is not yet registered with the Charity Commission and is not accepting donations. Any Drops shown on this site are illustrative examples.',
  YEAR: String(new Date().getFullYear()),
  CONTACT_ENDPOINT: cfg.web3formsAccessKey ? 'https://api.web3forms.com/submit' : (cfg.contactFormEndpoint || ''),
  WEBFORMS_KEY: cfg.web3formsAccessKey || '',
  CSP_SCRIPT: ["'self'", ...(ga4 ? ['https://www.googletagmanager.com'] : [])].join(' '),
  CSP_IMG: ["'self'", 'data:', ...(ga4 ? ['https://www.googletagmanager.com', 'https://*.google-analytics.com'] : [])].join(' '),
  CONSENT_SCRIPT: ga4 ? `<script src="/consent.js" defer data-ga4-id="${ga4}"></script>` : '',
  COOKIE_LINK: ga4 ? '<button type="button" class="link-button" data-consent-open>Cookie preferences</button>' : '',
  CSP_CONNECT: ["'self'", ...(ga4 ? ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'] : []), ...(cfg.web3formsAccessKey ? ['https://api.web3forms.com'] : []), ...(cfg.contactFormEndpoint ? [new URL(cfg.contactFormEndpoint).origin] : [])].filter((v, i, a) => a.indexOf(v) === i).join(' '),
  CSP_FRAME: cfg.beehiivEmbedUrl ? new URL(cfg.beehiivEmbedUrl).origin : "'none'",
  NEWSLETTER: cfg.beehiivEmbedUrl
    ? fs.readFileSync(path.join(src, 'partials/newsletter-embed.html'), 'utf8').replace('__BEEHIIV__', cfg.beehiivEmbedUrl.replace(/"/g, '&quot;'))
    : fs.readFileSync(path.join(src, 'partials/newsletter-form.html'), 'utf8'),
  FORM_BUTTON: (cfg.web3formsAccessKey || cfg.contactFormEndpoint) ? 'Send message' : 'Open email to send',
  FORM_STATUS: (cfg.web3formsAccessKey || cfg.contactFormEndpoint)
    ? 'We will reply to the email address you give. If sending fails you can email us directly.'
    : 'This form prepares an email in your own email app – nothing is sent until you press send there. If nothing opens, email us directly.',
  PRIVACY_FORM: cfg.web3formsAccessKey
    ? 'If you use the contact form, your name, email address and message are sent to us through Web3Forms, a form service acting on our behalf, which delivers them to us by email. If you email us directly we receive the same details.'
    : cfg.contactFormEndpoint
      ? 'If you use the contact form, your name, email address and message are sent to us through a third-party form service acting on our behalf, which delivers them to us by email. If you email us directly we receive the same details.'
      : 'If you email us or use the contact form (which opens an email in your own email app), we receive your name, email address and message.',
  PRIVACY_NEWS: cfg.beehiivEmbedUrl
    ? 'Sign-ups and emails are handled for us by beehiiv, our email newsletter service, which stores your email address and sends our updates on our behalf.'
    : 'Until our email newsletter service is set up, sign-up requests arrive as an email to us and we add you to our list manually.',
};
tokens.PRIVACY_SITE = [
  ga4
    ? 'We use Google Analytics 4, provided by Google, to count visits and see which pages are used, but only if you accept analytics in the cookie banner. If you reject, or have not chosen, the Google Analytics code is not loaded. If you accept, it sets cookies (named _ga and _ga_ followed by an identifier) and sends Google your page address, device and browser details and an approximate location worked out from your IP address. We have switched off Google signals and advertising personalisation. You can change or withdraw your choice at any time with “Cookie preferences” in the footer; your choice is stored in your browser for up to 180 days. See Google’s own privacy information for how Google handles this data. We do not use advertising tools, and this website does not take donations or payments.'
    : 'We have not added analytics, advertising or tracking tools of our own to this website, and it does not take donations or payments.',
  cfg.beehiivEmbedUrl ? 'The newsletter sign-up form in the footer is provided by beehiiv and loads from beehiiv\u2019s servers, so beehiiv receives technical details such as your IP address and browser when a page with the form loads. It may also use cookies or similar technologies, which are described in beehiiv\u2019s own privacy information.' : '',
  cfg.web3formsAccessKey ? 'If you use the contact form, what you enter is sent from your browser to Web3Forms.' : '',
  'Our hosting providers may keep standard technical logs (such as IP address and page requested) for security and reliability.',
].filter(Boolean).join(' ');

function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  let i = 2;
  while (i < b.length) { if (b[i] !== 0xff) { i++; continue; } const m = b[i + 1]; const len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + len; }
  throw new Error('Unknown image format: ' + file);
}
const [CARD_W, CARD_H] = imageSize(path.join(src, 'assets/social-card.png'));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const gbp0 = (n) => '\u00a3' + Number(n).toLocaleString('en-GB', { maximumFractionDigits: 0 });
// Static copy of the example Drop cards (same markup as src/script.js) so the content exists without JavaScript.
const dropsData = JSON.parse(fs.readFileSync(path.join(src, 'data/drops.json'), 'utf8'));
tokens.DROP_CARDS = dropsData.map((d) => {
  const tag = d.category.toLowerCase().replace(/[^a-z0-9]/g, '');
  return '<article class="drop-card" data-category="' + esc(d.category) + '">' +
    '<div class="card-topline"><span class="tag ' + tag + '">' + esc(d.category) + '</span><span class="status-pill planned">Planned example</span></div>' +
    '<h3>' + esc(d.title) + '</h3><p>' + esc(d.summary) + '</p>' +
    '<div class="proof-points">' + d.proofPlan.slice(0, 4).map((x) => '<span>' + esc(x) + '</span>').join('') + '</div>' +
    '<div class="drop-meta"><span>Example target ' + gbp0(d.exampleTarget) + '</span><span>Raised \u00a30</span></div>' +
    '<div class="appeal-progress" role="img" aria-label="Not yet open, no funds raised"><span style="--p:0%"></span></div>' +
    '<details class="drop-details"><summary>Drop details</summary><div class="detail-grid">' +
    '<div><strong>Need</strong><span>' + esc(d.need) + '</span></div>' +
    '<div><strong>What it would fund</strong><span>' + d.items.map(esc).join(', ') + '</span></div>' +
    '<div><strong>Illustrative unit cost</strong><span>' + gbp0(d.unitCost) + ' per ' + esc(d.unitLabel) + '</span></div>' +
    '<div><strong>Partner</strong><span>To be confirmed after due diligence</span></div>' +
    '<div><strong>Region</strong><span>To be confirmed</span></div>' +
    '<div><strong>Close-out</strong><span>Published after delivery</span></div>' +
    '</div></details>' +
    '<a class="button button-light full" href="contact.html?topic=updates">Tell me when it launches</a>' +
    '</article>';
}).join('');

tokens.SHOP_HOME = shopMod.homeBlock();
tokens.SHOP_LABEL = shopMod.live ? 'Shop' : 'Shop (coming soon)';
tokens.SHOP_STATUS = shopMod.live
  ? 'open. Buying merchandise is not a donation; every product page shows where the money goes. See the <a class="text-link" href="/shop.html">shop</a>.'
  : 'not open. Nothing is on sale. See the <a class="text-link" href="/shop.html">planned range</a>.';
const fill = (s, extra = {}) =>
  s.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in extra ? extra[k] : k in tokens ? tokens[k] : m));

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

const textExt = new Set(['.html', '.xml', '.txt', '.json', '.js', '.css', '.svg']);
const layout = fs.readFileSync(path.join(src, 'layout.html'), 'utf8');
const header = fs.readFileSync(path.join(src, 'partials/header.html'), 'utf8');
const footer = fs.readFileSync(path.join(src, 'partials/footer.html'), 'utf8');
const pages = [];

// Structured data. No charity number, legal name or registration claim is included while registration is pending.
function jsonLd(out, title, crumbs) {
  const url = (p) => `${cfg.siteUrl}/${p}`;
  const graph = [
    { '@type': 'Organization', '@id': `${cfg.siteUrl}/#organization`, name: cfg.siteName, url: `${cfg.siteUrl}/`, logo: url('assets/logo.svg'), email: cfg.contactEmail,
      description: registered ? 'RallyGood funds practical essentials through verified partners and publishes proof of what was delivered.' : 'RallyGood is a charity in development that plans to fund practical essentials through verified partners and publish proof of what was delivered.' },
    { '@type': 'WebSite', '@id': `${cfg.siteUrl}/#website`, url: `${cfg.siteUrl}/`, name: cfg.siteName, inLanguage: 'en-GB', publisher: { '@id': `${cfg.siteUrl}/#organization` } },
  ];
  if (crumbs.length > 1) graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: p === '' ? `${cfg.siteUrl}/` : url(p) })) });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

function writePage(out, meta, content, navPath = out) {
  const hdr = header.replace(new RegExp(`(href="/${navPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")`), '$1 aria-current="page"');
  const html = fill(layout, {
    TITLE: meta.title === 'RallyGood' ? 'RallyGood – Small appeals. Real essentials. Clear proof.' : `${meta.title} – RallyGood`,
    DESCRIPTION: meta.description,
    PATH: out === 'index.html' ? '' : out,
    ROBOTS: meta.robots || 'index,follow',
    BODYCLASS: meta.bodyclass || '',
    HEADER: hdr,
    FOOTER: footer,
    CONTENT: content,
    OG_IMAGE: `${cfg.siteUrl}/${meta.image || 'assets/social-card.png'}`,
    OG_IMAGE_W: String(meta.image ? imageSize(path.join(src, meta.image))[0] : CARD_W),
    OG_IMAGE_H: String(meta.image ? imageSize(path.join(src, meta.image))[1] : CARD_H),
    OG_IMAGE_ALT: esc(meta.imageAlt || 'RallyGood: Small appeals. Real essentials. Clear proof.'),
    JSONLD: jsonLd(out, meta.title, out === 'index.html' || out === '404.html' ? [['Home', '']] : out.startsWith('shop/') ? [['Home', ''], ['Shop', 'shop.html'], [meta.title, out]] : [['Home', ''], [meta.title, out]]),
  });
  fs.mkdirSync(path.dirname(path.join(dist, out)), { recursive: true });
  fs.writeFileSync(path.join(dist, out), fill(html));
  if ((meta.robots || '').startsWith('noindex') === false) pages.push(out);
}

for (const e of fs.readdirSync(src, { withFileTypes: true })) {
  const p = path.join(src, e.name);
  if (e.name === 'layout.html' || e.name === 'partials') continue;
  if (e.isDirectory()) { copyDir(p, path.join(dist, e.name)); continue; }
  const ext = path.extname(e.name);
  if (ext === '.page') {
    const raw = fs.readFileSync(p, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) throw new Error(`${e.name}: missing front matter`);
    const meta = Object.fromEntries(m[1].split('\n').map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
    writePage(e.name.replace(/\.page$/, '.html'), meta, m[2]);
  } else if (textExt.has(ext)) {
    fs.writeFileSync(path.join(dist, e.name), fill(fs.readFileSync(p, 'utf8')));
  } else {
    fs.copyFileSync(p, path.join(dist, e.name));
  }
}

// Shop pages (generated from config/shop.json)
writePage('shop.html', {
  title: shopMod.live ? 'Shop' : 'Shop (coming soon)',
  description: shopMod.live
    ? 'RallyGood merchandise, with the costs and what is left for our charitable work shown on every product page.'
    : 'RallyGood merchandise is being set up and is not on sale yet. See the planned range and what we will disclose about where the money goes.',
}, shopMod.indexContent());
for (const prod of shopMod.shop.products) {
  writePage(`shop/${prod.slug}.html`, {
    title: prod.name,
    description: `${prod.blurb}${shopMod.live ? '' : ' Not on sale yet: sample details.'}`,
    robots: shopMod.live ? 'index,follow' : 'noindex,follow',
  }, shopMod.productContent(prod), 'shop.html');
}

// sitemap from built pages
const urls = pages.map((f) => `  <url><loc>${cfg.siteUrl}/${f === 'index.html' ? '' : f}</loc></url>`).join('\n');
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

// Safety gate: the placeholder number must never reach the public output while pending.
if (!registered) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(dist)) {
    if (!textExt.has(path.extname(f))) continue;
    if (fs.readFileSync(f, 'utf8').includes(cfg.charityNumber)) throw new Error(`Charity number placeholder leaked into ${f}`);
  }
}
console.log(`Built ${pages.length} pages to dist/ (registration: ${cfg.registrationStatus})`);
