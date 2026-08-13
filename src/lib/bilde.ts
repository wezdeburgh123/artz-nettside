import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "sanity:client";

// Én kilde til sannhet for bilde-URL-er. Både Bilde.astro og lyskassa i
// VerkKort bygger adresser, og de skal bygge dem likt.
//
// fit=max betyr aldri oppskalering. Ber vi om 2400 piksler på et bilde som
// er 1600, får vi 1600. Det er derfor det er trygt å legge inn store
// bredder i srcset uten å sjekke originalen først.
//
// auto=format gir moderne bildeformater til nettlesere som støtter dem.

const bygger = imageUrlBuilder(sanityClient);

export function bildeUrl(kilde: any, bredde: number): string | null {
  if (typeof kilde === "string") return kilde;
  if (!kilde?.asset?._ref) return null;
  return bygger.image(kilde).width(bredde).fit("max").auto("format").url();
}

// Bredder for stor visning. 1000 dekker mobil, 1600 en vanlig skjerm,
// 2400 en stor skjerm eller retina. Nettleseren velger selv ut fra sizes.
const STORE_BREDDER = [1000, 1600, 2400];

export function bildeSett(kilde: any): string | null {
  if (typeof kilde === "string" || !kilde?.asset?._ref) return null;
  return STORE_BREDDER.map((b) => `${bildeUrl(kilde, b)} ${b}w`).join(", ");
}
