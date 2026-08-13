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
      projectId: PUBLIC_SANITY_PROJECT_ID || "placeholder",
      dataset: PUBLIC_SANITY_DATASET || "production",
      useCdn: true,
      apiVersion: "2026-08-13",
      // Henger Sanity, skal sida vise demoinnhold framfor å bli stående.
      timeout: 8000,
      // Studio ligger på artz.no/admin. Én adresse eieren kan bokmerke.
      studioBasePath: "/admin",
    }),
    react(),
  ],
});
