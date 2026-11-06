"""Optional browser integration check: install Playwright + Chromium, start PatternLab,
then run python tests/browser-submit.py [http://127.0.0.1:4173]. Uses a fresh profile.
"""
import sys
from playwright.sync_api import sync_playwright, expect

sys.stdout.reconfigure(errors="backslashreplace")
base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173"
fast = """def solve(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [i, seen[target - x]]
        seen[x] = i"""
slow = """def solve(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]"""

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page()
    page.goto(base + "/#/problem/two-integer-sum")
    code = page.locator("#code")
    panel = page.locator(".result-box")
    title = panel.locator("h3")
    button = page.get_by_role("button", name="Submit", exact=True)
    def submit(source, verdict):
        code.fill(source)
        button.click()
        expect(title).to_have_text(verdict, timeout=50000)
        print(verdict, "|", panel.locator(".judge-case").last.inner_text().replace("\n", " "), flush=True)

    # Passing both examples does not suffice for acceptance.
    code.fill("def solve(nums, target): return [0, 3] if nums == [8,3,6,2] else [0, 1]")
    page.get_by_role("button", name="Run samples").click()
    expect(title).to_have_text("2 of 2 samples passed", timeout=50000)
    button.click()
    expect(title).to_have_text("Wrong answer", timeout=50000)
    expect(panel.locator(".judge-case").last).to_contain_text("Hidden case")
    expect(page.get_by_role("button",name="Mark solved",exact=True)).to_be_visible()
    submit(slow, "Time limit exceeded")
    expect(panel.locator(".judge-case").last).to_contain_text("Stress case")
    submit("def solve(*args): return bytearray(200 * 1024 * 1024)", "Memory limit exceeded")
    submit("def solve(*args): raise ValueError('oops')", "Runtime error")
    submit(fast, "Accepted")
    expect(page.get_by_role("button", name="Solved", exact=True)).to_be_visible()
    expect(panel).to_contain_text("10,000 items")
    # Abandon an active worker by editing, then run another language.
    code.fill("def solve(*args):\n    while True: pass")
    button.click()
    expect(title).to_contain_text("Judging", timeout=50000)
    code.fill(fast)
    expect(button).to_be_enabled()
    expect(title).to_have_text("Judge results")
    page.locator("#language").select_option("javascript")
    submit("function solve(a,t){const m=new Map();for(const [i,x] of a.entries()){if(m.has(t-x))return [m.get(t-x),i];m.set(x,i)}}","Accepted")
    page.set_viewport_size({"width":360,"height":740})
    button.scroll_into_view_if_needed()
    expect(button).to_be_in_viewport()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    browser.close()
