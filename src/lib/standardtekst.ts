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

// Som avsnitt(), men med mellomtitler og punktlister. Linjer som begynner med
// "## " blir h2, linjer som begynner med "- " blir punkt i en punktliste.
// Begge deler finnes i skjemaet for Fast side, så teksten kan redigeres videre
// i Studio uten at formen går tapt.
function blokker(...linjer: string[]) {
  return linjer.map((linje, i) => {
    const erTittel = linje.startsWith("## ");
    const erPunkt = linje.startsWith("- ");
    const tekst = erTittel ? linje.slice(3) : erPunkt ? linje.slice(2) : linje;

    return {
      _type: "block",
      _key: `b${i}`,
      style: erTittel ? "h2" : "normal",
      ...(erPunkt ? { listItem: "bullet", level: 1 } : {}),
      children: [{ _type: "span", _key: `s${i}`, text: tekst, marks: [] }],
      markDefs: [],
    };
  });
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
      "Vi samarbeider med et utvalg kunstnere. Utvalget er smalt med vilje, og vi selger bare arbeider vi selv står for.",
    bein: standardBein,
    tekst: null,
  },
  utsmykking: {
    _id: "standard-utsmykking",
    tittel: "Utsmykking",
    nokkel: "utsmykking",
    ingress:
      "Kunst til kontorer, institusjoner og fellesarealer. Vi velger verkene, rammer dem inn i eget verksted og henger dem opp. Én kontaktperson hele veien.",
    bilde: null,
    punkter: [
      {
        _key: "punkt-rommet",
        tittel: "Rommet først",
        tekst:
          "Dagslys, taklys, farger som allerede er der, og hvem som er i rommet daglig. En resepsjon tåler noe annet enn en korridor.",
      },
      {
        _key: "punkt-forslaget",
        tittel: "Et forslag du kan si nei til",
        tekst:
          "Verk med kunstner, teknikk, mål og pris, satt opp mot hvilken vegg de er tenkt på. Vi regner med å bytte ut noe.",
      },
      {
        _key: "punkt-rammen",
        tittel: "Rammen lages hos oss",
        tekst:
          "Innrammingen er ikke satt bort. Ramme, passepartout og glass velges til verket og til rommet det skal henge i.",
      },
      {
        _key: "punkt-kunstnerne",
        tittel: "Kunstnerne",
        tekst:
          "Et utvalg framfor et bredt lager. Widerberg, Reitan, Brunner, Bjertnæs, Thorhallsdottir, Vottestad, Aasehaug.",
      },
    ],
    sporsmal: [
      {
        _key: "sp-pris",
        sporsmal: "Hva koster det?",
        svar: blokker(
          "Mye av det vi formidler er original grafikk i opplag: litografi, tresnitt, etsning og silketrykk. Signerte originalverk til en brøkdel av hva et unikat koster. Skal tjue vegger fylles og ikke én, er det ofte forskjellen på et par bilder og et helt bygg. Pris på forespørsel."
        ),
      },
      {
        _key: "sp-ansatte",
        sporsmal: "Skal de ansatte kjøpe selv?",
        svar: blokker(
          "Da er det salgsutstilling framfor utsmykking. Vi rigger utstillingen i deres egne lokaler, der de som vil kan kjøpe direkte. Mange gjør begge deler: noen verk til fellesarealene, og en utstilling for dem som vil ha noe med hjem."
        ),
      },
      {
        _key: "sp-forarbeid",
        sporsmal: "Hva trenger dere fra oss?",
        svar: blokker(
          "Vi svarer raskere hvis dere har dette klart:",
          "- Hva slags lokale det er, og omtrent hvor mange vegger",
          "- Når kunsten skal henge",
          "- En budsjettramme å regne på. Er dere usikre, si det, så foreslår vi to nivåer",
          "- Om dere har kunst fra før som det nye skal henge sammen med"
        ),
      },
    ],
    tekst: null,
  },
  rammeverkstedet: {
    _id: "standard-ramme",
    tittel: "Rammeverkstedet",
    nokkel: "rammeverkstedet",
    ingress:
      "Håndlagde rammer i eget verksted. Vi måler opp verket og setter rammen sammen etter det, framfor å tilpasse verket til en ferdig ramme.",
    bilde: null,
    punkter: [
      {
        _key: "ramme-verksted",
        tittel: "Alt lages her",
        tekst:
          "Rammene settes sammen i eget verksted. Det betyr at målene følger verket, også når verket ikke har standardmål.",
      },
      {
        _key: "ramme-hva",
        tittel: "Hva vi rammer inn",
        tekst:
          "Grafikk, malerier, fotografi, speil og tekstil. Du trenger ikke ha kjøpt verket hos oss.",
      },
      {
        _key: "ramme-glass",
        tittel: "Glass og passepartout",
        tekst:
          "Vi går gjennom hva verket faktisk trenger, og hva som er unødvendig for akkurat ditt bilde.",
      },
      {
        _key: "ramme-rommet",
        tittel: "Rammen hører til et rom",
        tekst:
          "Hvor bildet skal henge avgjør like mye som verket selv. Sterkt dagslys og fellesarealer stiller egne krav.",
      },
    ],
    sporsmal: [
      {
        _key: "ramme-sp-pris",
        sporsmal: "Hva koster en ramme?",
        svar: blokker(
          "Prisen avhenger av mål, listetype, glass og passepartout, så den settes per oppdrag. Ta kontakt for pris. Har du målene på verket klare, går det raskere å svare."
        ),
      },
      {
        _key: "ramme-sp-medbring",
        sporsmal: "Hva bør jeg ha klart?",
        svar: blokker(
          "Verket selv om du har mulighet, ellers målene og et bilde av det. Si gjerne fra om:",
          "- Hvor bildet skal henge, og om det står i sterkt dagslys",
          "- Om det skal henge sammen med andre bilder",
          "- Om verket har affeksjonsverdi eller er skjørt"
        ),
      },
      {
        _key: "ramme-sp-eget",
        sporsmal: "Rammer dere inn det jeg allerede har?",
        svar: blokker(
          "Ja. Arvede bilder, fotografier, plakater og tekstil rammes inn på samme måte som verk vi har formidlet selv."
        ),
      },
    ],
    tekst: null,
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

// Bunnen på nettstedet. Reserve fram til dokumentet «Bunnen på nettsiden»
// er lagt inn i Sanity, og etterpå reserve for de feltene André lar stå
// tomme. Alt her sto tidligere hardkodet i src/layouts/Base.astro.
//
// Adresse, juridisk navn og organisasjonsnummer står bevisst tomme. De er
// ikke kjent per 15. august 2026, og et oppdiktet organisasjonsnummer i
// impressum er verre enn ingen impressum.
export const standardInnstillinger = {
  beskrivelse: "Kunstformidling, utsmykking og rammeverksted.",
  epost: "post@artz.no",
  telefon: "",
  adresse: "",
  orgnavn: "",
  orgnummer: "",
  rettighetslinje: "Alle verk tilhører kunstnerne.",
};
