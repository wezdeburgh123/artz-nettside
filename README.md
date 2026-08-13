# artz.no

Nettsted for ARTZ. Astro med SSR på Netlify, innhold i Sanity.

Riggen er satt opp 13. august 2026. Den kjører på demoinnhold til Sanity kobles
på, så du kan se og vurdere designet før noe ekte innhold finnes.

**Valgene bak oppsettet står i `claude/artz-plan-gjennomgang.md` i prosjektet.**

---

## Slik ser det ut nå

- Sju sider: forside, kunstnere, verk, utsmykking, rammeverkstedet,
  grafikksenteret, aktuelt, kontakt.
- Fire innholdstyper i Sanity: Kunstner, Verk, Aktuelt, Fast side.
- Studio ligger på `/admin`. Én adresse eieren kan bokmerke.
- Demoinnholdet er tre oppdiktede kunstnere og seks verk, med vilje oppdiktet
  så ingen forveksler det med ekte innhold. Et gult varselbånd på toppen sier
  det samme, og forsvinner av seg selv når Sanity er koblet på.

---

## Kom i gang lokalt

```bash
npm install
cp .env.example .env
npm run dev
```

Åpne http://localhost:4321. Nettstedet kjører på demoinnhold, og Studio på
http://localhost:4321/admin virker først når `.env` er fylt ut.

---

## Steg 1: opprett Sanity-prosjektet

Kjør dette i prosjektmappa. Kommandoene er komplette, du skal ikke endre noe.

```bash
npx sanity login
```

Velg innloggingsmetode i nettleseren. Deretter:

```bash
npx sanity projects create "ARTZ" --dataset production --dataset-visibility public --json
```

Kommandoen skriver ut en blokk med `"id": "xxxxxxxx"`. Det er prosjekt-ID-en.
Lim den inn i `.env`:

```
PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
PUBLIC_SANITY_DATASET=production
```

Datasettet er offentlig fordi gratisplanen i Sanity ikke tilbyr private
datasett. Det betyr at alt som legges inn kan leses av hvem som helst med
prosjekt-ID-en. Derfor er det ikke noe prisfelt på verk. Se punkt 3 i
gjennomgangsnotatet.

Så åpner du Studio på nytt:

```bash
npm run dev
```

http://localhost:4321/admin skal nå vise fire menypunkter på norsk.

---

## Steg 2: GitHub og Netlify

Repoet er allerede initialisert med git, men har ingen commits. Kjør:

```bash
git add -A
git commit -m "Rigg for artz.no: Astro, Sanity, fire innholdstyper"
```

Opprett et privat repo på GitHub som heter `artz-nettside`, og koble til:

```bash
git remote add origin git@github.com:BRUKERNAVN/artz-nettside.git
git branch -M main
git push -u origin main
```

Bytt ut `BRUKERNAVN`.

I Netlify:

1. Add new site, Import an existing project, velg GitHub-repoet.
2. Byggeinnstillingene leses fra `netlify.toml`, så ikke endre noe der.
3. Under Environment variables, legg inn `PUBLIC_SANITY_PROJECT_ID` og
   `PUBLIC_SANITY_DATASET` med samme verdier som i `.env`.
4. Deploy.

Når siten er ute, legg Netlify-adressen inn som tillatt origin i Sanity, ellers
virker ikke Studio der:

```bash
npx sanity cors add https://DITT-NAVN.netlify.app --credentials
```

Og senere, ved lansering:

```bash
npx sanity cors add https://artz.no --credentials
```

---

## Steg 3: sikkerhetskopi

Gratisplanen i Sanity har 3 dagers utkasthistorikk. `.github/workflows/sikkerhetskopi.yml`
tar en full eksport hver natt og beholder den i 90 dager.

For at den skal virke må to hemmeligheter inn i GitHub-repoet under
Settings, Secrets and variables, Actions:

- `SANITY_PROJECT_ID`, samme verdi som over.
- `SANITY_AUTH_TOKEN`, en token med leserettigheter. Lag den slik:

```bash
npx sanity tokens create "Sikkerhetskopi" --role viewer
```

Tokenen vises bare én gang. Kopier den rett inn i GitHub.

Du kan også ta en kopi manuelt når som helst:

```bash
npm run eksporter
```

---

## Steg 4: koble meg til Sanity

Dette gjør at jeg kan legge inn kunstnere og verk direkte istedenfor at du
gjør det manuelt i Studio, og verifisere at schemaet faktisk ble som avtalt.

```bash
npx sanity mcp configure
npx sanity skills install
```

Første kommando setter opp Sanitys MCP-server. Andre henter Sanitys offisielle
agent-skills, som gjør at koden jeg skriver følger deres gjeldende konvensjoner
istedenfor det jeg husker fra treningsdata.

---

## Hva som gjenstår

Åpne punkter, i den rekkefølgen de bør tas:

1. **Ekte innhold.** Kunstnertekster og verksbilder fra ARTZ. Demoinnholdet i
   `src/lib/demoinnhold.ts` slettes ikke, det bare slutter å bli brukt så snart
   Sanity har innhold.
2. **Designretning.** Dette er et nøkternt utgangspunkt, ikke en ferdig
   designretning. Typografi og farger settes i `src/styles/global.css`.
3. **CDN-caching.** Nettstedet kjører SSR uten caching av HTML, som gir
   umiddelbar publisering. På dette trafikknivået er det helt greit. Skal det
   skaleres, er neste steg cache-tags i Netlify med invalidering ved
   publisering i Sanity.
4. **Kontaktskjema.** Bruker Netlify Forms. Gratis og uten grense på Netlifys
   nye kredittbaserte planer. Er kontoen en gammel plan fra før 4. september
   2025, er det en målt grense. Sjekk i Netlify under Usage & billing.
5. **Videresendinger.** `netlify.toml` har 301-er fra alle gamle URL-er i
   Wayback-arkivet. Kunstnernavnene i disse er gjettet ut fra gamle adresser,
   så de må sjekkes mot de faktiske slug-ene når kunstnerne er lagt inn.
6. **Eierskap til kontoer.** Sanity, Netlify og GitHub bør stå på en
   artz.no-adresse med deg som medlem, ikke motsatt.
7. **Bilderettigheter.** Ikke løst. Må avklares med kunstnerne før verk
   publiseres.

---

## Nyttige kommandoer

```bash
npm run dev          # utvikling, http://localhost:4321
npm run build        # bygg, verifiserer at alt henger sammen
npm run eksporter    # manuell sikkerhetskopi av Sanity-innholdet
node scripts/lag-demobilder.mjs   # lager plassholderbildene på nytt
node skudd.mjs       # skjermbilder av alle sider, mobil og desktop
```

`skudd.mjs` krever at `npm run dev` kjører i et annet vindu.
