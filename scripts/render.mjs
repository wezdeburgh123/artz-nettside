/* Headless render av Registerdrift. Samme algoritme som viewer.html.
   Kjør: node render.mjs [utmappe]
*/
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const UT = process.argv[2] || "./ut";
fs.mkdirSync(UT, { recursive: true });

const KUNSTNERE = [
  "frank-brunner", "elling-reitan", "nico-widerberg", "sverre-bjertnaes",
  "bjorg-thorhallsdottir", "mia-gjerdrum-helgesen", "cathrine-knudsen",
  "rolf-sorensen", "nina-due", "arjuna-geir-aasehaug", "merete-sejersted-bodtker",
  "gunn-vottestad", "dag-hol", "jarle-rosseland", "jan-svendsen",
  "even-richardson", "per-morten-karlsen", "eva-langaas", "ludvig-eikaas",
  "jorgen-holen", "kai-fjell",
];

const p5src = fs.readFileSync("node_modules/p5/lib/p5.min.js", "utf8");
const algsrc = fs.readFileSync("algoritme.js", "utf8");

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await b.newPage({ viewport: { width: 900, height: 700 } });
page.on("pageerror", (e) => console.error("SIDEFEIL:", e.message));
await page.setContent("<!doctype html><body style='margin:0'></body>");
await page.addScriptTag({ content: p5src });
await page.addScriptTag({ content: algsrc });

await page.evaluate(() => {
  window.tegn = (cfg) =>
    new Promise((ferdig) => {
      const sketch = (p) => {
        p.setup = () => {
          p.pixelDensity(1);
          p.createCanvas(cfg.format.w, cfg.format.h);
          p.noLoop();
          window.REGISTERDRIFT.tegnVerk(p, cfg);
          const data = p.canvas.toDataURL("image/jpeg", 0.9);
          p.remove();
          ferdig(data);
        };
      };
      new window.p5(sketch);
    });
});

const fasit = [];
for (const slug of KUNSTNERE) {
  for (const nr of [1, 2]) {
    const cfg = await page.evaluate((a) => window.REGISTERDRIFT.cfgFor(a[0], a[1]), [slug, nr]);
    const t0 = Date.now();
    const data = await page.evaluate((c) => window.tegn(c), cfg);
    const fil = `${slug}-${nr}.jpg`;
    fs.writeFileSync(path.join(UT, fil), Buffer.from(data.split(",")[1], "base64"));
    const kb = Math.round(fs.statSync(path.join(UT, fil)).size / 1024);
    fasit.push({ fil, slug, nr, hand: cfg.hand, palett: cfg.palett.navn, konvolutt: cfg.konvolutt, plater: cfg.plater, seed: cfg.seed, format: `${cfg.format.w}x${cfg.format.h}`, kb });
    console.log(
      `${fil.padEnd(32)} ${cfg.hand.padEnd(7)} ${cfg.palett.navn.padEnd(11)} ${cfg.konvolutt.padEnd(10)} ${cfg.plater} lag  ${String(cfg.format.w + "x" + cfg.format.h).padEnd(10)} ${String(kb).padStart(4)} kB  ${Date.now() - t0} ms`
    );
  }
}
fs.writeFileSync(path.join(UT, "_fasit.json"), JSON.stringify(fasit, null, 1));
await b.close();
console.log(`\n${fasit.length} verk skrevet til ${UT}`);
