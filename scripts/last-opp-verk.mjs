/* Laster de 42 Registerdrift-verkene opp i Sanity som Verk-dokumenter,
   ett per bilde, hvert med referanse til riktig kunstner.

   Krever en skrivetoken i .env:
     SANITY_WRITE_TOKEN=sk...

   Kjør:  node --env-file=.env scripts/last-opp-verk.mjs
   Tørrkjør (laster ikke opp noe): node --env-file=.env scripts/last-opp-verk.mjs --torr

   Skriptet er idempotent. Dokument-ID-ene er utledet av filnavnet, så en ny
   kjøring erstatter framfor å duplisere. Opplastede bilder huskes i
   scripts/.opplastede-bilder.json, slik at gjenkjøring ikke fyller opp
   mediebiblioteket med kopier.
*/
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

const TORR = process.argv.includes("--torr");
const ROT = path.resolve(import.meta.dirname, "..");
const BILDER = path.join(ROT, "public/plassholdere");
const HUSK = path.join(ROT, "scripts/.opplastede-bilder.json");

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) { console.error("Mangler PUBLIC_SANITY_PROJECT_ID i .env"); process.exit(1); }
if (!token && !TORR) {
  console.error(`Mangler SANITY_WRITE_TOKEN i .env.

Slik lager du den:
  1. Gå til https://www.sanity.io/manage/project/${projectId}/api
  2. Tokens, Add API token
  3. Navn: "opplasting fra maskin". Rolle: Editor
  4. Kopier verdien, den vises bare én gang
  5. Legg den i .env som   SANITY_WRITE_TOKEN=sk...

.env er allerede i .gitignore, så tokenet havner ikke i det offentlige repoet.`);
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const ROMERTALL = ["", "I", "II", "III", "IV", "V"];
const fasit = JSON.parse(fs.readFileSync(path.join(BILDER, "_fasit.json"), "utf8"));
const husket = fs.existsSync(HUSK) ? JSON.parse(fs.readFileSync(HUSK, "utf8")) : {};

// slug -> _id for kunstnerne som allerede ligger i Sanity
const kunstnere = await client.fetch(`*[_type == "kunstner"]{_id, navn, "slug": slug.current}`);
const etterSlug = Object.fromEntries(kunstnere.map((k) => [k.slug, k]));
console.log(`Fant ${kunstnere.length} kunstnere i Sanity.\n`);

const mangler = [...new Set(fasit.map((v) => v.slug))].filter((s) => !etterSlug[s]);
if (mangler.length) {
  console.error("Disse slugene finnes ikke i Sanity, og verkene deres hoppes over:");
  mangler.forEach((s) => console.error("  " + s));
  console.error("");
}

let lagt = 0, hoppet = 0;
for (const v of fasit) {
  const k = etterSlug[v.slug];
  if (!k) { hoppet++; continue; }

  const tittel = `Registerdrift ${ROMERTALL[v.nr] || v.nr}`;
  const docId = `verk-registerdrift-${v.slug}-${v.nr}`;
  const linje = `${tittel.padEnd(18)} ${k.navn}`;

  if (TORR) { console.log("ville lagt inn:  " + linje); lagt++; continue; }

  let assetId = husket[v.fil];
  if (!assetId) {
    const asset = await client.assets.upload("image", fs.createReadStream(path.join(BILDER, v.fil)), {
      filename: v.fil,
      title: `${tittel} — ${k.navn}`,
    });
    assetId = asset._id;
    husket[v.fil] = assetId;
    fs.writeFileSync(HUSK, JSON.stringify(husket, null, 1));
  }

  await client.createOrReplace({
    _id: docId,
    _type: "verk",
    tittel,
    kunstner: { _type: "reference", _ref: k._id },
    bilde: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      alt: `Abstrakt grafisk trykk i ${v.palett.toLowerCase()}-toner`,
    },
    teknikk: "annet",
    status: "tilgjengelig",
    beskrivelse:
      "Midlertidig plassholder. Generativ grafikk fra serien Registerdrift, ikke et verk av kunstneren. Byttes ut når ekte verksbilder foreligger.",
  });
  lagt++;
  console.log(`lagt inn:  ${linje}`);
}

console.log(`\n${lagt} verk ${TORR ? "ville blitt lagt inn" : "lagt inn"}, ${hoppet} hoppet over.`);
if (!TORR) console.log("Sjekk /galleri og en kunstnerside.");
