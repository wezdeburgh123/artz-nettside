# Nettlesertest av lyskassa

Laget 13. august 2026, da lyskassa ble bygd. Ligger arkivert fordi testsida
ikke skal stå på et publisert kunstnettsted, men riggen skal kunne kjøres
igjen hvis lyskassa endres.

Poenget: lyskassa kan ikke testes mot Sanity fra alle miljøer, og et grønt
`npm run build` sier ingenting om at en dialog faktisk åpner seg. Denne
riggen bruker lokale testbilder med kjente ytterformater, så både et
ekstremt høyt og et ekstremt bredt bilde blir prøvd.

## Slik kjører du den igjen

```
cp scripts/lyskasse-test/test-lyskasse.astro src/pages/
mkdir -p public/test-lyskasse
cp scripts/lyskasse-test/bilder/*.jpg public/test-lyskasse/
npm run dev
```

I et annet terminalvindu:

```
npx playwright install chromium
node scripts/lyskasse-test/test-lyskasse.mjs
```

Skriptet importerer playwright fra en absolutt sti som gjaldt i miljøet der
det ble skrevet. Endre linje 3 til `import { chromium } from "playwright"`
hvis du kjører det lokalt med playwright installert i prosjektet.

Rydd opp etterpå:

```
rm src/pages/test-lyskasse.astro
rm -r public/test-lyskasse
```

## Hva den sjekker

22 punkter på 1440 × 900 og 24 på 430 × 932. Blant dem:

- at hvert verk er en vanlig lenke til bildefila, altså at det virker uten JavaScript
- at klikk åpner dialogen og laster riktig bilde
- at et bilde på 900 × 1600 holder seg innenfor skjermhøyden
- at et bilde på 1800 × 700 holder seg innenfor skjermbredden
- at bakgrunnen ikke ruller mens lyskassa er åpen
- at piltast, sveip, Escape, lukkeknapp og klikk på bakteppet gjør det de skal
- at fokus kommer tilbake til verket man kom fra
- at det ikke ligger feil i konsollen

## Feil den faktisk fant

**Klikk på bakteppet lukket ikke.** Første versjon sjekket
`e.target === dialog`. Rammedivven dekker hele dialogen, så klikket landet
alltid på den, aldri på dialogen. Regelen er nå snudd: alt lukker, unntatt
bildet, bildeteksten og knappene.

**Og en feil i testen selv.** Den første rullesjekken sammenlignet
`scrollHeight` med `clientHeight`. `overflow: hidden` endrer ikke
`scrollHeight`, så testen målte noe annet enn navnet sitt. Den prøver nå å
rulle og ser om `scrollY` flyttet seg.
