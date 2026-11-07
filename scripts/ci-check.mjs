// Dependency-free site checks. Run after `node scripts/build.mjs`.
// Usage: node scripts/ci-check.mjs   (exit 1 on any failure)
import fs from 'node:fs';
import path from 'node:path';

const preview = process.env.PREVIEW === '1';
const dist = process.env.DIST_DIR || (preview ? 'dist-preview' : 'dist');
const cfg = JSON.parse(fs.readFileSync('config/site.config.json', 'utf8'));
const pending = cfg.registrationStatus !== 'registered';
const fails = [];
const fail = (m) => fails.push(m);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const exists = (p) => fs.existsSync(p) || fs.existsSync(p + '.html') || fs.existsSync(path.join(p, 'index.html'));

for (const f of htmlFiles) {
  const h = fs.readFileSync(f, 'utf8');
  const rel = path.relative(dist, f);
  const noindex = /<meta[^>]+name="robots"[^>]+noindex/i.test(h);
  if (!/<title>[^<]+<\/title>/.test(h)) fail(`${rel}: missing <title>`);
  if (!/<meta[^>]+name="description"[^>]+content="[^"]+"/.test(h)) fail(`${rel}: missing meta description`);
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) fail(`${rel}: expected exactly one <h1>`);
  if (preview && !noindex) fail(`${rel}: preview pages must be noindex`);
  if (!preview && !noindex && !/<link[^>]+rel="canonical"/.test(h)) fail(`${rel}: missing canonical`);
  // no Google script loaded directly in markup (must be injected only after consent)
  if (/<script[^>]+src="[^"]*(googletagmanager|google-analytics)/i.test(h)) fail(`${rel}: Google script tag in markup (must load only after consent)`);
  // internal links resolve
  for (const m of h.matchAll(/\s(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(u)) continue;
    const target = u.startsWith('/') ? path.join(dist, u) : path.join(path.dirname(f), u);
    if (!exists(target)) fail(`${rel}: broken link/asset ${u}`);
  }
}

// sitemap lists only indexable pages that exist
const sm = path.join(dist, 'sitemap.xml');
if (preview) { if (fs.existsSync(sm)) fail('preview build must not publish a sitemap'); }
else if (fs.existsSync(sm)) {
  for (const m of fs.readFileSync(sm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const p = new URL(m[1]).pathname;
    const t = path.join(dist, p === '/' ? 'index.html' : p);
    if (!fs.existsSync(t)) { fail(`sitemap: ${m[1]} does not exist`); continue; }
    if (/noindex/i.test(fs.readFileSync(t, 'utf8').match(/<meta[^>]+name="robots"[^>]*>/i)?.[0] || '')) fail(`sitemap: ${m[1]} is noindex`);
  }
} else fail('sitemap.xml missing');

// pre-launch disclosures must stay while registration is pending
if (pending) {
  const need = { 'give-monthly.html': [/not accepting donations/i, /demonstration/i], 'transparency.html': [/pending/i, /not being accepted|not accepting/i], 'drops.html': [/no donations are being taken|illustrative/i], 'get-involved.html': [/not (yet )?accepting donations/i], 'about.html': [/registration is pending/i] };
  for (const [page, res] of Object.entries(need)) {
    const f = path.join(dist, page);
    if (!fs.existsSync(f)) { fail(`${page}: missing`); continue; }
    const text = fs.readFileSync(f, 'utf8');
    for (const re of res) if (!re.test(text)) fail(`${page}: pre-launch disclosure ${re} not found`);
  }
  for (const f of htmlFiles) {
    const text = fs.readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' ');
    if (/\bregistered (UK )?charity\b/i.test(text) && !/not (yet )?(a )?registered charity|until registration|registered charity\W+(number|status)/i.test(text)) {
      fail(`${path.relative(dist, f)}: "registered charity" appears while registration is pending; review wording`);
    }
    if (/charity (no\.?|number)\W*\d{5,}/i.test(text)) fail(`${path.relative(dist, f)}: a charity number appears while pending`);
  }
}

// ---------- Site-wide: long dashes, zakat, old allocation wording ----------
const textExt = new Set(['.html', '.xml', '.txt', '.json', '.js', '.css', '.svg']);
const textFiles = files.filter((f) => textExt.has(path.extname(f)));
const dashRe = new RegExp('[\\u2012-\\u2015]|&mdash;|&ndash;|&horbar;|&#0*(8210|8211|8212|8213);|&#x0*201[2-5];|\\\\u201[2-5]', 'i');
for (const f of textFiles) {
  const t = fs.readFileSync(f, 'utf8');
  const m = t.match(dashRe);
  if (m) fail(`${path.relative(dist, f)}: long dash found (${JSON.stringify(m[0])}). Use a full stop, comma, colon, brackets or a hyphen`);
  if (/zakat|zakah|zak\u0101t/i.test(t)) fail(`${path.relative(dist, f)}: zakat is outside this build and must not appear`);
}
const canonical15 = JSON.parse(fs.readFileSync('config/content.json', 'utf8')).allocation.canonical15;
const oldWording = [/payment processing, partner verification/i, /operating and transparency costs/i, /Fund the 15%/, /Making your help happen/, /custom-amount/, /data-split/, /more of every gift reaches the Drop/i, /Operating support/];
for (const f of htmlFiles) {
  const t = fs.readFileSync(f, 'utf8');
  const rel = path.relative(dist, f);
  for (const re of oldWording) if (re.test(t)) fail(`${rel}: old allocation wording ${re} still present`);
  if (/<[^>]+class="alloc-card[^"]*alloc-card-ops"[^>]*>[\s\S]*?<\/div>/.test(t) && !t.includes(canonical15)) fail(`${rel}: allocation component present without the canonical 15% text`);
  if (/class="alloc-bar"/.test(t)) {
    const bars = (t.match(/class="alloc-bar"/g) || []).length;
    if (bars !== 1) fail(`${rel}: expected exactly one allocation bar, found ${bars}`);
    if (!/flex-basis:85%/.test(t) || !/flex-basis:15%/.test(t)) fail(`${rel}: allocation bar is not 85/15`);
  }
  if (/alloc-ops/.test(t) && /class="alloc-card-ops"[\s\S]{0,400}<(svg|ul|h[2-6])/.test(t)) fail(`${rel}: 15p panel must have no icons, lists or sub-headings`);
}
for (const [page, needAlloc] of [['index.html', true], ['transparency.html', true]]) {
  const f = path.join(dist, page);
  if (!fs.existsSync(f)) continue;
  const t = fs.readFileSync(f, 'utf8');
  if (needAlloc && !/data-alloc>/.test(t)) fail(`${page}: full allocation component missing`);
}
{
  const tp = path.join(dist, 'transparency.html');
  if (fs.existsSync(tp)) {
    const t = fs.readFileSync(tp, 'utf8');
    if (!/id="allocation-policy"/.test(t)) fail('transparency.html: #allocation-policy section missing');
  }
  // every allocation policy link must resolve to that anchor
  for (const f of htmlFiles) {
    const t = fs.readFileSync(f, 'utf8');
    for (const m of t.matchAll(/href="([^"]*)"[^>]*>\s*Read our allocation policy/g)) if (!/transparency\.html#allocation-policy$/.test(m[1])) fail(`${path.relative(dist, f)}: allocation policy link points to ${m[1]}`);
  }
}

// ---------- Islamic Giving release flag: both states ----------
{
  const hubExists = fs.existsSync(path.join(dist, 'islamic-giving.html'));
  const flag = JSON.parse(fs.readFileSync('config/content.json', 'utf8')).islamicGivingReleased;
  const expected = preview && (process.env.ISLAMIC_GIVING_RELEASED === 'true' || process.env.ISLAMIC_GIVING_RELEASED === 'false') ? process.env.ISLAMIC_GIVING_RELEASED === 'true' : flag;
  if (hubExists !== expected) fail(`release flag is ${expected} but the hub ${hubExists ? 'exists' : 'is missing'}`);
  const hiddenRe = /islamic|sadaqah|friday rally|ramadan|\briba\b|kaffarah/i;
  for (const f of htmlFiles) {
    const t = fs.readFileSync(f, 'utf8');
    const rel = path.relative(dist, f);
    const ways = (t.match(/id="ways-menu">([\s\S]*?)<\/ul>/) || [])[1] || '';
    const items = (ways.match(/<li>/g) || []).length;
    if (items !== (expected ? 3 : 2)) fail(`${rel}: Ways to Give has ${items} items, expected ${expected ? 3 : 2}`);
  }
  if (!expected) {
    for (const f of textFiles) if (hiddenRe.test(fs.readFileSync(f, 'utf8'))) fail(`${path.relative(dist, f)}: mentions Islamic Giving content while the release flag is false`);
    if (fs.existsSync(path.join(dist, 'islamic-giving'))) fail('islamic-giving/ folder exists while the release flag is false');
  } else {
    const kids = ['give-sadaqah', 'friday-rally', 'ramadan-rally', 'interest-riba', 'sadaqah-jariyah'];
    for (const k of kids) if (!fs.existsSync(path.join(dist, 'islamic-giving', k + '.html'))) fail(`islamic-giving/${k}.html missing`);
    for (const k of ['interest-riba', 'sadaqah-jariyah']) {
      const p2 = path.join(dist, 'islamic-giving', k + '.html');
      if (!fs.existsSync(p2)) continue;
      const main = (fs.readFileSync(p2, 'utf8').match(/<main[\s\S]*<\/main>/) || [''])[0];
      if (/<(form|input|select|textarea|button)\b/i.test(main)) fail(`${k}: notice-only page must have no form controls`);
    }
    if (/kaffarah/i.test(textFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n'))) fail('Kaffarah must be absent');
    for (const f of htmlFiles) {
      const t = fs.readFileSync(f, 'utf8');
      const rel = path.relative(dist, f);
      for (const m of t.matchAll(/<div class="demo-form"[\s\S]*?data-demo-submit>([^<]*)</g)) {
        if (m[1] !== 'Preview confirmation') fail(`${rel}: demo submit button must read "Preview confirmation"`);
      }
      if (/data-demo=/.test(t) && !/Demonstration only\. No payment is taken\./.test(t)) fail(`${rel}: demo form missing the demonstration banner`);
      if (/data-demo=/.test(t) && /<form\b/i.test(t.replace(/<footer[\s\S]*<\/footer>/, ''))) fail(`${rel}: demo pages must not contain a <form>`);
      if (/>\s*Donate\s*</i.test(t)) fail(`${rel}: a button or link reads "Donate"`);
    }
    const rr = path.join(dist, 'islamic-giving', 'ramadan-rally.html');
    if (fs.existsSync(rr) && /class="alloc-bar"/.test(fs.readFileSync(rr, 'utf8'))) fail('ramadan-rally: must not show a split until trustees confirm it');
  }
}

if (fails.length) { console.error(fails.map((m) => 'FAIL ' + m).join('\n')); console.error(`${fails.length} problem(s)`); process.exit(1); }
console.log(`ci-check: ${htmlFiles.length} pages OK`);
