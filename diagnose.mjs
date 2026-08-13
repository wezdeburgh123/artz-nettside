import { createClient } from "@sanity/client";

const grunn = {
  projectId: "oe6d51b6",
  dataset: "production",
  apiVersion: "2026-08-13",
  useCdn: false,
};

const c = createClient(grunn);

console.log("=== klientversjon og oppsett ===");
console.log(JSON.stringify(c.config(), null, 1));

console.log("\n=== samme spørring, ulike perspektiv ===");
for (const p of [undefined, "published", "drafts", "raw"]) {
  const klient = p ? createClient({ ...grunn, perspective: p }) : c;
  try {
    const n = await klient.fetch('count(*[_type=="kunstner"])');
    console.log(`perspective=${p ?? "(standard)"} -> ${n}`);
  } catch (e) {
    console.log(`perspective=${p ?? "(standard)"} -> FEIL: ${e.message}`);
  }
}

console.log("\n=== hva slags dokumenter finnes i det hele tatt ===");
try {
  const alt = await createClient({ ...grunn, perspective: "raw" }).fetch(
    '*[]{_id, _type}'
  );
  console.log("antall totalt:", alt.length);
  console.log(alt.slice(0, 5));
} catch (e) {
  console.log("FEIL:", e.message);
}

console.log("\n=== URL-en klienten faktisk bruker ===");
console.log(c.getUrl(`/data/query/production?query=${encodeURIComponent('count(*[_type=="kunstner"])')}`, false));
