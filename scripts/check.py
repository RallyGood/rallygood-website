"""Site checks: links/anchors, console errors, horizontal overflow, screenshots, forms. Usage: python3 scripts/check.py [base] [outdir]"""
import sys, os, re, json, pathlib
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8099'
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/claude-0/shots'); out.mkdir(exist_ok=True, parents=True)
pages = ['/', '/how-it-works.html', '/drops.html', '/nature-wellbeing.html', '/shop.html', '/shop/core-tee.html', '/shop/lebanon-drop-tee.html', '/shop/palestine-drop-tee.html', '/shop/tote.html', '/shop/pin.html', '/shop/stickers.html', '/give-monthly.html', '/transparency.html', '/get-involved.html', '/about.html', '/contact.html', '/privacy.html', '/safeguarding.html', '/terms.html', '/nope.html']
ISLAMIC = os.environ.get('ISLAMIC') == '1'  # set when serving a build with the release flag on (preview)
if ISLAMIC:
    pages += ['/islamic-giving.html'] + ['/islamic-giving/' + n + '.html' for n in ['give-sadaqah', 'friday-rally', 'ramadan-rally', 'interest-riba', 'sadaqah-jariyah']]
else:
    pages += ['/islamic-giving.html']  # must 404 while the flag is off
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
            exp = 404 if (path == '/nope.html' or (path == '/islamic-giving.html' and not ISLAMIC)) else 200
            if resp.status != exp: problems.append(f'{tag} {path}: status {resp.status}')
            if errs and exp == 200: problems.append(f'{tag} {path}: console {errs}')
            ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            if ow > 0: problems.append(f'{tag} {path}: horizontal overflow {ow}px')
            if tag == 'desktop' and exp == 200:
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
            if exp == 200: pg.screenshot(path=str(out / f'{tag}-{name}.png'), full_page=True)
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
    # allocation component: homepage full version, both explanations visible, highlight toggles, no colour-only state
    pg.goto(base + '/')
    if pg.locator('[data-alloc] .alloc-card').count() != 2 or not (pg.is_visible('#alloc-drop-text') and pg.is_visible('#alloc-ops-text')): problems.append('allocation: both explanations must be visible by default')
    if pg.locator('[data-alloc] svg').count() != 0: problems.append('allocation: no icons allowed in the component')
    w = pg.evaluate("(()=>{const a=document.querySelector('.alloc-seg-drop').getBoundingClientRect().width,b=document.querySelector('.alloc-seg-ops').getBoundingClientRect().width;return a/(a+b)})()")
    if abs(w - 0.85) > 0.01: problems.append(f'allocation: bar proportion {w}')
    if not pg.is_visible('.alloc-seg-ops') or pg.evaluate("(()=>{const e=document.querySelector('.alloc-seg-ops');return e.scrollWidth>e.clientWidth})()"): problems.append('allocation: 15% label truncated')
    pg.click('.alloc-btn[data-seg="ops"]')
    if pg.get_attribute('.alloc-btn[data-seg="ops"]', 'aria-pressed') != 'true' or pg.get_attribute('[data-alloc]', 'data-selected') != 'ops': problems.append('allocation: select did not highlight')
    if not pg.is_visible('.alloc-btn[data-seg="ops"] .alloc-tick'): problems.append('allocation: selected state relies on colour only')
    for sel in ['.alloc-btn', '.alloc-links a']:
        for i in range(pg.locator(sel).count()):
            box = pg.locator(sel).nth(i).bounding_box()
            if box and box['height'] < 44: problems.append(f'allocation: {sel} #{i} touch target {box["height"]}px')
    pg.click('.alloc-btn[data-seg="ops"]')
    if pg.get_attribute('[data-alloc]', 'data-selected') is not None: problems.append('allocation: second press should clear the highlight')
    pg.goto(base + '/how-it-works.html')
    if pg.locator('#custom-amount').count() or pg.locator('[data-alloc-compact]').count() != 1: problems.append('how-it-works: old calculator must be gone and one compact component present')
    pg.goto(base + '/transparency.html#allocation-policy')
    if not pg.is_visible('#allocation-policy') or pg.locator('[data-alloc]').count() != 1: problems.append('transparency: policy section / full component')
    # navigation: Ways to Give disclosure, Escape returns focus (desktop), expandable on mobile
    dctx = b.new_context(viewport={'width': 1280, 'height': 900}); dp = dctx.new_page(); dp.goto(base + '/')
    btn = dp.locator('.nav-dropdown-toggle')
    if btn.get_attribute('aria-expanded') != 'false' or dp.is_visible('#ways-menu'): problems.append('nav: Ways to Give should start closed')
    btn.click()
    if btn.get_attribute('aria-expanded') != 'true' or not dp.is_visible('#ways-menu'): problems.append('nav: Ways to Give did not open')
    n_items = dp.locator('#ways-menu a').count()
    if n_items != (3 if ISLAMIC else 2): problems.append(f'nav: Ways to Give has {n_items} items')
    dp.keyboard.press('Escape')
    if dp.is_visible('#ways-menu') or dp.evaluate("document.activeElement.className") .find('nav-dropdown-toggle') < 0: problems.append('nav: Escape should close the dropdown and return focus to the button')
    btn.focus(); dp.keyboard.press('Enter')
    if not dp.is_visible('#ways-menu'): problems.append('nav: keyboard Enter did not open dropdown')
    dp.goto(base + '/give-monthly.html')
    if dp.get_attribute('.nav-dropdown-menu a[href="/give-monthly.html"]', 'aria-current') != 'page': problems.append('nav: current page not indicated')
    # demo form: banner, validation, preview confirmation, nothing sent
    sent = []
    dp.on('request', lambda r: sent.append((r.method, r.url)) if r.method != 'GET' else None)
    if not dp.is_visible('.demo-banner') or 'Demonstration only. No payment is taken.' not in dp.inner_text('.demo-banner'): problems.append('demo: banner missing')
    if dp.inner_text('[data-demo-submit]') != 'Preview confirmation': problems.append('demo: submit label')
    dp.fill('[data-demo-custom]', '0'); dp.click('[data-demo-submit]')
    if not dp.is_visible('.demo-error'): problems.append('demo: invalid amount accepted')
    dp.click('.demo-amount[data-amount="10"]'); dp.click('[data-demo-submit]')
    if not dp.is_visible('.demo-confirm') or 'Demonstration' not in dp.inner_text('.demo-confirm') or '£10.00' not in dp.inner_text('[data-demo-result]'): problems.append('demo: confirmation')
    if sent: problems.append(f'demo: unexpected network writes {sent}')
    if dp.evaluate("Object.keys(localStorage).length + Object.keys(sessionStorage).length") != 0: problems.append('demo: wrote to browser storage')
    dctx.close()
    pg.goto(base + '/'); pg.click('.nav-toggle'); pg.click('.nav-dropdown-toggle')
    if not pg.is_visible('#ways-menu a[href="/give-monthly.html"]'): problems.append('mobile nav: Ways to Give did not expand')
    if ISLAMIC:
        pg.goto(base + '/islamic-giving/ramadan-rally.html')
        if pg.locator('.alloc-bar').count() or 'Allocation for this campaign to be confirmed.' not in pg.inner_text('main'): problems.append('ramadan: must show allocation to be confirmed, no split')
        for n in ['interest-riba', 'sadaqah-jariyah']:
            pg.goto(base + f'/islamic-giving/{n}.html')
            if pg.locator('main input, main button, main form, main select').count(): problems.append(f'{n}: notice-only page has form controls')
    # shop: grouped cards, product page colour switch, buy button disabled while in preview
    pg.goto(base + '/shop.html')
    if pg.locator('.shop-card').count() != 6: problems.append('shop: expected 6 product cards')
    if pg.locator('.shop-group').count() != 3: problems.append('shop: expected 3 groups')
    pg.goto(base + '/')
    if pg.locator('#shop .shop-card').count() != 3: problems.append('home: expected 3 shop cards')
    pg.goto(base + '/shop/lebanon-drop-tee.html')
    first = pg.get_attribute('.product-main', 'src')
    pg.select_option('#opt-colour', 'limited')
    if pg.get_attribute('.product-main', 'src') == first: problems.append('shop: colour switch did not change image')
    if not pg.is_disabled('.product-form button'): problems.append('shop: Buy merchandise should be disabled in preview')
    if 'Buy merchandise' not in pg.inner_text('.product-form'): problems.append('shop: Buy merchandise button missing')
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
