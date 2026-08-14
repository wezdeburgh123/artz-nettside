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
      "Vi samarbeider med et utvalg kunstnere og deres grafiske verksted. Utvalget er smalt med vilje, og vi selger bare arbeider vi selv står for.",
    bein: standardBein,
    tekst: null,
  },
  utsmykking: {
    _id: "standard-utsmykking",
    tittel: "Utsmykking",
    nokkel: "utsmykking",
    ingress:
      "Kunst til kontorer, institusjoner og fellesarealer. Vi velger ut verkene, rammer dem inn i eget verksted og henger dem opp. Én kontaktperson fra første befaring til ferdig vegg.",
    bilde: null,
    tekst: blokker(
      "## Vi begynner med rommet",
      "Første besøk handler om lokalet, ikke om kunsten. Hvor dagslyset faller, hva slags lys som henger i taket, hvilke farger som allerede finnes i rommet, og hvem som oppholder seg der over tid. En resepsjon folk ser i noen sekunder tåler noe annet enn en korridor de går i hver dag.",
      "## Forslaget er konkret",
      "Du får et utvalg verk med kunstnernavn, teknikk, mål og pris, satt opp mot hvilken vegg hvert verk er tenkt på. Det er lettere å si nei til et forslag enn til en idé, og vi regner med å bytte ut noe underveis.",
      "## Grafikk gjør at budsjettet rekker lenger",
      "Mye av det vi formidler er original grafikk i opplag: litografi, tresnitt, etsning og silketrykk. Signerte originalverk, til en brøkdel av hva et unikat koster. Skal tjue vegger fylles og ikke én, er det ofte forskjellen på et par bilder og et helt bygg.",
      "## Rammen lages hos oss",
      "Innrammingen er ikke satt bort. Ramme, passepartout og glass velges til det enkelte verket og til rommet det skal henge i. Henger bildene i sterkt dagslys, eller i et fellesareal der folk kommer nær dem, sier vi fra om hva slags glass og oppheng som gjelder.",
      "## Kunstnerne",
      "Vi jobber med et utvalg kunstnere framfor et bredt lager. Blant dem Nico Widerberg, Elling Reitan, Frank Brunner, Sverre Bjertnæs, Bjørg Thorhallsdottir, Gunn Vottestad og Arjuna Geir Aasehaug. Hele lista ligger under Kunstnere.",
      "## Skal de ansatte kjøpe selv?",
      "Da er det salgsutstilling framfor utsmykking. Vi rigger en utstilling i deres egne lokaler, der de som vil kan kjøpe direkte. Mange gjør begge deler: noen verk til fellesarealene, og en utstilling for dem som vil ha noe med hjem.",
      "## Slik kommer vi raskt i gang",
      "Vi svarer raskere hvis du har dette klart:",
      "- Hva slags lokale det er, og omtrent hvor mange vegger",
      "- Når kunsten skal henge",
      "- En budsjettramme å regne på. Er du usikker, si det, så foreslår vi to nivåer",
      "- Om dere har kunst fra før som det nye skal henge sammen med"
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
