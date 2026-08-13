import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import * as standard from "./standardtekst";

const harSanity =
  Boolean(import.meta.env.PUBLIC_SANITY_PROJECT_ID) &&
  import.meta.env.PUBLIC_SANITY_PROJECT_ID !== "placeholder";

// ---------------------------------------------------------------------------
// Regel for reserveinnhold, satt 13. august 2026:
//
// Kunstnere, verk og aktuelt har INGEN reserve. Er Sanity tom eller nede,
// viser sidene tomt. Grunnen: oppdiktede kunstnernavn og verk skal aldri
// kunne stå på et nettsted som selger ekte kunst. Det skjedde en gang under
// oppsettet, og forsiden viste «Sigrid Moland» som om hun var reell.
//
// Faste sider har reservetekst, fordi en side helt uten tekst er verre enn
// en side med sann standardtekst. Alt i standardtekst.ts er faktisk riktig
// om ARTZ.
// ---------------------------------------------------------------------------

async function hent<T>(
  query: string,
  params: Record<string, unknown>,
  tomVerdi: T
): Promise<T> {
  if (!harSanity) return tomVerdi;
  try {
    const svar = await sanityClient.fetch<T>(query, params);
    return svar ?? tomVerdi;
  } catch (feil) {
    console.warn("Kunne ikke hente fra Sanity:", feil);
    return tomVerdi;
  }
}

const KUNSTNER_FELT = `
  _id,
  navn,
  levetid,
  "slug": slug.current,
  portrett,
  presentasjon,
  framhevet
`;

const VERK_FELT = `
  _id,
  tittel,
  bilde,
  teknikk,
  aar,
  maal,
  opplag,
  status,
  beskrivelse,
  framhevet,
  "kunstner": kunstner->{navn, "slug": slug.current}
`;

export const alleKunstnere = () =>
  hent<any[]>(
    defineQuery(`*[_type == "kunstner"] | order(navn asc){${KUNSTNER_FELT}}`),
    {},
    []
  );

export const kunstnerMedSlug = (slug: string) =>
  hent<any | null>(
    defineQuery(`*[_type == "kunstner" && slug.current == $slug][0]{
      ${KUNSTNER_FELT},
      "verk": *[_type == "verk" && references(^._id)] | order(_createdAt desc){${VERK_FELT}}
    }`),
    { slug },
    null
  );

export const alleVerk = () =>
  hent<any[]>(
    defineQuery(`*[_type == "verk"] | order(_createdAt desc){${VERK_FELT}}`),
    {},
    []
  );

// Er ingen verk merket «vis på forsiden», tar vi de seks nyeste framfor
// ingenting. Da slipper eieren å huske avkrysningen for at forsiden skal leve.
export const framhevedeVerk = async () => {
  const framhevede = await hent<any[]>(
    defineQuery(
      `*[_type == "verk" && framhevet == true] | order(_createdAt desc)[0...6]{${VERK_FELT}}`
    ),
    {},
    []
  );
  if (framhevede.length > 0) return framhevede;

  return hent<any[]>(
    defineQuery(
      `*[_type == "verk"] | order(_createdAt desc)[0...6]{${VERK_FELT}}`
    ),
    {},
    []
  );
};

export const alleSaker = () =>
  hent<any[]>(
    defineQuery(`*[_type == "aktuelt"] | order(dato desc){
      _id, tittel, "slug": slug.current, dato, sted, bilde, ingress
    }`),
    {},
    []
  );

export const sakMedSlug = (slug: string) =>
  hent<any | null>(
    defineQuery(`*[_type == "aktuelt" && slug.current == $slug][0]{
      _id, tittel, "slug": slug.current, dato, sted, bilde, ingress, tekst
    }`),
    { slug },
    null
  );

// Faste sider: standardtekst når Sanity ikke har siden ennå.
export const sideMedNokkel = async (nokkel: string) => {
  const fraSanity = await hent<any | null>(
    defineQuery(`*[_type == "side" && nokkel == $nokkel][0]{
      _id, tittel, nokkel, ingress, bilde, tekst
    }`),
    { nokkel },
    null
  );
  return fraSanity ?? standard.sideMedNokkel(nokkel);
};

// ---------------------------------------------------------------------------
// Status på datasettet, brukt til varselbåndet på toppen av nettstedet.
// ---------------------------------------------------------------------------

export type DatasettStatus =
  | "ikke-koblet"
  | "utilgjengelig"
  | "tomt"
  | "har-innhold";

let statusHurtiglager: { verdi: DatasettStatus; utloper: number } | null = null;
const STATUS_LEVETID_MS = 30_000;

export async function datasettStatus(): Promise<DatasettStatus> {
  if (!harSanity) return "ikke-koblet";

  const naa = performance.now();
  if (statusHurtiglager && statusHurtiglager.utloper > naa) {
    return statusHurtiglager.verdi;
  }

  let verdi: DatasettStatus;
  try {
    const antall = await sanityClient.fetch<number>(
      `count(*[_type in ["kunstner", "verk", "aktuelt", "side"]])`
    );
    verdi = antall > 0 ? "har-innhold" : "tomt";
  } catch (feil) {
    console.warn("Sanity svarte ikke på statussjekk:", feil);
    verdi = "utilgjengelig";
  }

  statusHurtiglager = { verdi, utloper: naa + STATUS_LEVETID_MS };
  return verdi;
}

export const TEKNIKK_NAVN: Record<string, string> = {
  litografi: "Litografi",
  serigrafi: "Serigrafi",
  etsning: "Etsning",
  tresnitt: "Tresnitt",
  oljemaleri: "Oljemaleri",
  akrylmaleri: "Akrylmaleri",
  akvarell: "Akvarell",
  tegning: "Tegning",
  skulptur: "Skulptur",
  fotografi: "Fotografi",
  annet: "Annet",
};

export { harSanity };
