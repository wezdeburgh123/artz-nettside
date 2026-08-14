#!/usr/bin/env node
//
// Rydder plassholderverkene i Sanity etter beslutningen 14. august 2026:
// et generert bilde skal aldri stå tilskrevet en navngitt kunstner.
//
// Gjør tre ting:
//   1. Setter plassholder = true på alle Registerdrift-verk
//   2. Skriver om beskrivelsen, som pekte på «kunstneren» i entall
//   3. Med --fjern-ovrige: arkiverer og fjerner verk som ikke er Registerdrift
//
// Bruk:
//   node scripts/rydd-plassholdere.mjs --torr           viser hva som ville skjedd
//   node scripts/rydd-plassholdere.mjs                  merker de 42
//   node scripts/rydd-plassholdere.mjs --fjern-ovrige   merker, og fjerner resten
//
// Skriptet er idempotent. Kjør det så mange ganger du vil.

import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const torr = process.argv.includes("--torr");
const fjernOvrige = process.argv.includes("--fjern-ovrige");

function lesEnv() {
  try {
    for (const linje of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
      const t = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (t && !process.env[t[1]]) process.env[t[1]] = t[2].replace(/^["']|["']$/g, "");
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
if (!token) {
  console.error("Mangler SANITY_WRITE_TOKEN i .env.");
  process.exit(1);
}

const klient = createClient({
  projectId: prosjektId,
  dataset: datasett,
  apiVersion: "2026-08-13",
  token,
  useCdn: false,
});

const BESKRIVELSE =
  "Generativ grafikk fra serien Registerdrift, laget for ARTZ. Dette er en " +
  "midlertidig plassholder mens vi venter på verksbilder, ikke et verk av " +
  "noen av kunstnerne vi formidler.";

const plassholdere = await klient.fetch(
  `*[_type == "verk" && string::startsWith(_id, "verk-registerdrift-")]{_id, tittel, plassholder}`
);
const ovrige = await klient.fetch(
  `*[_type == "verk" && !string::startsWith(_id, "verk-registerdrift-")]{_id, tittel, "kunstner": kunstner->navn}`
);

console.log(`Prosjekt ${prosjektId}, datasett ${datasett}`);
console.log(`\n${plassholdere.length} Registerdrift-verk funnet.`);
const umerkede = plassholdere.filter((v) => v.plassholder !== true);
console.log(`  ${umerkede.length} mangler plassholder-merket og blir merket.`);
console.log(`  Alle ${plassholdere.length} får ny beskrivelse.`);

console.log(`\n${ovrige.length} verk som ikke er Registerdrift:`);
for (const v of ovrige) {
  console.log(`  ${v._id}  «${v.tittel}»  ${v.kunstner ?? "uten kunstner"}`);
}

if (ovrige.length && !fjernOvrige) {
  console.log("\nDisse røres ikke. Kjør med --fjern-ovrige for å arkivere og fjerne dem.");
}

if (torr) {
  console.log("\nTørrkjøring. Ingenting er skrevet.");
  process.exit(0);
}

// --- 1 og 2: merk plassholderne ------------------------------------------
const bunt = klient.transaction();
for (const v of plassholdere) {
  bunt.patch(v._id, (p) => p.set({ plassholder: true, beskrivelse: BESKRIVELSE }));
}
await bunt.commit();
console.log(`\nMerket ${plassholdere.length} verk som plassholder, med ny beskrivelse.`);

// --- 3: arkiver og fjern de øvrige ---------------------------------------
if (fjernOvrige && ovrige.length) {
  const filsti = decodeURIComponent(
    new URL("../_arkiv/sanity/fjernede-verk.ndjson", import.meta.url).pathname
  );
  mkdirSync(dirname(filsti), { recursive: true });

  // Hele dokumentet ut på fil FØR noe slettes. Bildet blir liggende som
  // asset i Sanity uansett, så et fjernet verk kan settes inn igjen.
  const fulle = await klient.fetch(
    `*[_type == "verk" && !string::startsWith(_id, "verk-registerdrift-")]`
  );
  writeFileSync(filsti, fulle.map((d) => JSON.stringify(d)).join("\n") + "\n", "utf8");
  console.log(`\nArkivert ${fulle.length} dokument til _arkiv/sanity/fjernede-verk.ndjson`);

  const lest = readFileSync(filsti, "utf8").trim().split("\n").length;
  if (lest !== fulle.length) {
    console.error("Arkivfila stemmer ikke med antallet. Avbryter uten å slette.");
    process.exit(1);
  }

  const slett = klient.transaction();
  for (const d of fulle) slett.delete(d._id);
  await slett.commit();
  console.log(`Fjernet ${fulle.length} verk fra Sanity. Bildefilene ligger igjen som assets.`);
  console.log(
    "Gjenopprett med:  npx sanity dataset import _arkiv/sanity/fjernede-verk.ndjson production --replace"
  );
}

const igjen = await klient.fetch(`count(*[_type == "verk"])`);
const merket = await klient.fetch(`count(*[_type == "verk" && plassholder == true])`);
console.log(`\nStatus: ${igjen} verk i Sanity, ${merket} merket som plassholder.`);
