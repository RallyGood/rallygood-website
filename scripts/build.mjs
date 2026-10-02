// Static site builder: src/ -> dist/. No dependencies (Node 18+).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/site.config.json'), 'utf8'));
const registered = cfg.registrationStatus === 'registered';

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
  FOOTNOTE: registered
    ? 'Any Drops shown on this site are illustrative examples unless marked as live.'
    : 'RallyGood is not yet registered with the Charity Commission and is not accepting donations. Any Drops shown on this site are illustrative examples.',
  YEAR: String(new Date().getFullYear()),
};
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
    const out = e.name.replace(/\.page$/, '.html');
    const hdr = header.replace(new RegExp(`(href="/${out}")`), '$1 aria-current="page"');
    const html = fill(layout, {
      TITLE: meta.title === 'RallyGood' ? 'RallyGood – Small appeals. Real essentials. Clear proof.' : `${meta.title} – RallyGood`,
      DESCRIPTION: meta.description,
      PATH: out === 'index.html' ? '' : out,
      ROBOTS: meta.robots || 'index,follow',
      BODYCLASS: meta.bodyclass || '',
      HEADER: hdr,
      FOOTER: footer,
      CONTENT: m[2],
    });
    fs.writeFileSync(path.join(dist, out), fill(html));
    if ((meta.robots || '').startsWith('noindex') === false) pages.push(out);
  } else if (textExt.has(ext)) {
    fs.writeFileSync(path.join(dist, e.name), fill(fs.readFileSync(p, 'utf8')));
  } else {
    fs.copyFileSync(p, path.join(dist, e.name));
  }
}

// sitemap from built pages
const today = new Date().toISOString().slice(0, 10);
const urls = pages.map((f) => `  <url><loc>${cfg.siteUrl}/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n');
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
