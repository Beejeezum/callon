from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT/'standalone.html').read_text()
ROUTES = [
    '#/home', '#/asks', '#/create', '#/draft', '#/share',
    '#/ask/ladder?visitor=1', '#/ask/birthday?visitor=1', '#/ask/garden?visitor=1', '#/ask/sprinkler?visitor=1',
    '#/contribute/ladder', '#/offer-details/ladder', '#/verify/ladder', '#/offer-sent/ladder',
    '#/status/birthday', '#/owner/offers', '#/plan/ladder', '#/messages/ladder', '#/handoff/ladder',
    '#/loan/ladder', '#/extension/ladder', '#/return/ladder', '#/save-resource', '#/complete',
    '#/mine', '#/hints', '#/incident', '#/circle', '#/circle/rules', '#/settings', '#/admin'
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors=[]
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    page.set_content(HTML)
    failures=[]
    for route in ROUTES:
        page.evaluate('r => location.hash = r', route)
        page.wait_for_timeout(60)
        heading = page.locator('h1').first
        if heading.count() == 0 or not heading.inner_text().strip():
            failures.append((route, 'missing h1'))
        overflow = page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
        if overflow:
            failures.append((route, f'horizontal overflow {page.evaluate("document.documentElement.scrollWidth")}'))
        tiny = page.evaluate('''() => [...document.querySelectorAll('button')].filter(b => {
            const r=b.getBoundingClientRect();
            const s=getComputedStyle(b);
            return s.display !== 'none' && r.width > 0 && r.height > 0 && r.height < 39;
        }).map(b => ({text:(b.innerText||b.getAttribute('aria-label')||'').trim(), h:b.getBoundingClientRect().height}))''')
        if tiny:
            failures.append((route, f'small buttons: {tiny[:3]}'))
    print('ROUTES', len(ROUTES))
    print('FAILURES', failures)
    print('ERRORS', errors)
    browser.close()
    if failures or errors:
        raise SystemExit(1)
