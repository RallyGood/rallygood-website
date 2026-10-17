// Dependency-free site checks. Run after `node scripts/build.mjs`.
// Usage: node scripts/ci-check.mjs   (exit 1 on any failure)
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
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
  if (!noindex && !/<link[^>]+rel="canonical"/.test(h)) fail(`${rel}: missing canonical`);
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
if (fs.existsSync(sm)) {
  for (const m of fs.readFileSync(sm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const p = new URL(m[1]).pathname;
    const t = path.join(dist, p === '/' ? 'index.html' : p);
    if (!fs.existsSync(t)) { fail(`sitemap: ${m[1]} does not exist`); continue; }
    if (/noindex/i.test(fs.readFileSync(t, 'utf8').match(/<meta[^>]+name="robots"[^>]*>/i)?.[0] || '')) fail(`sitemap: ${m[1]} is noindex`);
  }
} else fail('sitemap.xml missing');

// pre-launch disclosures must stay while registration is pending
if (pending) {
  const need = { 'transparency.html': [/pending/i, /not being accepted|not accepting/i], 'drops.html': [/no donations are being taken|illustrative/i], 'get-involved.html': [/not (yet )?accepting donations/i], 'about.html': [/registration is pending/i] };
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

if (fails.length) { console.error(fails.map((m) => 'FAIL ' + m).join('\n')); console.error(`${fails.length} problem(s)`); process.exit(1); }
console.log(`ci-check: ${htmlFiles.length} pages OK`);
