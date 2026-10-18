"""Consent matrix test for the GA4 loader. Intercepts Google hosts (never reaches the real network) and records attempts.
Usage: python3 scripts/consent-test.py [base]   (serve dist/ first)"""
import sys, re, json
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8099'
ID = json.load(open('config/site.config.json'))['ga4MeasurementId']
G = re.compile(r'https://([^/]*\.)?(googletagmanager\.com|google-analytics\.com|google\.com)/')
results, problems = [], []

def check(name, ok, detail=''):
    results.append((name, ok, detail))
    if not ok: problems.append(f'{name} {detail}')

def new_ctx(b):
    ctx = b.new_context(viewport={'width': 1280, 'height': 900}); hits = []
    def h(route):
        hits.append(route.request.url)
        route.fulfill(status=200, content_type='application/javascript', body='/* stub */')
    ctx.route(G, h)
    # beehiiv iframe is irrelevant here and unreachable in the sandbox
    ctx.route(re.compile(r'https://subscribe-forms\.beehiiv\.com/.*'), lambda r: r.fulfill(status=200, content_type='text/html', body='<html></html>'))
    return ctx, hits

def dl(pg): return pg.evaluate('JSON.stringify(window.dataLayer.map(a=>Array.prototype.slice.call(a)))')
def visible(pg): return pg.is_visible('#consent-banner')

with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox'])

    # 1. Before any choice
    ctx, hits = new_ctx(b); pg = ctx.new_page(); pg.goto(base + '/', wait_until='networkidle'); pg.wait_for_timeout(500)
    check('before choice: banner shown', visible(pg))
    check('before choice: no Google request', not hits, str(hits))
    d = json.loads(dl(pg))
    check('before choice: consent default denies all four signals', any(x[0:2] == ['consent', 'default'] and all(x[2][k] == 'denied' for k in ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) for x in d), str(d))
    check('before choice: no config command queued', not any(x[0] == 'config' for x in d))
    check('before choice: no GA cookies', 'ga' not in pg.evaluate('document.cookie').lower())
    check('before choice: both buttons present', pg.locator('#consent-banner .consent-btn').count() == 2)
    pg.evaluate("window.rgTrack && window.rgTrack('x')"); check('before choice: rgTrack sends nothing', 'event' not in dl(pg))
    # navigate without choosing: still no request
    pg.goto(base + '/about.html', wait_until='networkidle'); pg.wait_for_timeout(300)
    check('navigate without choice: still no request', not hits, str(hits))

    # 2. Reject
    pg.goto(base + '/', wait_until='networkidle'); pg.click('[data-choice=reject]'); pg.wait_for_timeout(400)
    check('reject: banner hidden', not visible(pg)); check('reject: no Google request', not hits, str(hits))
    check('reject: choice stored false', json.loads(pg.evaluate("localStorage.getItem('rg_consent_v1')"))['analytics'] is False)
    pg.goto(base + '/drops.html', wait_until='networkidle'); pg.wait_for_timeout(300)
    check('returning (rejected): no banner, no request', (not visible(pg)) and not hits, str(hits))
    ctx.close()

    # 3. Accept
    ctx, hits = new_ctx(b); pg = ctx.new_page(); pg.goto(base + '/', wait_until='networkidle'); pg.click('[data-choice=accept]'); pg.wait_for_timeout(800)
    check('accept: gtag.js requested with measurement ID', any('googletagmanager.com/gtag/js' in u and ID in u for u in hits), str(hits))
    d = json.loads(dl(pg))
    upd = [x for x in d if x[0:2] == ['consent', 'update']]
    check('accept: only analytics_storage granted', len(upd) == 1 and upd[0][2] == {'analytics_storage': 'granted'}, str(upd))
    cfg = [x for x in d if x[0] == 'config']
    check('accept: config disables Google signals and ad personalisation', len(cfg) == 1 and cfg[0][2].get('allow_google_signals') is False and cfg[0][2].get('allow_ad_personalization_signals') is False, str(cfg))
    order = [x[0] + ':' + (x[1] if x[0] == 'consent' else '') for x in d]
    check('accept: default precedes update and config', order.index('consent:default') < order.index('consent:update') < order.index('config:'), str(order))
    pg.evaluate("window.rgTrack('launch_updates_click', {source_page:'/'})"); check('accept: rgTrack sends event', 'launch_updates_click' in dl(pg))
    # returning visitor navigates
    n = len(hits); pg.goto(base + '/how-it-works.html', wait_until='networkidle'); pg.wait_for_timeout(600)
    check('returning (accepted): no banner, tag loads again', (not visible(pg)) and len(hits) > n, str(hits))

    # 4. Withdrawal via footer link
    pg.evaluate("document.cookie='_ga=GA1.1.1.1; path=/'; document.cookie='_ga_WQH6PTFD4X=GS1.1.1; path=/'")
    pg.click('[data-consent-open]'); check('withdraw: footer link reopens banner', visible(pg))
    check('withdraw: banner shows current state', 'accepted' in pg.inner_text('#consent-state'))
    check('withdraw: focus moves to banner heading', pg.evaluate("document.activeElement.id") == 'consent-title')
    pg.click('[data-choice=reject]'); pg.wait_for_timeout(300)
    check('withdraw: _ga cookies cleared', '_ga' not in pg.evaluate('document.cookie'), pg.evaluate('document.cookie'))
    check('withdraw: ga-disable flag set', pg.evaluate(f"window['ga-disable-{ID}']") is True)
    check('withdraw: stored choice false', json.loads(pg.evaluate("localStorage.getItem('rg_consent_v1')"))['analytics'] is False)
    check('withdraw: focus returned to footer link', pg.evaluate("document.activeElement.hasAttribute('data-consent-open')"))
    n = len(hits); pg.goto(base + '/about.html', wait_until='networkidle'); pg.wait_for_timeout(500)
    check('after withdrawal: next page makes no Google request', len(hits) == n, str(hits[n:]))
    ctx.close()

    # 5. Expired choice shows banner again
    ctx, hits = new_ctx(b); pg = ctx.new_page(); pg.goto(base + '/', wait_until='networkidle')
    pg.evaluate("localStorage.setItem('rg_consent_v1', JSON.stringify({analytics:true, exp: Date.now()-1000, v:1}))")
    pg.goto(base + '/', wait_until='networkidle'); pg.wait_for_timeout(300)
    check('expired choice: banner shown, no request', visible(pg) and not hits, str(hits)); ctx.close()

    # 6. Keyboard: banner buttons reachable and operable
    ctx, hits = new_ctx(b); pg = ctx.new_page(); pg.goto(base + '/', wait_until='networkidle')
    pg.focus('[data-choice=reject]'); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    check('keyboard: Enter on No thanks works', not visible(pg) and not hits); ctx.close()

    # 7. Privacy page and footer link present
    ctx, hits = new_ctx(b); pg = ctx.new_page(); pg.goto(base + '/privacy.html', wait_until='networkidle')
    t = pg.inner_text('main'); check('privacy page names Google Analytics and the choice', 'Google Analytics 4' in t and 'Cookie preferences' in t)
    check('footer has Cookie preferences control on privacy page', pg.locator('[data-consent-open]').count() == 1); ctx.close()
    b.close()

for n, ok, d in results: print(('PASS ' if ok else 'FAIL ') + n + ('' if ok else '  -> ' + d))
print(f'{sum(1 for r in results if r[1])}/{len(results)} passed')
sys.exit(1 if problems else 0)
