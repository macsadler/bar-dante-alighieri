"""Run with Python + Playwright and installed Chrome: python3 tests/check-daily.py."""
import datetime
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENTRIES = json.loads((ROOT / 'data/daily.json').read_text())
CANTI = json.loads((ROOT / 'data/canti.json').read_text())
DATE = datetime.datetime(2026, 11, 5, 12, tzinfo=datetime.timezone.utc)
INDEX = (DATE.date() - datetime.date(1970, 1, 1)).days % len(ENTRIES)
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%s/' % server.server_port
errors = []

def open_page(browser, width=390, today=None, daily=None, summaries=None):
    context = browser.new_context(viewport={'width': width, 'height': 900}, service_workers='block')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.clock.install(time=DATE)
    page.route('**/data/today.json', lambda route: route.fulfill(json=today or {}))
    if daily is not None:
        page.route('**/data/daily.json', lambda route: route.fulfill(status=503) if daily == 'fail' else route.fulfill(json=daily))
    if summaries is not None:
        page.route('**/data/canti.json', lambda route: route.fulfill(status=503) if summaries == 'fail' else route.fulfill(body='{broken', content_type='application/json'))
    page.goto(URL, wait_until='networkidle')
    return context, page

def click(page, selector):
    page.locator(selector).evaluate('(button) => button.click()')

def check_entry(page, entry):
    assert page.locator('#verseText').text_content() == entry['verse'].replace(' / ', '\n')
    assert page.locator('#verseTrans').text_content() == entry.get('trans', '').replace(' / ', '\n')
    for lang in ['it', 'en']:
        assert page.locator('#verseGloss [lang=%s]' % lang).text_content() == entry[lang]
    assert page.locator('#deeperRef').text_content() == entry['ref']
    key = entry['ref'].split(',')[0]
    assert page.locator('#cantoSummaryIt').text_content() == CANTI[key]['it']
    assert page.locator('#cantoSummaryEn').text_content() == CANTI[key]['en']
    cantica, roman = key.split()
    values = dict(I=1,V=5,X=10,L=50)
    n = sum(-values[c] if i+1<len(roman) and values[c]<values[roman[i+1]] else values[c] for i,c in enumerate(roman))
    assert page.locator('#cantoTrack i.on').count() == 1
    assert page.locator('#cantoTrack i.on').get_attribute('data-n') == str(n)
    assert page.locator('#cantoLabel').text_content() == page.locator('#deeperCanto').text_content()
    assert page.locator('#cantoLabel').text_content() == f'{cantica} · canto {roman} ({n}/{34 if cantica=="Inferno" else 33})'
    link = page.locator('#cantoLink').get_attribute('href')
    assert f'INP_SECT={n}&' in link and link.endswith('INP_LEN=200&LANG=1')

def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), page.viewport_size

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome')
    for width in [390, 1280]:
        context, page = open_page(browser, width)
        check_entry(page, ENTRIES[INDEX]); no_overflow(page)
        for selector in ['#versePrev','#verseToday','#verseNext','#verseExpand']:
            assert page.locator(selector).bounding_box()['height'] >= 44
        page.locator('#verseExpand').focus(); page.keyboard.press('Enter')
        assert page.locator('#verseExpand').get_attribute('aria-expanded') == 'true'
        assert page.locator('#verseDeeper').is_visible()
        assert page.locator('#cantoSummaryIt').is_visible() and page.locator('#cantoSummaryEn').is_visible()
        no_overflow(page)
        page.screenshot(path=str(ROOT.parent / f'verse-{width}.png'), full_page=True)
        page.keyboard.press('Space')
        assert not page.locator('#verseDeeper').is_visible()
        for step in range(1, len(ENTRIES)+2):
            click(page,'#verseExpand'); click(page,'#verseNext')
            assert not page.locator('#verseDeeper').is_visible()
            check_entry(page, ENTRIES[(INDEX+step)%len(ENTRIES)])
            no_overflow(page)
        click(page,'#verseToday'); check_entry(page, ENTRIES[INDEX])
        for step in range(1,len(ENTRIES)+2):
            click(page,'#versePrev'); check_entry(page, ENTRIES[(INDEX-step)%len(ENTRIES)])
        page.reload(wait_until='networkidle'); check_entry(page, ENTRIES[INDEX])
        page.locator('[data-lang-code=en]').first.click()
        assert page.locator('#versePrev').get_attribute('aria-label') == 'Previous verse'
        assert page.locator('#verseToday').get_attribute('aria-label') == 'Today'
        assert page.locator('#verseNext').get_attribute('aria-label') == 'Next verse'
        click(page,'#verseExpand')
        assert page.locator('#verseExpand').get_attribute('aria-label') == 'Close'
        # Existing machine language flow: the entire verse remains unavailable.
        page.locator('[data-lang-code=fr]').evaluate('(b)=>b.click()')
        page.wait_for_function('document.documentElement.dataset.lang === "fr"')
        assert not page.locator('#verse').is_visible()
        assert page.locator('#ieNote').is_visible()
        assert page.locator('#verse [data-gen]').count() == 0
        no_overflow(page)
        context.close()
        print(f'PASS {width}px: full forward/backward cycles, panel, track, labels, reload, layout')
    override = dict(ENTRIES[0], date='2026-11-05')
    context,page = open_page(browser,today=override)
    check_entry(page, override)
    click(page,'#verseNext'); check_entry(page,ENTRIES[(INDEX+1)%len(ENTRIES)])
    click(page,'#versePrev'); check_entry(page,override)
    click(page,'#versePrev'); check_entry(page,ENTRIES[(INDEX-1)%len(ENTRIES)])
    click(page,'#verseToday'); check_entry(page,override)
    page.reload(wait_until='networkidle'); check_entry(page,override)
    context.close()
    for invalid in [dict(override,date='2026-11-04'), dict(override,verse=''), {'date':'2026-11-05'}]:
        context,page=open_page(browser,today=invalid)
        check_entry(page,ENTRIES[INDEX]); context.close()
    for missing in ['fail','malformed']:
        context,page=open_page(browser,summaries=missing)
        click(page,'#verseExpand')
        assert 'unavailable' in page.locator('#cantoSummaryEn').text_content()
        assert 'INP_SECT=' in page.locator('#cantoLink').get_attribute('href')
        click(page,'#versePrev'); click(page,'#verseExpand'); no_overflow(page)
        context.close()
    for missing in ['fail', [], [{'ref':'bad'}]]:
        context,page=open_page(browser,daily=missing,summaries='fail')
        static=page.locator('#verseText').text_content()
        for selector in ['#versePrev','#verseNext','#verseToday']:
            click(page,selector); assert page.locator('#verseText').text_content()==static
        click(page,'#verseExpand'); assert 'INP_SECT=1&' in page.locator('#cantoLink').get_attribute('href')
        context.close()
    browser.close()
server.shutdown()
assert not errors, errors
assert len(CANTI)==100 and len(ENTRIES)==134
assert {entry['ref'].split(',')[0] for entry in ENTRIES} == set(CANTI)
print('PASS overrides, failure fallbacks, 100 canto coverage; zero JavaScript errors')
