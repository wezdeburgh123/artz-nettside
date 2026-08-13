// Lager NDJSON for import av kunstnere til Sanity.
// Kilde: claude/artz-kunstnerliste.md og claude/artz-innholdsbank.md.
// Tekstene er ordrett fra innholdsbanken, som igjen er språkrettet arkivtekst.

import { writeFileSync } from "node:fs";

function slug(navn) {
  return navn
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ø", "o")
    .replaceAll("å", "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Portable Text med stabile nøkler, utledet av slug og posisjon.
function tekst(id, avsnitt) {
  return avsnitt.map((t, i) => ({
    _type: "block",
    _key: `${id}-b${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${id}-s${i}`, text: t, marks: [] }],
  }));
}

const PLASSHOLDER = ["Profiltekst kommer."];

// Gruppe A: dagens kunstnere.
const gruppeA = [
  { navn: "Frank Brunner" },
  {
    navn: "Elling Reitan",
    levetid: "f. 1949",
    avsnitt: [
      "Elling Reitan er utdannet innen litteraturhistorie og filosofi. Han har vært elev av Odd Nerdrum, undervist i form og farge og gått i lære i grafikk hos Bjørn Sverbo.",
      "Elling Reitan jobber med maleri og grafikk. Han lager stemningsfulle og ofte dramatiske allegorier som trer fram på fargerik måte. Reitan betegnes som en kolorist. Motivene hans inneholder en rekke symboler og elementer som går igjen, som hans varemerke yin og yang, eller et bilde i bildet.",
    ],
  },
  {
    navn: "Nico Widerberg",
    levetid: "f. 1960",
    avsnitt: [
      "Nico Widerberg er utdannet ved Statens Håndverks- og Kunstindustriskole og har studert skulptur under Boge Berg ved Statens Kunstakademi.",
      "Nico Widerberg er en av Norges mest anerkjente skulptører. Han arbeider med stein, ofte granitt, glass og bronse. Han lager skulpturer i klassisk figurativ tradisjon, og uttrykket fra skulpturene videreføres i maleri og grafikk. I grafikken finner man gjennom fargen igjen den dynamikken som preger skulpturene hans.",
    ],
  },
  { navn: "Sverre Bjertnæs" },
  {
    navn: "Bjørg Thorhallsdottir",
    levetid: "f. 1974",
    avsnitt: [
      "Bjørg Thorhallsdottir er en av landets mest populære grafikere. Hun er utdannet ved Kunsthøyskolen i Reykjavik, har grafisk design fra Oslo og to år ved Asker kunstskole, før hun kom inn på Kunstakademiet i Barcelona, Bellas Artes. Hun har også studert ved kunstakademiet i Toulouse.",
      "Bjørg jobber med grafikk, maleri, blyglass og mosaikk. I tillegg har hun illustrert flere bøker. Bildene hennes er svært uttrykksfulle og lette å kjenne seg igjen i. Kjærlighet er en viktig gjenganger, og hun når et bredt publikum.",
      "Bjørg har atelier i Barcelona, hvor hun også trykker bildene sine.",
    ],
  },
  { navn: "Mia Gjerdrum Helgesen" },
  { navn: "Cathrine Knudsen" },
  { navn: "Rolf Sørensen" },
  { navn: "Nina Due" },
  { navn: "Arjuna Geir Aasehaug" },
  {
    navn: "Merete Sejersted Bødtker",
    avsnitt: [
      "Merete Sejersted Bødtker er en norsk tegner og billedhugger, bosatt i Trysil. Hun er utdannet fra Myndlista & Handíðaskólinn på Island, innen keramikk fra SHKS 1979–87, innen skulptur fra Statens kunstakademi og deretter ved New York Academy of Figurative Art.",
    ],
  },
  { navn: "Gunn Vottestad" },
  { navn: "Dag Hol" },
  { navn: "Jarle Rosseland" },
  { navn: "Jan Svendsen" },
  { navn: "Even Richardson" },
];

// Gruppe B: kunstnere ARTZ har formidlet tidligere. Årstallet er markeringen.
const gruppeB = [
  {
    navn: "Per Morten Karlsen",
    levetid: "1952–2018",
    avsnitt: [
      "Per Morten Karlsen var maler og grafiker, utdannet ved Kunstskolen i Trondheim og Statens Kunstakademi i Oslo.",
      "Han arbeidet med akvareller, oljemalerier og grafikk. Bildene er kraftfulle, men har ofte en forenklet strek. Han benyttet sterke fargekontraster, og motivene er ofte dyr. I dyrebildene er bevegelse et sentralt element.",
    ],
  },
  {
    navn: "Eva Langaas",
    levetid: "1940–2016",
    avsnitt: [
      "Eva Langaas var opprinnelig utdannet tekstilkunstner, men hadde over tjue års erfaring som grafiker.",
      "Hun laget kraftfulle og fargesterke bilder med utgangspunkt i naturen. Bildene er på grensen til det abstrakte, men gir likevel sterke naturopplevelser. Hun vekket mange følelser med bildene sine og var en av våre mest populære kunstnere.",
      "Eva Langaas hadde atelier hos Grafikksenteret i Gamlebyen.",
    ],
  },
  {
    navn: "Ludvig Eikaas",
    // Årstall mangler. Åpent avvik. Teksten står i presens til det er avklart.
    avsnitt: [
      "Ludvig Eikaas er utdannet ved Kunstakademiet i København, Kunstakademiet og Statens Håndverks- og Kunstindustriskole.",
      "Han jobber med maleri og grafikk. Han har en utpreget sans for det stofflige i bildene sine, sammen med en enkelhet i komposisjon og koloritt.",
    ],
  },
  {
    navn: "Jørgen Holen",
    levetid: "f. 1947",
    avsnitt: [
      "Jørgen Holen har en allsidig bakgrunn. Han er opprinnelig utdannet formingslærer, men har jobbet som utøvende kunstner og knivmaker siden 1993. Han er kjent som en av landets fremste knivmakere, og knivene hans kan nesten regnes som smykker.",
      "I bildene har Jørgen Holen sterke, fargerike uttrykk, både i oljemaleriene og litografiene. Han bygger bildene opp lag på lag, til han har oppnådd det uttrykket han ønsker. Fargebruken er det viktigste. Han bruker stort sett tre farger, i tillegg til svart og hvitt, og blander de tre hovedfargene ut i utallige nyanser.",
      "Naturen er hans største inspirasjonskilde, og bildene har et abstrakt uttrykk.",
    ],
  },
  { navn: "Kai Fjell", levetid: "1907–1989" },
];

const alle = [...gruppeA, ...gruppeB];

const dokumenter = alle.map((k) => {
  const s = slug(k.navn);
  return {
    // Fast ID, så importen kan kjøres på nytt uten å lage duplikater.
    _id: `kunstner.${s}`,
    _type: "kunstner",
    navn: k.navn,
    slug: { _type: "slug", current: s },
    ...(k.levetid ? { levetid: k.levetid } : {}),
    presentasjon: tekst(s, k.avsnitt ?? PLASSHOLDER),
    framhevet: false,
  };
});

const ndjson = dokumenter.map((d) => JSON.stringify(d)).join("\n") + "\n";
writeFileSync("kunstnere.ndjson", ndjson);

console.log(`Skrev ${dokumenter.length} kunstnere til kunstnere.ndjson`);
console.log("Med tekst:", dokumenter.filter((d) => d.presentasjon[0].children[0].text !== "Profiltekst kommer.").length);
console.log("Plassholder:", dokumenter.filter((d) => d.presentasjon[0].children[0].text === "Profiltekst kommer.").length);
console.log("\nSlugger:");
dokumenter.forEach((d) => console.log(" ", d.slug.current, "  <-", d.navn));
