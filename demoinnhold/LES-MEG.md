# Demoinnhold for ARTZ

Rettighetsfritt testinnhold: 3 kunstnere og 18 verk med abstrakte bilder
i nettstedets egen palett. Hvert bilde har ordet DEMO brent inn nede til
høyre, så det ikke kan forveksles med et ekte verk uansett hvor det havner.

Formålet er å se hvordan galleri, kunstnersider, forside, lyskasse og
verkside oppfører seg med innhold i bredden: mange verk, ulike bildeformater,
manglende felter, solgte verk og to verk med samme tittel.

## Dette skal IKKE inn i produksjonsdatasettet

Datasettet `production` er live på Netlify. Demoinnhold der ville bety
oppdiktede kunstnere på en offentlig adresse, som er nøyaktig feilen fra
13. august 2026. Bruk et eget datasett og slett det etterpå.

## Slik importeres det

    cd /Users/christian/Documents/Claude/Projects/ARTZ/artz-nettside
    npx sanity dataset create demo --visibility public
    npx sanity dataset import demoinnhold/demoinnhold.ndjson demo

Bytt så nettstedet over til demodatasettet ved å endre én linje i `.env`:

    PUBLIC_SANITY_DATASET=demo

Dev-serveren må startes på nytt for at endringen skal tas.

## Slik ryddes det

Sett `.env` tilbake til `production`, og:

    npx sanity dataset delete demo

Da er alt borte, både dokumenter og opplastede bilder. Ingen rester i
produksjon, fordi ingenting noen gang ble skrevet dit.

Skriptene som lagde innholdet ligger i `scripts/`.
