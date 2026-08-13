import { defineField, defineType } from "sanity";

export const aktuelt = defineType({
  name: "aktuelt",
  title: "Aktuelt",
  type: "document",
  fields: [
    defineField({
      name: "tittel",
      title: "Overskrift",
      type: "string",
      validation: (Rule) => Rule.required().error("Skriv en overskrift."),
    }),
    defineField({
      name: "slug",
      title: "Nettadresse",
      type: "slug",
      description: "Lages automatisk. Trykk «Generate» og la den stå.",
      options: { source: "tittel", maxLength: 96 },
      validation: (Rule) => Rule.required().error("Trykk Generate for å lage nettadressen."),
    }),
    defineField({
      name: "dato",
      title: "Dato",
      type: "date",
      description: "Datoen saken gjelder. Nyeste sak vises øverst.",
      options: { dateFormat: "DD.MM.YYYY" },
      validation: (Rule) => Rule.required().error("Sett en dato."),
    }),
    defineField({
      name: "sted",
      title: "Sted",
      type: "string",
      description: "Valgfritt. For eksempel «Hvaler Kunstforening».",
    }),
    defineField({
      name: "bilde",
      title: "Bilde",
      type: "image",
      description: "Valgfritt. Ett bilde som hører til saken.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Kort beskrivelse av bildet",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "ingress",
      title: "Kort innledning",
      type: "text",
      rows: 3,
      description: "To eller tre setninger. Dette vises i oversikten.",
    }),
    defineField({
      name: "tekst",
      title: "Tekst",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Vanlig tekst", value: "normal" }],
          lists: [{ title: "Punktliste", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Fet", value: "strong" },
              { title: "Kursiv", value: "em" },
            ],
            annotations: [
              {
                name: "lenke",
                type: "object",
                title: "Lenke",
                fields: [{ name: "href", type: "url", title: "Nettadresse" }],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Kort beskrivelse av bildet" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "tittel", subtitle: "dato", media: "bilde" },
  },
  orderings: [
    {
      title: "Nyeste først",
      name: "datoDesc",
      by: [{ field: "dato", direction: "desc" }],
    },
  ],
});
