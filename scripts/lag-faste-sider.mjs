#!/usr/bin/env node
//
// Oppretter de fem faste sidene og bunnen i Sanity.
//
// Bakgrunn: 15. august 2026 var det null dokumenter av typen «side» i Sanity.
// Nettstedet viste derfor reservetekst fra src/lib/standardtekst.ts. Teksten
// er riktig, men den er kode, og André kan ikke redigere kode. Dette skriptet
// løfter nøyaktig den samme teksten inn i Sanity som ekte dokumenter. Ingen
// ord endres. Etterpå er Sanity kilden, og standardtekst.ts er bare reserve
// for det tilfellet at Sanity er nede.
//
// Teksten leses direkte fra standardtekst.ts, ikke kopiert hit. Node 22.18+
// stripper typene selv. Det er med vilje: to kopier av den samme teksten
// hadde begynt å sprike samme dag som noen rettet en skrivefeil ett sted.
//
// Bruk:
//   node scripts/lag-faste-sider.mjs --torr     viser hva som ville skjedd
//   node scripts/lag-faste-sider.mjs            skriver til Sanity
//
// Bruker createIfNotExists. Skriptet overskriver aldri en side som finnes,
// så en ny kjøring etter at André har redigert forsiden gjør ingenting.
//
// Krever SANITY_WRITE_TOKEN i .env.

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { sideMedNokkel, standardInnstillinger } from "../src/lib/standardtekst.ts";

const torr = process.argv.includes("--torr");

function lesEnv() {
  const env = {};
  const linjer = readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n");
  for (const linje of linjer) {
    const ren = linje.trim();
    if (!ren || ren.startsWith("#")) continue;
    const skille = ren.indexOf("=");
    if (skille < 0) continue;
    env[ren.slice(0, skille).trim()] = ren.slice(skille + 1).trim();
  }
  return env;
}

const env = { ...lesEnv(), ...process.env };

const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || "production";
const token = env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Mangler PUBLIC_SANITY_PROJECT_ID eller SANITY_WRITE_TOKEN i .env.");
  process.exit(1);
}

const klient = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// Rekkefølgen er den André møter dem i, ikke tilfeldig.
const NOKLER = ["forside", "utsmykking", "rammeverkstedet", "kontakt", "om"];

// Sanity vil ikke ha felt som står til null. De skal mangle, ikke være tomme.
function utenTomme(objekt) {
  const ut = {};
  for (const [nokkel, verdi] of Object.entries(objekt)) {
    if (verdi === null || verdi === undefined) continue;
    if (Array.isArray(verdi) && verdi.length === 0) continue;
    ut[nokkel] = verdi;
  }
  return ut;
}

const dokumenter = NOKLER.map((nokkel) => {
  const kilde = sideMedNokkel(nokkel);
  if (!kilde) throw new Error(`Fant ingen standardtekst for «${nokkel}».`);
  const { _id, ...felt } = kilde;
  // Bindestrek, aldri punktum. Punktum lager en sti i Sanity, og dokumenter
  // i en sti er usynlige for alle som ikke er logget inn.
  return { _id: `side-${nokkel}`, _type: "side", ...utenTomme(felt) };
});

const finnesFra = await klient.fetch(`*[_type == "side"]{_id, nokkel}`);
const finnes = new Set(finnesFra.map((d) => d.nokkel));

const harInnstillinger = Boolean(
  await klient.fetch(`*[_type == "innstillinger"][0]._id`)
);

// Bunnen på nettsiden. Ett dokument med fast ID, samme verdier som
// standardteksten, slik at André møter utfylte felt han kan rette framfor
// tomme felt han må gjette hva skal inneholde.
const innstillingsdok = {
  _id: "innstillinger",
  _type: "innstillinger",
  ...utenTomme(
    Object.fromEntries(
      Object.entries(standardInnstillinger).filter(([, v]) => v !== "")
    )
  ),
};

console.log(`Datasett: ${dataset}. Sider i Sanity fra før: ${finnesFra.length}.`);
console.log("");

for (const dok of dokumenter) {
  const status = finnes.has(dok.nokkel) ? "finnes alt, røres ikke" : "opprettes";
  const felt = Object.keys(dok).filter((k) => !k.startsWith("_")).join(", ");
  console.log(`  ${dok.nokkel.padEnd(16)} ${status}`);
  console.log(`  ${"".padEnd(16)} felt: ${felt}`);
}
console.log(
  `  ${"bunnen".padEnd(16)} ${harInnstillinger ? "finnes alt, røres ikke" : "opprettes"}`
);
console.log("");

if (torr) {
  console.log("Tørrkjøring. Ingenting er skrevet. Kjør uten --torr for å opprette.");
  process.exit(0);
}

const nye = dokumenter.filter((d) => !finnes.has(d.nokkel));

if (nye.length === 0 && harInnstillinger) {
  console.log("Alt finnes fra før. Ingenting å gjøre.");
  process.exit(0);
}

let bunt = klient.transaction();
for (const dok of nye) bunt = bunt.createIfNotExists(dok);
if (!harInnstillinger) bunt = bunt.createIfNotExists(innstillingsdok);
await bunt.commit();

if (nye.length > 0) {
  console.log(`Opprettet ${nye.length} side(r): ${nye.map((d) => d.nokkel).join(", ")}.`);
}
if (!harInnstillinger) console.log("Opprettet bunnen på nettsiden.");
console.log("Dokumentene er publiserte og synlige på nettstedet med en gang.");
