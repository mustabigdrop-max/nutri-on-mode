import asyncio,json,os
from playwright.async_api import async_playwright
s=json.load(open(os.path.expanduser("~/.cache/lovable-auth/session.json")))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True);c=await b.new_context(viewport={"width":1280,"height":1800});pg=await c.new_page()
    pg.on("pageerror",lambda e:print("ERR",e));pg.on("console",lambda m:m.type in("error","warning") and print("CON",m.text[:300]))
    await pg.goto("http://localhost:8080");await pg.evaluate(f"localStorage.setItem({json.dumps(s['storage_key'])},{json.dumps(json.dumps(s['session']))})")
    await pg.goto("http://localhost:8080/coach/apex-visual");await pg.wait_for_timeout(5000)
    await pg.locator("input[type=file]").first.set_input_files("/tmp/browser/av/p.jpg");await pg.wait_for_timeout(1500)
    btns=await pg.locator("button").all_inner_texts();print([x for x in btns if x.strip()][-25:])
    for t in ["ANALIS","Analis","GERAR"]:
      l=pg.locator("button",has_text=t)
      if await l.count(): await l.last.click(); print("clicked",t); break
    await pg.wait_for_timeout(40000)
    await pg.screenshot(path="s.png")
    print([x[:200] for x in await pg.locator("[role=status],li[data-state]").all_inner_texts()])
asyncio.run(main())
