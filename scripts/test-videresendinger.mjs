// Tester alle videresendingene i netlify.toml mot den levende siden.
//
// Bakgrunn: 13. august 2026 pekte én av 39 videresendinger på seg selv og ga
// uendelig løkke på /grafikksenteret. Den slapp gjennom fordi lista ble
// skrevet i ett strekk og ingen av adressene ble åpnet etterpå. Dette
// skriptet finnes for at det ikke skal kunne skje igjen.
//
// Bruk:
//   node scripts/test-videresendinger.mjs
//   node scripts/test-videresendinger.mjs https://artz.no

import { readFileSync } from "node:fs";

const BASIS = process.argv[2] ?? "https://artz-nettside.netlify.app";

const toml = readFileSync("netlify.toml", "utf8");

// Plukker ut from/to-par. Enkelt med vilje, formatet er vårt eget.
const par = [...toml.matchAll(/\[\[redirects\]\]\s*\n\s*from = "([^"]+)"\s*\n\s*to = "([^"]+)"/g)].map(
  ([, fra, til]) => ({ fra, til })
);

console.log(`Tester ${par.length} videresendinger mot ${BASIS}\n`);

// /noe/* testes som /noe/PROVE. Konkrete adresser testes som de står.
const PROVE = "test";

function proveadresse(fra) {
  if (fra.endsWith("/*")) return fra.slice(0, -2) + "/" + PROVE;
  if (fra.endsWith("*")) return fra.slice(0, -1);
  return fra;
}

let feil = 0;
let ok = 0;

for (const { fra, til } of par) {
  const sti = proveadresse(fra);
  const url = BASIS + sti;

  // Selvreferanse fanges før vi bruker nettverk på det.
  if (sti.replace(/\/$/, "") === til.replace(/\/$/, "")) {
    console.log(`SELVREFERANSE  ${fra} -> ${til}`);
    feil++;
    continue;
  }

  try {
    // manual: vi vil se selve 301-en, ikke resultatet av å følge den.
    const steg1 = await fetch(url, { redirect: "manual" });
    const sted = steg1.headers.get("location");

    if (steg1.status < 300 || steg1.status >= 400) {
      console.log(`IKKE OMDIRIGERT  ${sti}  status ${steg1.status}`);
      feil++;
      continue;
    }

    const maal = new URL(sted, BASIS);
    const steg2 = await fetch(maal, { redirect: "follow" });

    if (steg2.status !== 200) {
      console.log(`MÅL SVARER ${steg2.status}  ${sti} -> ${maal.pathname}`);
      feil++;
      continue;
    }

    // Netlify setter inn det som traff jokertegnet der :splat står, så
    // /aktuelt/* -> /om-kunsten/:splat lander på /om-kunsten/PROVE når vi
    // tester med /aktuelt/PROVE. Uten denne linja meldte skriptet
    // «ANNET MÅL» på en videresending som virket helt riktig.
    // Observert 15. august 2026, første gang lista ble kjørt mot produksjon.
    const forventet = til.replace(/:splat/g, PROVE).replace(/\/$/, "");
    const faktisk = maal.pathname.replace(/\/$/, "");
    if (faktisk !== forventet) {
      console.log(`ANNET MÅL  ${sti} -> ${faktisk}, ventet ${forventet}`);
      feil++;
      continue;
    }

    ok++;
  } catch (e) {
    console.log(`FEILET  ${sti}  ${e.message}`);
    feil++;
  }
}

console.log(`\n${ok} i orden, ${feil} med feil, av ${par.length} totalt`);
process.exit(feil > 0 ? 1 : 0);
