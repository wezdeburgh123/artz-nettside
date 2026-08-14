// Standardtekst for de faste sidene.
//
// Dette er reservetekst som vises til ARTZ har lagt inn sin egen i Sanity.
// Alt her er faktisk riktig om ARTZ, hentet fra det gamle nettstedet og
// verkstedomtalen i arkivet. Ingenting er oppdiktet, fordi denne teksten kan
// bli synlig på et publisert nettsted.
//
// Skal erstattes av godkjent tekst i bolk 1. Se claude/artz-overordnet-plan.md.
//
// MERK: det finnes ingen reservetekst for kunstnere, verk eller aktuelt.
// Det er med vilje. Oppdiktede kunstnernavn og verk skal aldri kunne vises
// på et nettsted som selger ekte kunst. Er Sanity tom, viser sidene tomt.

function avsnitt(...tekster: string[]) {
  return tekster.map((t, i) => ({
    _type: "block",
    _key: `b${i}`,
    style: "normal",
    children: [{ _type: "span", _key: `s${i}`, text: t, marks: [] }],
    markDefs: [],
  }));
}

// De tre boksene under aapningen paa forsiden. Ligger her og ikke i
// index.astro fordi de nå kan overstyres fra Sanity, og reserven skal komme
// fra samme sted som resten av reserveteksten. Formen som tegnes ved siden
// av hver boks bestemmes av hvilken side den peker til, se index.astro.
export const standardBein = [
  {
    _key: "bein-kunst",
    tittel: "Kunst",
    tekst:
      "Original grafikk, malerier og skulptur fra kunstnerne vi samarbeider med. Salgsutstillinger for bedrifter og kunstforeninger.",
    lenke: "/galleri",
  },
  {
    _key: "bein-utsmykking",
    tittel: "Utsmykking",
    tekst:
      "Vi setter sammen, rammer inn og henger opp kunst til kontorer, institusjoner og fellesarealer.",
    lenke: "/utsmykking",
  },
  {
    _key: "bein-ramme",
    tittel: "Rammeverksted",
    tekst:
      "Komplett og moderne rammeverksted. Håndlagde rammer i høy kvalitet, tilpasset hvert verk.",
    lenke: "/rammeverkstedet",
  },
];

const sider: Record<string, any> = {
  forside: {
    _id: "standard-forside",
    tittel: "Kunst, utsmykking og håndlagde rammer",
    nokkel: "forside",
    ingress:
      "ARTZ formidler samtidskunst til bedrifter, kunstforeninger og private. Vi arrangerer salgsutstillinger, tar utsmykkingsoppdrag og har eget rammeverksted.",
    bilde: null,
    // Setningen sto tidligere som et vanlig avsnitt i tekst. Den er flyttet
    // hit fordi den nå settes som uthevet sitat på forsiden. Ordlyden er
    // uendret, og den er hentet fra ARTZ' egen omtale i arkivet.
    sitat:
      "Vi samarbeider med et utvalg kunstnere og deres grafiske verksted. Utvalget er smalt med vilje, og vi selger bare arbeider vi selv står for.",
    bein: standardBein,
    tekst: null,
  },
  utsmykking: {
    _id: "standard-utsmykking",
    tittel: "Utsmykking",
    nokkel: "utsmykking",
    ingress:
      "Vi hjelper bedrifter og institusjoner med å velge kunst til lokalene, fra første befaring til ferdig opphengt vegg.",
    bilde: null,
    tekst: avsnitt(
      "Et utsmykkingsoppdrag starter med en gjennomgang av rommene. Vi ser på lys, farger, bruk og hvem som skal oppholde seg der.",
      "Deretter setter vi sammen et forslag med verk fra kunstnerne vi samarbeider med, rammer det inn i eget verksted og henger det opp."
    ),
  },
  rammeverkstedet: {
    _id: "standard-ramme",
    tittel: "Rammeverkstedet",
    nokkel: "rammeverkstedet",
    ingress:
      "Komplett og moderne rammeverksted med håndlagde rammer i høy kvalitet.",
    bilde: null,
    tekst: avsnitt(
      "Vi lager rammer for grafikk, malerier, fotografi, speil og tekstil. Alt måles opp og settes sammen for hånd.",
      "Ta kontakt for pris. Har du målene på verket klare, går det raskere å svare."
    ),
  },
  grafikksenteret: {
    _id: "standard-grafikk",
    tittel: "Grafikksenteret i Oslo",
    nokkel: "grafikksenteret",
    ingress:
      "Grafisk kunsttrykkeri etablert i 1968, i Gamlebyen siden 1990.",
    bilde: null,
    tekst: avsnitt(
      "Verkstedet trykker litografier etter håndverkstradisjon, blant annet på en trykkpresse for stentrykk som er over hundre år gammel."
    ),
  },
  kontakt: {
    _id: "standard-kontakt",
    tittel: "Kontakt",
    nokkel: "kontakt",
    ingress: "Ta kontakt på post@artz.no, eller bruk skjemaet under.",
    bilde: null,
    tekst: null,
  },
  om: {
    _id: "standard-om",
    tittel: "Om ARTZ",
    nokkel: "om",
    ingress:
      "ARTZ formidler samtidskunst, tar utsmykkingsoppdrag og driver eget rammeverksted.",
    bilde: null,
    tekst: null,
  },
};

export const sideMedNokkel = (nokkel: string) => sider[nokkel] ?? null;
