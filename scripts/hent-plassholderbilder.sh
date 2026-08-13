#!/bin/bash
# ARTZ - henter midlertidige plassholderbilder for kunstnerne.
# Skrevet 13. august 2026. Bildene er opphavsrettsbeskyttet og skal
# IKKE publiseres. Kun til lokal testing av bildekjeden.
#
# Kjor:  bash scripts/hent-plassholderbilder.sh
# Ut:    public/plassholdere/<slug>-1.jpg osv, pluss kontaktark.html

set -u
cd "$(dirname "$0")/.." || exit 1
UT="public/plassholdere"
LOGG="$UT/_logg.tsv"
mkdir -p "$UT/_mislykket"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
printf "status\tslug\ttittel\tfil\tpiksler\turl\n" > "$LOGG"

hent() { # slug tittel url referer
  local slug="$1" tittel="$2" url="$3" ref="$4"
  local n=1
  while [ -f "$UT/$slug-$n.jpg" ]; do n=$((n+1)); done
  [ "$n" -gt 2 ] && return 0            # maks to bilder per kunstner
  local raa="$UT/_raa.tmp"
  rm -f "$raa"
  if ! curl -sSL --fail --max-time 45 -A "$UA" -e "$ref" -o "$raa" "$url" 2>/dev/null; then
    printf "NEDLASTING FEILET\t%s\t%s\t-\t-\t%s\n" "$slug" "$tittel" "$url" >> "$LOGG"
    return 0
  fi
  local type
  type=$(file -b --mime-type "$raa")
  case "$type" in
    image/*) ;;
    *) mv "$raa" "$UT/_mislykket/$slug-$n.bin"
       printf "IKKE BILDE (%s)\t%s\t%s\t-\t-\t%s\n" "$type" "$slug" "$tittel" "$url" >> "$LOGG"
       return 0 ;;
  esac
  local piksler="ukjent"
  if command -v sips >/dev/null; then
    piksler=$(sips -g pixelWidth -g pixelHeight "$raa" 2>/dev/null | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w"x"h}')
    sips -s format jpeg -s formatOptions 85 -Z 1400 "$raa" --out "$UT/$slug-$n.jpg" >/dev/null 2>&1 \
      || cp "$raa" "$UT/$slug-$n.jpg"
  else
    cp "$raa" "$UT/$slug-$n.jpg"
  fi
  rm -f "$raa"
  printf "OK\t%s\t%s\t%s\t%s\t%s\n" "$slug" "$tittel" "$slug-$n.jpg" "$piksler" "$url" >> "$LOGG"
}

# ---------------------------------------------------------------
# Kandidatliste. Rekkefolgen er prioritet: forste som lykkes vinner.
# Format: slug | tittel | bilde-url | kildeside (referer)
# ---------------------------------------------------------------
while IFS='|' read -r slug tittel url ref; do
  [ -z "${slug// }" ] && continue
  case "$slug" in \#*) continue;; esac
  hent "${slug// }" "$tittel" "${url// }" "${ref// }"
done <<'DATA'
frank-brunner|Panorama|https://www.fineart.no/i/g-box-lazy/1034017-0.png/Frank_Brunner_-_Panorama.png|https://www.fineart.no/galleriobjekt/Frank_Brunner_-_PANORAMA/385965
frank-brunner|Vannfall|https://www.fineart.no/i/g-box-lazy/1046528-0.png/Frank_Brunner_-_Vannfall.png|https://www.fineart.no/galleriobjekt/Frank_Brunner_-_Vannfall/412381
frank-brunner|Reisende|https://www.fineart.no/i/g-box-lazy/1026048-0.png/Frank_Brunner_-_Reisende.png|https://www.fineart.no/galleriobjekt/Frank_Brunner_-_Reisende/389776
elling-reitan|Hedda Gabler|https://cdn.yourvismawebsite.com/img/09/3fc6fd08-d02a-4c9d-b0ee-88428e23b5e4/940/705|https://www.galleri-sg.no/shop/product/elling-reitan-hedda-gabler
elling-reitan|Hommage Basquiat|https://cdn.yourvismawebsite.com/img/08/5e121371-d9aa-4dbe-9a60-42140e715ab3/440/200|https://www.modernartgallery.no/elling-reitan
elling-reitan|Madonna med to figurer|https://cdn.yourvismawebsite.com/img/08/05a3619e-6d7b-4a20-8873-6954ce1c1990/440/200|https://www.modernartgallery.no/elling-reitan
nico-widerberg|Skogbla|https://www.fineart.no/i/g-box-lazy/1046807-0.png/Nico_Widerberg_-_Skogbl%C3%A5.png|https://www.fineart.no/kunstner/nico-widerberg
nico-widerberg|Styre|https://www.fineart.no/i/g-box-lazy/1040408-0.png/Nico_Widerberg_-_Styre.png|https://www.fineart.no/kunstner/nico-widerberg
nico-widerberg|Utflukt|https://www.fineart.no/i/lazy/1049004-0.jpg|https://www.fineart.no/kunstner/nico-widerberg
sverre-bjertnaes|Hvilende hode II|https://www.fineart.no/i/g-box-lazy/1030932-0.png/Sverre_Bjertn%C3%A6s_-_Hvilende_hode_II.png|https://www.fineart.no/kunstner/sverre-bjertnes
sverre-bjertnaes|Manieristisk familie|https://www.fineart.no/i/g-box-lazy/360675-0.png/Sverre_Bjertn%C3%A6s_-_Manieristisk_familie.png|https://www.fineart.no/kunstner/sverre-bjertnes
sverre-bjertnaes|Minnetrilogien|https://www.fineart.no/i/lazy/1035207-0.jpg|https://www.fineart.no/kunstner/sverre-bjertnes
bjorg-thorhallsdottir|Kjaerlighet skaper kjaerlighet|https://www.fineart.no/i/og/1035513-0.jpg|https://www.fineart.no/kunstner/bjoerg-thorhallsdottir
bjorg-thorhallsdottir|A elske er a leve|https://www.fineart.no/i/lazy/1049067-0.jpg|https://www.fineart.no/kunstner/bjoerg-thorhallsdottir
bjorg-thorhallsdottir|Life is a beautiful place|https://www.fineart.no/i/img_img/1049063-0.jpg/max,w=200,h=138/Bj%C3%B8rg_Thorhallsdottir_-_Life_is_a_beautiful_place.jpg|https://www.fineart.no/kunstner/bjoerg-thorhallsdottir
mia-gjerdrum-helgesen|Verk fra Gulden Kunstverk|https://images.squarespace-cdn.com/content/v1/56068c00e4b0ffbc0fe6716a/89a76342-16f8-4ae5-ac6a-51d996f0b04e/_DSF0210.jpg|https://www.guldenkunstverk.no/mia-gjerdrum-helgesen
mia-gjerdrum-helgesen|Peace|https://static.wixstatic.com/media/6e0582_60dc2a2d43184c528504dbaf4dd8699f~mv2.jpg/v1/fill/w_900,h_564,al_c,q_85/Peace%20Mia%20g%20helgesen.jpg|https://www.gallerisoon.no/mia-gjerdrum-helgesen
mia-gjerdrum-helgesen|Veien hjem IIII|https://galleri-er-nettbutikk.com/cdn/shop/files/IMG_3897_1200x.jpg?v=1769002105|https://galleri-er-nettbutikk.com/collections/mia-gjerdem-helgesen
mia-gjerdrum-helgesen|Naturens etterklang|https://galleri-er-nettbutikk.com/cdn/shop/files/IMG_2279_72aad62a-1314-479d-ab35-e4599c6089a7_1200x.jpg?v=1750855201|https://galleri-er-nettbutikk.com/collections/mia-gjerdem-helgesen
cathrine-knudsen|Detachment|https://grafikksenteret.cornice.no/_kunstbilder/store/14809.jpg?id=3|https://grafikksenteret.cornice.no/galleri/1291/Cathrine-Knudsen
cathrine-knudsen|Organic Growt|https://grafikksenteret.cornice.no/_kunstbilder/store/14810.jpg?id=3|https://grafikksenteret.cornice.no/galleri/1291/Cathrine-Knudsen
cathrine-knudsen|Vandring|https://grafikksenteret.cornice.no/_kunstbilder/store/14808.jpg?id=3|https://grafikksenteret.cornice.no/galleri/1291/Cathrine-Knudsen
nina-due|Som i en drom|https://www.d40.no/wp-content/uploads/2026/01/20260104_141548.jpg|https://www.d40.no/kunstner/n/nina-due/
nina-due|Bla morgen|https://www.d40.no/wp-content/uploads/2023/03/F05A8B61-76B2-4EDD-8877-571020461CC1-scaled.jpeg|https://www.d40.no/kunstner/n/nina-due/
nina-due|Gar med skilpadder|https://www.d40.no/wp-content/uploads/2026/01/7e7fd582-4469-4f25-b41e-f3bdb96eee08.jpg|https://www.d40.no/kunstner/n/nina-due/
nina-due|Som i en drom, liten|https://www.d40.no/wp-content/uploads/2026/01/20260104_141548-222x320.jpg|https://www.d40.no/kunstner/n/nina-due/
arjuna-geir-aasehaug|Big boy|https://liljevalchs.se/wp-content/uploads/2026/01/Arjuna-Geir-Aasehaug-987x1024.jpg|https://liljevalchs.se/en/utstallningar/arjuna-geir-aasehaug/
arjuna-geir-aasehaug|Blood Moon|https://solvesborg.konstforeningar.se/wp-content/uploads/sites/181/2025/12/Arjuna-Blod-moon-80x100-1-768x556.jpg|https://solvesborg.konstforeningar.se/utstallningar/arjuna-geir-aasehaug-maleri24-jan-15-febr-2026/
arjuna-geir-aasehaug|Reminiscence|https://solvesborg.konstforeningar.se/wp-content/uploads/sites/181/2025/12/ARJUNA-Reminicence-70x100-1-768x599.jpg|https://solvesborg.konstforeningar.se/utstallningar/arjuna-geir-aasehaug-maleri24-jan-15-febr-2026/
merete-sejersted-bodtker|Statue av Marit Bjorgen|https://www.langrenn.com/wp-content/uploads/sites/15/2024/09/Marit-Bjorgen-Tove-Moe-Dyrhaug-statue-Sept-7-2024-Facebook-1920x1280-1.jpg|https://www.langrenn.com/langrenn-allround/marit-bjorgen-pa-sokkel-dette-er-veldig-stort/
merete-sejersted-bodtker|Portrett, arbeid med byste|https://media.snl.no/media/310289/standard_compressed_merete-sejersted-bodtek.jpg|https://snl.no/Merete_Sejersted_B%C3%B8dtker
gunn-vottestad|Sondagsfred II|https://www.fineart.no/i/lazy/1047541-0.jpg|https://www.fineart.no/kunstner/gunn-vottestad
gunn-vottestad|Toner fra en stille natt|https://www.fineart.no/i/lazy/1047542-0.jpg|https://www.fineart.no/kunstner/gunn-vottestad
gunn-vottestad|Morketidslys|https://www.fineart.no/i/lazy/1038459-0.jpg|https://www.fineart.no/kunstner/gunn-vottestad
gunn-vottestad|Levd liv|https://static.wixstatic.com/media/6e0582_44a2b4f9cc5f4301bb5c0a663d565263~mv2.jpg|https://www.gallerisoon.no/gunn-vottestad
dag-hol|Bolgen|https://www.fineart.no/i/og/1021638-0.jpg|https://www.fineart.no/galleriobjekt/Dag_Hol_-_B%C3%B8lgen/382896
dag-hol|Aften|https://www.fineart.no/i/g-box-lazy/1021635-0.png/Dag_Hol_-_Aften.png|https://www.fineart.no/galleriobjekt/Dag_Hol_-_Aften/382893
dag-hol|Stone by the Sea|https://danaddington.com/addingtongallery/hol/stonebysea16x17.jpg|https://danaddington.com/addingtongallery/hol/hol.html
dag-hol|Moving Clouds|https://danaddington.com/addingtongallery/hol/movingclouds23x19.jpg|https://danaddington.com/addingtongallery/hol/hol.html
jarle-rosseland|Vartegn|https://grafikksenteret.cornice.no/_kunstbilder/store/14830.jpg|https://grafikksenteret.cornice.no/g14830
jarle-rosseland|Host|https://grafikksenteret.cornice.no/_kunstbilder/store/14861.jpg|https://grafikksenteret.cornice.no/g14861
jarle-rosseland|Var dag|https://www.amare.no/assets/img/1024/1024/bilder_nettbutikk/12155a615a23f77ae6c8e1d5d82662bc-image.jpeg|https://www.amare.no/produkt/q-r/jarle-rosseland/var-dag
even-richardson|Havets kardinal|https://www.fineart.no/i/og/1016751-0.jpg|https://www.fineart.no/galleriobjekt/Even_Richardson_-_Havets_kardinal/377963
even-richardson|Hvaler-landskap|https://images.squarespace-cdn.com/content/v1/65cf17981a96ce4ab3d42e6c/045adab1-797e-447a-9693-3e32c9269dad/ecbdbaf8-81a8-64be-ae0c-a7c50243b60b.jpg|https://www.hvalerkunstforening.no/tidligere-utstillinger/even-richardson
even-richardson|Verk hos Cornice|https://www.cornice.no/_kunstbilder/store/12189.jpg|https://www.cornice.no/kunstnere/1008/Even-Richardson/14444
per-morten-karlsen|Stellebord 1984|https://ms01.nasjonalmuseet.no/iip/?iiif=/tif/121792.tif/full/1200,/0/default.jpg|https://www.nasjonalmuseet.no/en/collection/object/MS-00149-1988
per-morten-karlsen|Fuglefangeren|https://ismene-i02.mycdn.no/mysimgprod/ismene_mystore_no/images/66232_Per_Morten_Karlsen_Fuglefangeren_1.jpg/w446h665.jpg|https://nettbutikk.ismene.no/categories/per-morten-karlsen
per-morten-karlsen|Krukke, Ornament|https://ismene-i01.mycdn.no/mysimgprod/ismene_mystore_no/images/gplt4_Per_Morten_Karlsen__Krukke__Ornament__tresni_1.jpeg/w665h521.jpeg|https://nettbutikk.ismene.no/categories/per-morten-karlsen
eva-langaas|Vartegn|https://cdn.duell.no/uploads/395/product/thumb_large/Vrtegn-50-x-50-cm-4-800-_2c3bf449d1712ea036112272100663a2.jpg|https://www.kranegalleri.no/vaartegn.6677621-574696.html
eva-langaas|Mot vinter|https://cdn.duell.no/uploads/395/product/thumb_large/029_edited-1_cc66a1419051569ef707d1bf89343768.jpg|https://www.kranegalleri.no/vaartegn.6677621-574696.html
eva-langaas|Sol III|https://cdn.duell.no/uploads/395/product/thumb_large/Sol-III_accee54f026ac1af499d695f3fab46f2.jpg|https://www.kranegalleri.no/vaartegn.6677621-574696.html
ludvig-eikaas|Jubilanter 1964|https://ms01.nasjonalmuseet.no/iip/?iiif=/tif/92071.tif/full/1200,/0/default.jpg|https://www.nasjonalmuseet.no/samlingen/objekt/NG.K_H.1965.0022
ludvig-eikaas|Jeg 1970|https://ms01.nasjonalmuseet.no/iip/?iiif=/tif/MS-03802-1995.tif/full/1200,/0/default.jpg|https://www.nasjonalmuseet.no/en/collection/object/MS-03802-1995
ludvig-eikaas|Jeg 1990, skulptur|https://ems.dimu.org/image/019EGHiBtw7Q9?dimension=1200x1200|https://digitaltmuseum.no/0210414679896/jeg-ludvig-eikaas-skulptur
jorgen-holen|Aureus|https://galleri1610.cornice.no/_kunstbilder/store/12181.jpg|https://galleri1610.cornice.no/g12181
jorgen-holen|Urnen|https://galleri1610.cornice.no/_kunstbilder/store/12186.jpg|https://galleri1610.cornice.no/g12186
jorgen-holen|Verk hos Cornice|https://www.cornice.no/_kunstbilder/store/12221.jpg|https://www.cornice.no/kunstnere/1246/Joergen-Holen/12218
kai-fjell|Kalven reiser seg 1936|https://ms01.nasjonalmuseet.no/iip/?iiif=/tif/NG.M.01854_PUBLISERING.tif/full/1200,/0/default.jpg|https://www.nasjonalmuseet.no/en/collection/object/NG.M.01854
kai-fjell|Gratulanter 1937|https://ms01.nasjonalmuseet.no/iip/?iiif=/tif/107531.tif/full/1200,/0/default.jpg|https://www.nasjonalmuseet.no/en/collection/object/NG.M.02087
kai-fjell|Pikehode 1987|https://ems.dimu.org/image/02346wuJDxTi?dimension=1200x1200|https://digitaltmuseum.org/021048239667/pikehode-grafikk
DATA

# ---------------- kontaktark ----------------
{
printf '<!doctype html><meta charset="utf-8"><title>ARTZ plassholderbilder</title>'
printf '<style>body{font:15px/1.5 -apple-system,sans-serif;margin:2rem;max-width:1200px}'
printf 'h1{font-size:1.4rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1.2rem}'
printf 'figure{margin:0}img{width:100%%;height:210px;object-fit:contain;background:#f2f0ec;border:1px solid #ddd}'
printf 'figcaption{font-size:12px;color:#555;margin-top:.35rem}b{color:#000}'
printf '.feil{background:#fff4f4;border:1px solid #f0c8c8;padding:.6rem 1rem;margin:1rem 0;font-size:13px}</style>'
printf '<h1>ARTZ midlertidige plassholderbilder</h1>'
printf '<p><b>Opphavsrettsbeskyttet materiale.</b> Kun for lokal testing av bildekjeden. Skal ikke publiseres.</p>'
printf '<div class="grid">'
awk -F'\t' 'NR>1 && $1=="OK"{printf "<figure><img src=\"%s\" alt=\"\"><figcaption><b>%s</b><br>%s<br>%s</figcaption></figure>", $4, $2, $3, $5}' "$LOGG"
printf '</div><h2 style="font-size:1.1rem">Mislykkede</h2><div class="feil">'
awk -F'\t' 'NR>1 && $1!="OK"{printf "%s &mdash; %s (%s)<br>", $2, $3, $1}' "$LOGG"
printf '</div>'
} > "$UT/kontaktark.html"

echo
echo "Ferdig. Resultat:"
awk -F'\t' 'NR>1{s[$1]++}END{for(k in s) printf "  %-22s %d\n", k, s[k]}' "$LOGG"
echo
echo "Kunstnere med minst ett bilde: $(awk -F'\t' 'NR>1&&$1=="OK"{print $2}' "$LOGG" | sort -u | wc -l | tr -d ' ') av 21"
echo "Uten bilde:"
awk -F'\t' 'NR>1&&$1=="OK"{print $2}' "$LOGG" | sort -u > /tmp/artz_ok.txt
for s in frank-brunner elling-reitan nico-widerberg sverre-bjertnaes bjorg-thorhallsdottir mia-gjerdrum-helgesen cathrine-knudsen rolf-sorensen nina-due arjuna-geir-aasehaug merete-sejersted-bodtker gunn-vottestad dag-hol jarle-rosseland jan-svendsen even-richardson per-morten-karlsen eva-langaas ludvig-eikaas jorgen-holen kai-fjell; do
  grep -qx "$s" /tmp/artz_ok.txt || echo "  $s"
done
echo
echo "Apne kontaktarket:  open $UT/kontaktark.html"
