import { chromium } from "playwright";

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const sider = [
  ["/", "forside"],
  ["/kunstnere", "kunstnere"],
  ["/galleri", "galleri"],
  ["/kunstnere/ada-lindqvist", "kunstner"],
  ["/aktuelt", "aktuelt"],
  ["/kontakt", "kontakt"],
  ["/rammeverkstedet", "ramme"],
];

for (const [bredde, merke] of [
  [1280, "desktop"],
  [430, "mobil"],
]) {
  const c = await b.newContext({
    viewport: { width: bredde, height: 900 },
    deviceScaleFactor: 2,
  });
  const p = await c.newPage();
  for (const [sti, navn] of sider) {
    await p.goto("http://127.0.0.1:4321" + sti, { waitUntil: "networkidle" });
    // Rull gjennom sida så lazy-lastede bilder faktisk lastes før skuddet.
    await p.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForLoadState("networkidle");
    await p.screenshot({ path: `/tmp/skudd/${merke}-${navn}.png`, fullPage: true });
  }
  await c.close();
}

await b.close();
console.log("ok");
