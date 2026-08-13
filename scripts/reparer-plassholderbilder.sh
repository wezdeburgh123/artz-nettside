#!/bin/bash
# ARTZ - bytter ut daarlige plassholderbilder. Idempotent, sletter ingenting.
# Runde 2, 14. august 2026: pikselerte lazy-bilder, utstillingsplakat og portrettfoto.
set -u
cd "$(dirname "$0")/.." || exit 1
UT="public/plassholdere"; mkdir -p "$UT/_mislykket"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

while IFS='|' read -r fil tittel url ref; do
  [ -z "${fil// }" ] && continue
  fil="${fil// }"; url="${url// }"; ref="${ref// }"
  raa="$UT/_raa2.tmp"; rm -f "$raa"
  if ! curl -sSL --fail --max-time 45 -A "$UA" -e "$ref" -o "$raa" "$url"; then
    echo "FEILET     $fil"; continue
  fi
  case "$(file -b --mime-type "$raa")" in image/*) ;; *)
    mv "$raa" "$UT/_mislykket/${fil%.jpg}-ikkebilde.bin"; echo "IKKE BILDE $fil"; continue;; esac
  w=$(sips -g pixelWidth "$raa" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$raa" | awk '/pixelHeight/{print $2}')
  kb=$(( $(stat -f%z "$raa") / 1024 ))
  if [ "${w:-0}" -lt 350 ] || [ "${h:-0}" -lt 350 ] || [ "$kb" -lt 12 ]; then
    mv "$raa" "$UT/_mislykket/${fil%.jpg}-forliten.jpg"; echo "FOR SVAK   $fil ${w}x${h} ${kb}kB"; continue
  fi
  [ -f "$UT/$fil" ] && mv "$UT/$fil" "$UT/_mislykket/${fil%.jpg}-forkastet.jpg"
  if [ "$w" -gt 1400 ] || [ "$h" -gt 1400 ]; then
    sips -s format jpeg -s formatOptions 85 -Z 1400 "$raa" --out "$UT/$fil" >/dev/null
  else
    sips -s format jpeg -s formatOptions 90 "$raa" --out "$UT/$fil" >/dev/null
  fi
  rm -f "$raa"; echo "OK         $fil  $tittel  ${w}x${h} ${kb}kB"
done <<'DATA'
even-richardson-2.jpg|Verk hos Cornice|https://www.cornice.no/_kunstbilder/store/12189.jpg|https://www.cornice.no/kunstnere/1008/Even-Richardson/14444
DATA
rm -f "$UT/_raa.tmp" "$UT/_raa2.tmp"; echo; echo "Ferdig."
