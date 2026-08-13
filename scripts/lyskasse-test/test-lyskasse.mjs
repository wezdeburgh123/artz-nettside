// Tester lyskassa i en faktisk nettleser. Bygget sier ingenting om
// om en dialog åpner seg eller om fokus kommer tilbake.
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;

const URL = "http://localhost:4321/test-lyskasse";
let feil = 0;
const sjekk = (navn, ok, detalj = "") => {
  console.log(`${ok ? "OK      " : "FEIL    "}${navn}${detalj ? "  " + detalj : ""}`);
  if (!ok) feil++;
};

const nettleser = await chromium.launch();

for (const visning of [
  { navn: "desktop", width: 1440, height: 900 },
  { navn: "mobil", width: 430, height: 932, isMobile: true, hasTouch: true },
]) {
  const ctx = await nettleser.newContext({
    viewport: { width: visning.width, height: visning.height },
    hasTouch: visning.hasTouch ?? false,
    deviceScaleFactor: 2,
  });
  const side = await ctx.newPage();
  const konsollfeil = [];
  side.on("console", (m) => m.type() === "error" && konsollfeil.push(m.text()));
  side.on("pageerror", (e) => konsollfeil.push("pageerror: " + e.message));

  await side.goto(URL, { waitUntil: "networkidle" });
  console.log(`\n--- ${visning.navn} ${visning.width}x${visning.height} ---`);

  // 1. Utløserne finnes og er lenker med href til bildefila.
  const utlosere = side.locator("[data-lyskasse]");
  sjekk("tre utløsere på sida", (await utlosere.count()) === 3);
  const href = await utlosere.first().getAttribute("href");
  sjekk("utløseren er en lenke til bildet", href === "/test-lyskasse/hoyt.jpg", href);

  // 2. Dialogen er lukket før noe klikkes.
  const dialog = side.locator("dialog.lyskasse");
  sjekk("dialogen er lukket ved lasting", !(await dialog.evaluate((d) => d.open)));

  // 3. Klikk åpner, og riktig bilde vises.
  await utlosere.first().click();
  await side.waitForTimeout(300);
  sjekk("klikk åpner dialogen", await dialog.evaluate((d) => d.open));
  sjekk(
    "riktig bilde lastet",
    await side.locator(".lyskasse__bilde").evaluate((i) => i.naturalWidth > 0 && i.complete)
  );
  sjekk(
    "tittel vises",
    (await side.locator(".lyskasse__tittel").textContent()) === "Høyt bilde"
  );
  sjekk(
    "metatekst har kunstner og teknikk",
    (await side.locator(".lyskasse__meta").textContent())?.includes("Testkunstner A · Litografi")
  );
  sjekk("teller viser 1 av 3", (await side.locator(".lyskasse__teller").textContent()) === "1 av 3");

  // 4. Et ekstremt høyt bilde skal holde seg innenfor skjermen.
  const boks = await side.locator(".lyskasse__bilde").boundingBox();
  sjekk(
    "høyt bilde er innenfor skjermhøyden",
    boks.height <= visning.height,
    `bilde ${Math.round(boks.width)}x${Math.round(boks.height)}, skjerm ${visning.height}`
  );
  sjekk("høyt bilde er innenfor skjermbredden", boks.width <= visning.width);
  // Prøver faktisk å rulle. Første versjon av denne testen sammenlignet
  // scrollHeight med clientHeight, men overflow: hidden endrer ikke
  // scrollHeight, så den målte noe annet enn det den het.
  await side.mouse.move(visning.width / 2, visning.height / 2);
  await side.mouse.wheel(0, 600);
  await side.waitForTimeout(250);
  const rullet = await side.evaluate(() => window.scrollY);
  const overflow = await side.evaluate(
    () => getComputedStyle(document.documentElement).overflow
  );
  sjekk("bakgrunnen ruller ikke med åpen lyskasse", rullet === 0, `scrollY ${rullet}`);
  sjekk("html har overflow: hidden mens lyskassa er åpen", overflow === "hidden", overflow);

  await side.screenshot({ path: `/home/claude/skjerm-lyskasse-${visning.navn}-hoyt.png` });

  // 5. Piltast blar videre.
  await side.keyboard.press("ArrowRight");
  await side.waitForTimeout(250);
  sjekk(
    "høyrepil blar til neste verk",
    (await side.locator(".lyskasse__tittel").textContent()) === "Bredt bilde"
  );
  const boks2 = await side.locator(".lyskasse__bilde").boundingBox();
  sjekk(
    "bredt bilde er innenfor skjermbredden",
    boks2.width <= visning.width,
    `bilde ${Math.round(boks2.width)}x${Math.round(boks2.height)}`
  );
  await side.screenshot({ path: `/home/claude/skjerm-lyskasse-${visning.navn}-bredt.png` });

  // 6. Blar rundt fra siste til første.
  await side.keyboard.press("ArrowRight");
  await side.keyboard.press("ArrowRight");
  await side.waitForTimeout(250);
  sjekk(
    "blar rundt fra siste til første",
    (await side.locator(".lyskasse__tittel").textContent()) === "Høyt bilde"
  );

  // 7. Escape lukker, og fokus kommer tilbake til verket.
  await side.keyboard.press("Escape");
  await side.waitForTimeout(250);
  sjekk("Escape lukker", !(await dialog.evaluate((d) => d.open)));
  sjekk(
    "fokus tilbake på verket man kom fra",
    await side.evaluate(() => document.activeElement?.hasAttribute("data-lyskasse"))
  );

  // 8. Klikk på bakteppet lukker.
  await utlosere.nth(1).click();
  await side.waitForTimeout(250);
  await side.mouse.click(4, 4);
  await side.waitForTimeout(250);
  sjekk("klikk på bakteppet lukker", !(await dialog.evaluate((d) => d.open)));

  // 9. Lukk-knappen virker.
  await utlosere.nth(2).click();
  await side.waitForTimeout(250);
  await side.locator(".lyskasse__lukk").click();
  await side.waitForTimeout(250);
  sjekk("lukkeknappen virker", !(await dialog.evaluate((d) => d.open)));

  // 10. Tastaturvei inn: tab til første verk og Enter.
  await side.keyboard.press("Escape");
  await side.evaluate(() => document.querySelector("[data-lyskasse]").focus());
  await side.keyboard.press("Enter");
  await side.waitForTimeout(300);
  sjekk("Enter på fokusert verk åpner", await dialog.evaluate((d) => d.open));
  await side.keyboard.press("Escape");

  // 11. Sveip, bare der det finnes berøring.
  if (visning.hasTouch) {
    await utlosere.first().click();
    await side.waitForTimeout(250);
    const midtY = visning.height / 2;
    await side.touchscreen.tap(visning.width / 2, midtY);
    await side.evaluate(
      ([w, y]) => {
        const d = document.querySelector("dialog.lyskasse");
        const punkt = (x) => [
          new Touch({ identifier: 1, target: d, screenX: x, screenY: y, clientX: x, clientY: y }),
        ];
        d.dispatchEvent(new TouchEvent("touchstart", { changedTouches: punkt(w - 40), bubbles: true }));
        d.dispatchEvent(new TouchEvent("touchend", { changedTouches: punkt(40), bubbles: true }));
      },
      [visning.width, midtY]
    );
    await side.waitForTimeout(250);
    sjekk(
      "sveip mot venstre blar til neste verk",
      (await side.locator(".lyskasse__tittel").textContent()) === "Bredt bilde",
      await side.locator(".lyskasse__tittel").textContent()
    );
    // Et lite, skjevt dra skal ikke bla.
    await side.evaluate(
      ([w, y]) => {
        const d = document.querySelector("dialog.lyskasse");
        const punkt = (x, yy) => [
          new Touch({ identifier: 1, target: d, screenX: x, screenY: yy, clientX: x, clientY: yy }),
        ];
        d.dispatchEvent(new TouchEvent("touchstart", { changedTouches: punkt(w / 2, y), bubbles: true }));
        d.dispatchEvent(new TouchEvent("touchend", { changedTouches: punkt(w / 2 - 30, y + 200), bubbles: true }));
      },
      [visning.width, midtY]
    );
    await side.waitForTimeout(250);
    sjekk(
      "kort, loddrett dra blar ikke",
      (await side.locator(".lyskasse__tittel").textContent()) === "Bredt bilde"
    );
    await side.keyboard.press("Escape");
  }

  sjekk("ingen konsollfeil", konsollfeil.length === 0, konsollfeil.join(" | "));

  await ctx.close();
}

await nettleser.close();
console.log(`\n${feil === 0 ? "Alt grønt." : feil + " feil."}`);
process.exit(feil > 0 ? 1 : 0);
