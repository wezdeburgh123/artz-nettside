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
  presentasjon
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
  plassholder,
  "kunstner": kunstner->{navn, "slug": slug.current}
`;

// Registerdrift-plassholderne har dokument-ID på formen
// verk-registerdrift-<slug>-<nr>. Se claude/artz-plassholderbilder.md.
// Vurderingen gjores i JavaScript og ikke i GROQ, slik at en feil her gir
// feil bilde og ikke en tom kunstnerliste.
// Feltet «plassholder» på verket er fasit. ID-prefikset er reserve, for de
// tilfellene der feltet ikke er satt ennå. Se verk-skjemaet.
const erPlassholder = (verk: any) =>
  verk?.plassholder === true ||
  (typeof verk?._id === "string" && verk._id.startsWith("verk-registerdrift-"));

export type Kortbildekilde = "portrett" | "verk" | "plassholder" | "ingen";

// Kunstnerkortet viser portrett nar det finnes. Mangler portrett, laner vi et
// verk. Ekte verk foretrekkes, generativ plassholder brukes bare nar
// kunstneren ikke har noe annet. Kilden folger med ut, slik at siden kan si
// aerlig hva den viser. Valgt 13. august 2026.
export const alleKunstnere = async () => {
  const rader = await hent<any[]>(
    defineQuery(`*[_type == "kunstner"] | order(navn asc){
      ${KUNSTNER_FELT},
      "verksbilder": *[_type == "verk" && references(^._id) && defined(bilde.asset)]
        | order(_createdAt desc)[0...6]{ _id, bilde, plassholder }
    }`),
    {},
    []
  );

  return rader.map((k: any) => {
    const verk: any[] = Array.isArray(k.verksbilder) ? k.verksbilder : [];
    const ekte = verk.find((v) => !erPlassholder(v));
    const laant = ekte ?? verk[0] ?? null;
    const harPortrett = Boolean(k?.portrett?.asset);

    const kortbildekilde: Kortbildekilde = harPortrett
      ? "portrett"
      : laant
        ? ekte
          ? "verk"
          : "plassholder"
        : "ingen";

    return {
      ...k,
      kortbilde: harPortrett ? k.portrett : (laant?.bilde ?? null),
      kortbildekilde,
    };
  });
};

// Kunstnersiden viser bare ekte verk. Et plassholderbilde skal aldri stå
// under en kunstners navn som om det var hans arbeid. Filtreringen gjøres i
// JavaScript, ikke i GROQ, slik at en feil her gir for mange verk og ikke en
// tom side. Se arbeidsreglene i prosjektminnet.
export const kunstnerMedSlug = async (slug: string) => {
  const kunstner = await hent<any | null>(
    defineQuery(`*[_type == "kunstner" && slug.current == $slug][0]{
      ${KUNSTNER_FELT},
      "verk": *[_type == "verk" && references(^._id)] | order(_createdAt desc){${VERK_FELT}}
    }`),
    { slug },
    null
  );
  if (!kunstner) return null;
  const verk = Array.isArray(kunstner.verk) ? kunstner.verk : [];
  return { ...kunstner, verk: verk.filter((v: any) => v?.plassholder !== true) };
};

export const alleVerk = () =>
  hent<any[]>(
    defineQuery(`*[_type == "verk"] | order(_createdAt desc){${VERK_FELT}}`),
    {},
    []
  );

// ---------------------------------------------------------------------------
// Adressen til ett verk.
//
// Verk har ikke slug-felt, og skal ikke få det: hvert felt André må fylle ut
// er et felt han kan glemme eller fylle feil. Adressen bygges derfor av
// tittelen, som er obligatorisk, pluss dokument-ID-en som holder den unik.
// To verk som heter «Uten tittel» kolliderer dermed ikke.
//
// Bare ID-en slår opp. Titteldelen er kosmetikk, og feil tittel i adressen
// sender besøkende videre til den riktige med 301.
//
// Gjenopprettet 13. august 2026. De tre funksjonene ble borte da to økter
// skrev på denne fila samtidig, og bygget knakk på en manglende eksport.
// ---------------------------------------------------------------------------

export function verkSlug(tittel: string | undefined): string {
  const s = (tittel ?? "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "verk";
}

export const verkUrl = (verk: any) =>
  `/verk/${verkSlug(verk?.tittel)}/${encodeURIComponent(verk?._id ?? "")}`;

export const verkMedId = (id: string) =>
  hent<any | null>(
    defineQuery(`*[_type == "verk" && _id == $id][0]{
      ${VERK_FELT},
      "andreVerk": *[_type == "verk" && kunstner._ref == ^.kunstner._ref && _id != ^._id]
        | order(_createdAt desc)[0...4]{${VERK_FELT}}
    }`),
    { id },
    null
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
      _id, tittel, nokkel, ingress, bilde, sitat, bein, tekst
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
