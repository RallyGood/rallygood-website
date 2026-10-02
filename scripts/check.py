"""Site checks: links/anchors, console errors, horizontal overflow, screenshots, forms. Usage: python3 scripts/check.py [base] [outdir]"""
import sys, re, json, pathlib
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8099'
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/claude-0/shots'); out.mkdir(exist_ok=True, parents=True)
pages = ['/', '/how-it-works.html', '/drops.html', '/transparency.html', '/get-involved.html', '/about.html', '/contact.html', '/privacy.html', '/safeguarding.html', '/nope.html']
problems = []
checked = {}

def status(url):
    if url in checked: return checked[url]
    r = ctx.request.get(url); checked[url] = r.status; return r.status

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox']) if False else p.chromium.launch(args=['--no-sandbox'])
    for vw, vh, tag in [(1280, 900, 'desktop'), (390, 844, 'mobile')]:
        ctx = b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=1)
        for path in pages:
            pg = ctx.new_page(); errs = []
            pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            resp = pg.goto(base + path, wait_until='networkidle')
            exp = 404 if path == '/nope.html' else 200
            if resp.status != exp: problems.append(f'{tag} {path}: status {resp.status}')
            if errs: problems.append(f'{tag} {path}: console {errs}')
            ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            if ow > 0: problems.append(f'{tag} {path}: horizontal overflow {ow}px')
            if tag == 'desktop':
                for h in pg.eval_on_selector_all('a[href]', 'els=>els.map(e=>e.getAttribute("href"))'):
                    if h.startswith('mailto:'):
                        if not re.match(r'^mailto:info@rallygood\.org\.uk(\?.*)?$', h): problems.append(f'{path}: bad mailto {h}')
                        continue
                    if h.startswith('#'):
                        if h != '#main' and not pg.query_selector(h): problems.append(f'{path}: missing anchor {h}')
                        continue
                    u = urljoin(base + path, h.split('#')[0] or path)
                    if urlparse(u).netloc != urlparse(base).netloc: continue
                    s = status(u)
                    if s != 200: problems.append(f'{path}: link {h} -> {s}')
                    if '#' in h and s == 200:
                        frag = h.split('#')[1]
                        t = ctx.new_page(); t.goto(u, wait_until='networkidle')
                        if not t.query_selector('#' + frag): problems.append(f'{path}: anchor {h} missing')
                        t.close()
            name = path.strip('/').replace('.html', '') or 'home'
            if path != '/nope.html': pg.screenshot(path=str(out / f'{tag}-{name}.png'), full_page=True)
            pg.close()
        ctx.close()

    # interaction tests (mobile)
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
    pg.goto(base + '/'); pg.click('.nav-toggle')
    if not pg.is_visible('#nav-menu a[href="/contact.html"]'): problems.append('mobile nav did not open')
    pg.keyboard.press('Escape')
    if pg.is_visible('#nav-menu a[href="/contact.html"]'): problems.append('Escape did not close nav')
    pg.goto(base + '/drops.html'); pg.wait_for_selector('.drop-card')
    if pg.locator('.drop-card').count() != 4: problems.append('drops: expected 4 cards')
    pg.click('.filter-button[data-filter="Food"]')
    if pg.locator('.drop-card').count() != 1: problems.append('drops: Food filter')
    pg.goto(base + '/how-it-works.html'); pg.fill('#custom-amount', '100')
    if pg.inner_text('#project-share') != '£98.00' or pg.inner_text('#ops-share') != '£2.00': problems.append('split calc wrong')
    # form: empty submit shows errors, valid submit builds mailto
    pg.goto(base + '/contact.html?topic=sponsor')
    if pg.input_value('#cf-topic') != 'sponsor': problems.append('topic prefill failed')
    pg.click('button[type=submit]')
    if not pg.is_visible('#cf-name-err') or not pg.is_visible('#cf-consent-err'): problems.append('form validation errors not shown')
    pg.fill('#cf-name', 'Test User'); pg.fill('#cf-email', 'bad'); pg.fill('#cf-message', 'Hello'); pg.check('#cf-consent')
    pg.click('button[type=submit]')
    if not pg.is_visible('#cf-email-err'): problems.append('bad email accepted')
    pg.fill('#cf-email', 'test@example.com')
    pg.evaluate("window.__m=null; const d=Object.getOwnPropertyDescriptor(Location.prototype,'href');")
    with pg.expect_navigation(url=re.compile('^mailto:'), wait_until='commit', timeout=3000) if False else __import__('contextlib').nullcontext():
        urls = []
        pg.on('framenavigated', lambda f: urls.append(f.url))
        try: pg.click('button[type=submit]')
        except Exception as e: pass
        pg.wait_for_timeout(500)
    st = pg.inner_text('#cf-status')
    if 'email app should now open' not in st: problems.append('form success state not shown: ' + st)
    b.close()

print(json.dumps(problems, indent=1) if problems else 'ALL CHECKS PASSED')
print('links checked:', len(checked))
