import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { struktur } from "./src/sanity/structure";

// Prosjekt-ID-en må kunne leses fra to helt ulike verdener.
//
// I nettleseren og i Astro-bygget kommer den fra Vite, som `import.meta.env`.
// Når Sanity-CLI-en laster denne fila i Node, finnes ikke `import.meta.env` i
// det hele tatt, og da falt vi før tilbake på "placeholder". Resultatet var at
// `npx sanity schemas deploy` spurte Sanity om et prosjekt som ikke finnes og
// svarte «Not Found - Project not found». Observert 15. august 2026.
//
// `sanity.cli.ts` legger verdiene inn i process.env når CLI-en kjører, så
// Node-veien under finner dem. Se den fila.
const fraVite: Record<string, string | undefined> =
  (import.meta as any).env ?? {};
const fraNode: Record<string, string | undefined> =
  typeof process !== "undefined" ? (process.env as any) : {};

const prosjektId =
  fraVite.PUBLIC_SANITY_PROJECT_ID ||
  fraNode.PUBLIC_SANITY_PROJECT_ID ||
  "placeholder";

const datasett =
  fraVite.PUBLIC_SANITY_DATASET ||
  fraNode.PUBLIC_SANITY_DATASET ||
  "production";

export default defineConfig({
  name: "artz",
  title: "ARTZ",
  basePath: "/admin",
  projectId: prosjektId,
  dataset: datasett,

  // Norsk grensesnitt. Alt eieren ser skal være på norsk.
  i18n: { bundles: [] },
  plugins: [
    structureTool({ title: "Innhold", structure: struktur }),
    nbNOLocale(),
  ],

  schema: {
    types: schemaTypes,
    // Skjul "opprett ny"-snarveier vi ikke vil ha i menyen.
    // «innstillinger» er et enkeltdokument med fast ID og skal aldri kunne
    // opprettes fra pluss-knappen. Da ville det blitt to av dem, og bare det
    // ene ville vist seg på nettstedet.
    templates: (maler) =>
      maler.filter(
        (m) => !m.id.startsWith("verk-by-") && m.id !== "innstillinger"
      ),
  },

  // Studio starter på norsk uansett nettleserspråk.
  defaultLocale: "nb-NO",
});
