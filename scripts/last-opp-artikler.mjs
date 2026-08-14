#!/usr/bin/env node
//
// Legger de åtte kunsthistorie-artiklene inn i Sanity som «Om kunsten»-saker.
//
// Bruk:
//   node scripts/last-opp-artikler.mjs --torr     viser hva som ville skjedd
//   node scripts/last-opp-artikler.mjs            skriver til Sanity
//
// Skriptet er idempotent. Dokument-ID-ene er faste, artikkel-<slug>, så en
// ny kjøring erstatter de samme åtte dokumentene i stedet for å lage
// duplikater. Bindestrek, aldri punktum: punktum lager en sti i Sanity, og
// dokumenter i en sti er ikke offentlig lesbare. Det kostet oss en kveld
// 13. august 2026.
//
// Krever SANITY_WRITE_TOKEN i .env. Lag et token med
//   npx sanity tokens create "artikkelimport" --role=editor --project-id=oe6d51b6

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { artikler, DATO, OPPHAV } from "./artikler-data.mjs";

const torr = process.argv.includes("--torr");

// Leser .env selv, så skriptet ikke er avhengig av at Astro har startet.
function lesEnv() {
  try {
    const linjer = readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n");
    for (const linje of linjer) {
      const treff = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (treff && !process.env[treff[1]]) {
        process.env[treff[1]] = treff[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Ingen .env. Da må variablene komme fra miljøet.
  }
}
lesEnv();

const prosjektId = process.env.PUBLIC_SANITY_PROJECT_ID;
const datasett = process.env.PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!prosjektId) {
  console.error("Mangler PUBLIC_SANITY_PROJECT_ID. Sjekk .env.");
  process.exit(1);
}
if (!token && !torr) {
  console.error(
    "Mangler SANITY_WRITE_TOKEN i .env. Kjør med --torr for å se hva som ville skjedd."
  );
  process.exit(1);
}

// Portable Text trenger unike nøkler per blokk og per tekstbit. De lages av
// slug og posisjon framfor tilfeldig, slik at to kjøringer gir identiske
// dokumenter og diffen i Sanity blir tom når ingenting er endret.
function tilBlokker(slug, avsnitt) {
  return avsnitt.map((tekst, i) => ({
    _type: "block",
    _key: `${slug}-b${i}`,
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: `${slug}-b${i}-s0`, text: tekst, marks: [] },
    ],
  }));
}

function tilDokument(a) {
  const avsnitt = [...a.avsnitt, OPPHAV];
  return {
    _id: `artikkel-${a.slug}`,
    _type: "aktuelt",
    tittel: a.tittel,
    slug: { _type: "slug", current: a.slug },
    dato: DATO,
    ingress: a.ingress,
    tekst: tilBlokker(a.slug, avsnitt),
  };
}

const dokumenter = artikler.map(tilDokument);

console.log(
  `${dokumenter.length} artikler, prosjekt ${prosjektId}, datasett ${datasett}, dato ${DATO}`
);
for (const d of dokumenter) {
  console.log(`  ${d._id}  ${d.tekst.length} avsnitt  ${d.tittel}`);
}

if (torr) {
  console.log("\nTørrkjøring. Ingenting er skrevet.");
  process.exit(0);
}

const klient = createClient({
  projectId: prosjektId,
  dataset: datasett,
  apiVersion: "2026-08-13",
  token,
  useCdn: false,
});

const bunt = klient.transaction();
for (const d of dokumenter) bunt.createOrReplace(d);

try {
  await bunt.commit();
  console.log(`\nSkrevet. ${dokumenter.length} artikler ligger nå i Sanity.`);
  console.log("De er publiserte med én gang, ikke utkast.");
} catch (feil) {
  console.error("\nOpplastingen feilet:", feil.message);
  process.exit(1);
}
