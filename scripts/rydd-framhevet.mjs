#!/usr/bin/env node
//
// Fjerner det foreldreløse feltet «framhevet» fra kunstnerdokumentene.
//
// Bakgrunn: 14. august 2026 ble «Vis på forsiden» tatt ut av kunstner-
// schemaet. Feltet gjorde ingenting, forsiden lister alle kunstnerne uansett.
// Verdiene ble liggende igjen i Sanity, og Studio viser dem nå som «Ukjent
// felt funnet» på hver eneste kunstner. Advarselen er ufarlig, men den er
// støy for en eier som er 73 år og skal drifte innholdet selv.
//
// Merk: feltet «framhevet» på Verk skal stå. Det styrer «Utvalgte verk» på
// forsiden og er fortsatt i bruk. Dette skriptet rører bare kunstnere.
//
// Bruk:
//   node scripts/rydd-framhevet.mjs --torr     viser hva som ville skjedd
//   node scripts/rydd-framhevet.mjs            skriver til Sanity
//
// Idempotent. En ny kjøring finner ingenting og gjør ingenting.
//
// Krever SANITY_WRITE_TOKEN i .env, som allerede ligger der.

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const torr = process.argv.includes("--torr");

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
if (!token) {
  console.error("Mangler SANITY_WRITE_TOKEN i .env.");
  process.exit(1);
}

// perspective «raw» gjør at både publiserte dokumenter og utkast kommer med.
// Ligger feltet bare i utkastet, står advarselen fortsatt i Studio, så begge
// må ryddes.
const klient = createClient({
  projectId: prosjektId,
  dataset: datasett,
  apiVersion: "2024-10-01",
  useCdn: false,
  perspective: "raw",
  token,
});

const treff = await klient.fetch(
  `*[_type == "kunstner" && defined(framhevet)]{ _id, navn, framhevet } | order(_id asc)`
);

if (treff.length === 0) {
  console.log("Ingen kunstnere har feltet «framhevet». Ingenting å gjøre.");
  process.exit(0);
}

console.log(`Fant ${treff.length} dokumenter med et foreldreløst «framhevet»-felt:\n`);
for (const d of treff) {
  const type = d._id.startsWith("drafts.") ? "utkast   " : "publisert";
  console.log(`  ${type}  ${d._id.padEnd(42)} ${d.navn ?? ""}  (${d.framhevet})`);
}

if (torr) {
  console.log("\nTørrkjøring. Ingenting er skrevet. Kjør uten --torr for å rydde.");
  process.exit(0);
}

const transaksjon = treff.reduce(
  (t, d) => t.patch(d._id, (p) => p.unset(["framhevet"])),
  klient.transaction()
);

await transaksjon.commit();

console.log(`\nFerdig. Fjernet «framhevet» fra ${treff.length} dokumenter.`);
console.log("Last Studio på nytt. Advarselen skal være borte.");
