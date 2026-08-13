// Lager enkle, nøytrale plassholderbilder til demoinnholdet.
// Kjør: node scripts/lag-demobilder.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const ut = "public/demo";
mkdirSync(ut, { recursive: true });

// Deterministisk tilfeldighet, så bildene blir like hver gang.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const paletter = [
  ["#e8e4dc", "#4a5c5a", "#8fa39c", "#c2b8a3", "#2f3634"],
  ["#eeeae2", "#5b4b42", "#a8836a", "#cbb9a0", "#332a25"],
  ["#e6e8e6", "#3c4a5c", "#7d93a8", "#b9c4cc", "#232a33"],
  ["#efece5", "#6b5c3e", "#a99364", "#d0c5a8", "#3a3226"],
];

function verkbilde(seed, bredde, hoyde) {
  const r = rng(seed);
  const p = paletter[seed % paletter.length];
  const [bg, ...farger] = p;
  const deler = [];
  const antall = 4 + Math.floor(r() * 4);
  for (let i = 0; i < antall; i++) {
    const f = farger[Math.floor(r() * farger.length)];
    const o = (0.35 + r() * 0.5).toFixed(2);
    const type = r();
    if (type < 0.45) {
      const w = bredde * (0.2 + r() * 0.6);
      const h = hoyde * (0.08 + r() * 0.5);
      const x = r() * (bredde - w);
      const y = r() * (hoyde - h);
      deler.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${f}" opacity="${o}"/>`
      );
    } else if (type < 0.75) {
      const rad = Math.min(bredde, hoyde) * (0.08 + r() * 0.28);
      const cx = rad + r() * (bredde - 2 * rad);
      const cy = rad + r() * (hoyde - 2 * rad);
      deler.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="${f}" opacity="${o}"/>`
      );
    } else {
      const y = r() * hoyde;
      const y2 = r() * hoyde;
      deler.push(
        `<path d="M0 ${y.toFixed(1)} L${bredde} ${y2.toFixed(1)}" stroke="${f}" stroke-width="${(1 + r() * 3).toFixed(1)}" opacity="${o}" fill="none"/>`
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bredde} ${hoyde}" width="${bredde}" height="${hoyde}" role="img" aria-label="Plassholderbilde"><rect width="${bredde}" height="${hoyde}" fill="${bg}"/>${deler.join("")}</svg>`;
}

function portrett(seed) {
  const p = paletter[seed % paletter.length];
  const [bg, a, b] = p;
  const s = 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="Plassholderbilde"><rect width="${s}" height="${s}" fill="${bg}"/><circle cx="300" cy="240" r="105" fill="${a}" opacity="0.55"/><path d="M110 600 C110 430 200 370 300 370 C400 370 490 430 490 600 Z" fill="${b}" opacity="0.6"/></svg>`;
}

const verk = [
  ["verk-1", 700, 1000],
  ["verk-2", 500, 650],
  ["verk-3", 1200, 900],
  ["verk-4", 800, 800],
  ["verk-5", 700, 900],
  ["verk-6", 560, 760],
];

verk.forEach(([navn, w, h], i) => {
  writeFileSync(`${ut}/${navn}.svg`, verkbilde(i + 1, w, h));
});

[1, 2, 3].forEach((n) => {
  writeFileSync(`${ut}/portrett-${n}.svg`, portrett(n));
});

console.log(`Skrev ${verk.length + 3} plassholderbilder til ${ut}`);
