import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { loadEnv } from "vite";

// Astro-konfigen kjører før Astros egen env-lasting, så vi leser .env selv.
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  ""
);

// Prosjekt-ID-en leses både fra .env via loadEnv og direkte fra miljøet,
// fordi Netlify leverer den som en ren miljøvariabel uten .env-fil.
const prosjektId =
  PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || "";
const datasett =
  PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || "production";

// Mangler ID-en i et produksjonsbygg, skal bygget stoppe her.
//
// 14. august 2026 lå nettstedet ute med alt innhold borte fordi variabelen
// ikke var satt i Netlify. Bygget var grønt hele veien, siden konfigurasjonen
// falt stille tilbake til «placeholder» og sidene bare viste et varselbånd.
// Et rødt bygg er billigere enn en tom kunstnerside i produksjon.
const erProduksjonsbygg =
  Boolean(process.env.NETLIFY) || process.env.NODE_ENV === "production";

if (erProduksjonsbygg && !prosjektId) {
  throw new Error(
    [
      "PUBLIC_SANITY_PROJECT_ID mangler i byggemiljoet.",
      "Uten den bygger nettstedet uten innhold.",
      "Netlify: Site configuration -> Environment variables. Verdi: oe6d51b6.",
      "Scope maa omfatte Builds. Deploy deretter paa nytt med toemt cache.",
    ].join(" ")
  );
}

export default defineConfig({
  // SSR. Publiserte endringer i Sanity er synlige ved neste sidelasting,
  // uten at nettstedet må bygges på nytt. Se gjennomgangsnotatet, punkt 1.
  output: "server",
  adapter: netlify(),
  site: "https://artz.no",
  // Utviklingsverktøylinja er ikke til nytte for noen i dette prosjektet.
  devToolbar: { enabled: false },
  integrations: [
    sanity({
      projectId: prosjektId || "placeholder",
      dataset: datasett,
      // Ikke CDN.
      //
      // Oppdaget 13. august 2026: etter import av 21 kunstnere svarte
      // live-API-et 21 mens apicdn svarte 0, og nettstedet viste tomt i
      // flere minutter. CDN-et hadde en gammel respons liggende.
      //
      // Hele grunnen til at vi valgte SSR var at en publisering skal være
      // synlig med én gang. Et CDN som kan ligge etter med ukjent tid
      // river vekk det premisset. Vi betaler heller litt responstid per
      // sidevisning. På dette trafikknivået merkes det ikke.
      //
      // Skal dette skaleres senere: CDN på igjen, kombinert med
      // cache-invalidering fra en Sanity-webhook. Ikke før.
      useCdn: false,
      apiVersion: "2026-08-13",
      // Henger Sanity, skal sida vise tomt framfor å bli stående.
      timeout: 8000,
      // Studio ligger på artz.no/admin. Én adresse eieren kan bokmerke.
      studioBasePath: "/admin",
    }),
    react(),
  ],
});
