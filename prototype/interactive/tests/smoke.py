from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "standalone.html").read_text()
OUT = ROOT / "tests" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)


def route(page, hash_path: str):
    page.evaluate("p => { location.hash = p; }", hash_path)
    page.wait_for_timeout(120)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    errors = []
    page.on("console", lambda msg: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda exc: errors.append(f"pageerror:{exc}"))
    page.set_content(HTML, wait_until="load")

    checks = [
        ("home", "#/home"),
        ("shared-ask", "#/ask/ladder?visitor=1"),
        ("contribute", "#/contribute/ladder"),
        ("create", "#/create"),
        ("plan", "#/plan/ladder"),
        ("loan", "#/loan/ladder"),
        ("completion", "#/complete"),
    ]
    for name, hash_path in checks:
        route(page, hash_path)
        page.screenshot(path=str(OUT / f"mobile-{name}.png"), full_page=True)
        assert page.locator("main").count() == 1
        assert page.title()

    # Critical first-time contribution flow.
    route(page, "#/ask/ladder?visitor=1")
    page.get_by_role("button", name="I can help", exact=True).click()
    assert "/contribute/ladder" in page.evaluate("location.hash")
    page.get_by_role("button", name="Continue").click()
    assert "/offer-details/ladder" in page.evaluate("location.hash")
    page.get_by_role("button", name="Continue to send").click()
    assert "/verify/ladder" in page.evaluate("location.hash")
    page.get_by_role("button", name="Text me a code").click()
    page.get_by_role("button", name="Verify and send offer").click()
    page.wait_for_selector("h1")
    page.wait_for_timeout(100)
    assert "/offer-sent/ladder" in page.evaluate("location.hash")
    assert page.get_by_role("heading", name="Bruce will confirm.").count() == 1

    # Requester creation flow.
    route(page, "#/create")
    page.get_by_role("button", name="Make a draft").click()
    assert "/draft" in page.evaluate("location.hash")
    page.get_by_role("button", name="Looks right").click()
    page.wait_for_timeout(100)
    assert "/share" in page.evaluate("location.hash")
    assert page.get_by_role("heading", name="Your Ask is live.").count() == 1

    # Desktop sanity.
    desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
    desktop_errors = []
    desktop.on("console", lambda msg: desktop_errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
    desktop.on("pageerror", lambda exc: desktop_errors.append(f"pageerror:{exc}"))
    desktop.set_content(HTML, wait_until="load")
    route(desktop, "#/home")
    desktop.screenshot(path=str(OUT / "desktop-home.png"), full_page=True)
    route(desktop, "#/admin")
    desktop.screenshot(path=str(OUT / "desktop-admin.png"), full_page=True)

    errors.extend(desktop_errors)
    print("SMOKE_OK")
    print("ERRORS", errors)
    browser.close()
