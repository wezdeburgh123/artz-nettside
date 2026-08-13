import { defineMiddleware } from "astro:middleware";

// Nettverksvakt.
//
// Sanity-klienten holder tilkoblinger åpne mellom kall. Blir en slik
// tilkobling brutt av motparten, sender Node en 'error' på selve socketen
// utenom promiset vi venter på. Uten en lytter dreper det hele prosessen,
// selv om GROQ-kallet vårt allerede er fanget i try/catch.
//
// Oppdaget 13. august 2026: nettstedet krasjet i stedet for å falle tilbake
// på demoinnhold da Sanity var utilgjengelig. På et nettsted som kjører SSR
// skal en utilgjengelig Sanity gi en side uten innhold, ikke en død server.
//
// Vi svelger bare kjente nettverkskoder. Alt annet logges og lar prosessen
// avslutte, så plattformen kan starte den på nytt i en ren tilstand.

const NETTVERKSFEIL = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
]);

const vaktNokkel = Symbol.for("artz.nettverksvakt");
const globalt = globalThis as unknown as Record<symbol, boolean>;

if (!globalt[vaktNokkel]) {
  globalt[vaktNokkel] = true;

  process.on("uncaughtException", (feil: NodeJS.ErrnoException) => {
    if (feil?.code && NETTVERKSFEIL.has(feil.code)) {
      console.warn(`Nettverksfeil ignorert (${feil.code}): ${feil.message}`);
      return;
    }
    console.error("Uhåndtert feil, avslutter:", feil);
    process.exit(1);
  });

  process.on("unhandledRejection", (grunn: unknown) => {
    const kode = (grunn as NodeJS.ErrnoException)?.code;
    if (kode && NETTVERKSFEIL.has(kode)) {
      console.warn(`Nettverksfeil ignorert (${kode})`);
      return;
    }
    console.error("Uhåndtert avvisning:", grunn);
  });
}

export const onRequest = defineMiddleware(async (_kontekst, neste) => neste());
