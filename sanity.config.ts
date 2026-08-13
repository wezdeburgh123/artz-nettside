import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { struktur } from "./src/sanity/structure";

export default defineConfig({
  name: "artz",
  title: "ARTZ",
  basePath: "/admin",
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "placeholder",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",

  // Norsk grensesnitt. Alt eieren ser skal være på norsk.
  i18n: { bundles: [] },
  plugins: [
    structureTool({ title: "Innhold", structure: struktur }),
    nbNOLocale(),
  ],

  schema: {
    types: schemaTypes,
    // Skjul "opprett ny"-snarveier vi ikke vil ha i menyen.
    templates: (maler) => maler.filter((m) => !m.id.startsWith("verk-by-")),
  },

  // Studio starter på norsk uansett nettleserspråk.
  defaultLocale: "nb-NO",
});
