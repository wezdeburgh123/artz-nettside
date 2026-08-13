"""
Bygger NDJSON for import av demoinnhold til Sanity.

Alle dokumenter får _id med prefikset "demo-". Ingen punktum: 13. august
2026 gjorde punktum i dokument-ID-er 21 kunstnere usynlige, og den
erfaringen er ikke verdt å gjenta for et testdatasett.

Kunstnernavnene starter med DEMO. Det er ikke pent, og det er meningen.
Oppdiktede kunstnernavn som ser ekte ut har allerede stått på forsiden
én gang i dette prosjektet.
"""
import json
from pathlib import Path

UT = Path("/home/claude/demoinnhold")
(UT / "bilder").mkdir(parents=True, exist_ok=True)

KUNSTNERE = [
    ("demo-kunstner-a", "DEMO Kunstner A", None,
     "Testprofil. Denne kunstneren finnes ikke, og teksten er her bare for "
     "å fylle plassen slik en ekte profil ville gjort."),
    ("demo-kunstner-b", "DEMO Kunstner B", "1940–2016",
     "Testprofil med levetid, så oppsettet for avdøde kunstnere blir prøvd."),
    ("demo-kunstner-c", "DEMO Kunstner C", None, None),
]

# tittel, kunstner, teknikk, år, mål, opplag, status, beskrivelse, framhevet
VERK = [
    ("Komposisjon i grått", "a", "litografi", "2019", "50 x 70 cm", "45 eksemplarer", "tilgjengelig", "Et arbeid fra en serie om lys og flate.\n\nTrykket ved Grafikksenteret i Oslo.", True),
    ("Feltstudie", "a", "serigrafi", "2021", "70 x 50 cm", "30 eksemplarer", "tilgjengelig", None, True),
    ("Horisont I", "a", "etsning", "2018", "40 x 40 cm", None, "solgt", "Første del av et arbeid i to deler.", False),
    ("Horisont II", "a", "etsning", "2018", "40 x 40 cm", None, "tilgjengelig", "Andre del av et arbeid i to deler.", False),
    ("Uten tittel", "a", "tresnitt", None, None, None, "tilgjengelig", None, False),
    ("Studie i okergult", "a", "akvarell", "2023", "32 x 24 cm", "unikt verk", "tilgjengelig", None, True),
    ("Vinterflate", "b", "oljemaleri", "2015", "120 x 100 cm", "unikt verk", "solgt", "Et større arbeid fra de siste årene.", True),
    ("Nattstykke", "b", "oljemaleri", "2012", "90 x 90 cm", "unikt verk", "tilgjengelig", None, False),
    ("Uten tittel", "b", "tegning", "2009", "29 x 21 cm", None, "tilgjengelig", None, False),
    ("Bevegelse mot venstre", "b", "litografi", "2011", "56 x 76 cm", "60 eksemplarer", "tilgjengelig", "Motivet går igjen i flere arbeider fra samme periode.", True),
    ("Rom med lys", "b", "akrylmaleri", "2014", "100 x 100 cm", "unikt verk", "tilgjengelig", None, False),
    ("Stille time", "b", "litografi", "2016", "45 x 60 cm", "40 eksemplarer", "solgt", None, False),
    ("Fragment", "c", "skulptur", "2022", "38 cm høy", "8 eksemplarer", "tilgjengelig", "Bronse med mørk patina.", True),
    ("Skygge over vann", "c", "fotografi", "2024", "60 x 45 cm", "12 eksemplarer", "tilgjengelig", None, False),
    ("Tre felt", "c", "serigrafi", "2020", "70 x 100 cm", "25 eksemplarer", "tilgjengelig", None, False),
    ("Etterbilde", "c", "annet", "2025", None, None, "tilgjengelig", "Blandet teknikk på papir.", False),
    ("Morgen", "c", "akvarell", "2023", "24 x 32 cm", "unikt verk", "solgt", None, False),
    ("Uten tittel", "c", "tegning", None, "42 x 30 cm", None, "tilgjengelig", None, False),
]


def blokker(nokkel, tekst):
    if not tekst:
        return None
    return [
        {
            "_type": "block",
            "_key": f"{nokkel}-b{i}",
            "style": "normal",
            "markDefs": [],
            "children": [
                {"_type": "span", "_key": f"{nokkel}-s{i}", "text": avsnitt, "marks": []}
            ],
        }
        for i, avsnitt in enumerate(tekst.split("\n\n"))
    ]


linjer = []

for _id, navn, levetid, presentasjon in KUNSTNERE:
    dok = {
        "_id": _id,
        "_type": "kunstner",
        "navn": navn,
        "slug": {"_type": "slug", "current": _id},
        "framhevet": False,
    }
    if levetid:
        dok["levetid"] = levetid
    tekst = blokker(_id, presentasjon)
    if tekst:
        dok["presentasjon"] = tekst
    linjer.append(dok)

for i, (tittel, k, teknikk, aar, maal, opplag, status, beskrivelse, framhevet) in enumerate(VERK, 1):
    fil = f"demo-verk-{i:02d}.jpg"
    dok = {
        "_id": f"demo-verk-{i:02d}",
        "_type": "verk",
        "tittel": tittel,
        "bilde": {
            "_type": "image",
            "_sanityAsset": f"image@file://./bilder/{fil}",
            "alt": f"Abstrakt demobilde merket DEMO. Står for «{tittel}».",
        },
        "kunstner": {"_type": "reference", "_ref": f"demo-kunstner-{k}"},
        "status": status,
        "framhevet": framhevet,
    }
    if teknikk:
        dok["teknikk"] = teknikk
    if aar:
        dok["aar"] = aar
    if maal:
        dok["maal"] = maal
    if opplag:
        dok["opplag"] = opplag
    tekst = beskrivelse
    if tekst:
        dok["beskrivelse"] = tekst
    linjer.append(dok)

sti = UT / "demoinnhold.ndjson"
with open(sti, "w", encoding="utf-8") as f:
    for dok in linjer:
        f.write(json.dumps(dok, ensure_ascii=False) + "\n")

print(f"{len(linjer)} dokumenter til {sti}")
print(f"  {len(KUNSTNERE)} kunstnere, {len(VERK)} verk")
print(f"  framhevet: {sum(1 for v in VERK if v[8])}")
print(f"  solgt: {sum(1 for v in VERK if v[6] == 'solgt')}")
