import { defineField, defineType } from "sanity";

// Ingen prisfelt i versjon 1. Gratisplanen i Sanity har bare offentlige
// datasett, så alt som legges inn her kan leses av hvem som helst.
// Se gjennomgangsnotatet, punkt 3.

export const verk = defineType({
  name: "verk",
  title: "Verk",
  type: "document",
  fields: [
    defineField({
      name: "bilde",
      title: "Bilde av verket",
      type: "image",
      description:
        "Last opp så stort bilde du har. Størrelse og format ordner seg selv.",
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error("Verket må ha et bilde."),
      fields: [
        defineField({
          name: "alt",
          title: "Kort beskrivelse av bildet",
          type: "string",
          description: "For blinde og svaksynte. Én setning er nok.",
        }),
      ],
    }),
    defineField({
      name: "tittel",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required().error("Verket må ha en tittel."),
    }),
    defineField({
      name: "kunstner",
      title: "Kunstner",
      type: "reference",
      to: [{ type: "kunstner" }],
      description: "Velg fra lista. Er kunstneren ikke der, legg den inn først.",
      validation: (Rule) => Rule.required().error("Velg hvilken kunstner verket er av."),
    }),
    defineField({
      name: "teknikk",
      title: "Teknikk",
      type: "string",
      description: "Velg fra lista.",
      options: {
        list: [
          { title: "Litografi", value: "litografi" },
          { title: "Serigrafi", value: "serigrafi" },
          { title: "Etsning", value: "etsning" },
          { title: "Tresnitt", value: "tresnitt" },
          { title: "Oljemaleri", value: "oljemaleri" },
          { title: "Akrylmaleri", value: "akrylmaleri" },
          { title: "Akvarell", value: "akvarell" },
          { title: "Tegning", value: "tegning" },
          { title: "Skulptur", value: "skulptur" },
          { title: "Fotografi", value: "fotografi" },
          { title: "Annet", value: "annet" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "aar",
      title: "År",
      type: "string",
      description: "Valgfritt. For eksempel «2019».",
    }),
    defineField({
      name: "maal",
      title: "Mål",
      type: "string",
      description: "Valgfritt. Høyde ganger bredde i centimeter, for eksempel «50 x 70 cm».",
    }),
    defineField({
      name: "opplag",
      title: "Opplag",
      type: "string",
      description: "Valgfritt. For eksempel «45 eksemplarer» eller «unikt verk».",
    }),
    defineField({
      name: "status",
      title: "Er verket til salgs?",
      type: "string",
      description: "Solgte verk blir merket på nettsiden, men blir liggende.",
      options: {
        list: [
          { title: "Til salgs", value: "tilgjengelig" },
          { title: "Solgt", value: "solgt" },
        ],
        layout: "radio",
      },
      initialValue: "tilgjengelig",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "beskrivelse",
      title: "Om verket",
      type: "text",
      rows: 4,
      description: "Valgfritt. Noen setninger om verket.",
    }),
    defineField({
      name: "framhevet",
      title: "Vis på forsiden",
      type: "boolean",
      initialValue: false,
    }),
    // Satt 14. august 2026. Registerdrift-bildene er generativ grafikk laget
    // for ARTZ, ikke verk av kunstnerne. Er dette huket av, viser nettstedet
    // verket uten kunstnernavn og med en synlig merkelapp. Kunstneren blir
    // stående i feltet over, fordi den styrer hvilket bilde kunstnerkortet
    // låner, men navnet vises ingen steder sammen med verket.
    defineField({
      name: "plassholder",
      title: "Midlertidig plassholder",
      type: "boolean",
      description:
        "Huk av hvis bildet ikke er et verk av kunstneren. Da vises verket uten kunstnernavn, og merkes tydelig på nettsiden.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "tittel",
      kunstner: "kunstner.navn",
      teknikk: "teknikk",
      media: "bilde",
    },
    prepare({ title, kunstner, teknikk, media }) {
      const deler = [kunstner, teknikk].filter(Boolean);
      return {
        title: title || "Uten tittel",
        subtitle: deler.join(" · "),
        media,
      };
    },
  },
});
