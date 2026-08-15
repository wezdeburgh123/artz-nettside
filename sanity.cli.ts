import { defineCliConfig } from "sanity/cli";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

// loadEnv returnerer bare et objekt, den rører ikke process.env. Uten dette
// ser ikke `sanity.config.ts` verdiene når CLI-en laster den i Node, og
// workspacet ender med projectId "placeholder". Se kommentaren der.
for (const [navn, verdi] of Object.entries(env)) {
  if (process.env[navn] === undefined) process.env[navn] = verdi;
}

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = env;

export default defineCliConfig({
  api: {
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET || "production",
  },
});
