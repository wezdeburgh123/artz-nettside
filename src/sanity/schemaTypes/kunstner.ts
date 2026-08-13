import { defineField, defineType } from "sanity";

export const kunstner = defineType({
  name: "kunstner",
  title: "Kunstner",
  type: "document",
  fields: [
    defineField({
      name: "navn",
      title: "Navn",
      type: "string",
      description: "Fornavn og etternavn, slik det skal stå på nettsiden.",
      validation: (Rule) => Rule.required().error("Kunstneren må ha et navn."),
    }),
    defineField({
      name: "slug",
      title: "Nettadresse",
      type: "slug",
      description:
        "Lages automatisk fra navnet. Trykk «Generate» og la den stå.",
      options: { source: "navn", maxLength: 96 },
      validation: (Rule) => Rule.required().error("Trykk Generate for å lage nettadressen."),
    }),
    defineField({
      name: "levetid",
      title: "Årstall",
      type: "string",
      description:
        "Valgfritt. Skriv for eksempel «f. 1966» eller «1952–2018» for kunstnere som er gått bort.",
    }),
    defineField({
      name: "portrett",
      title: "Bilde av kunstneren",
      type: "image",
      description:
        "Valgfritt. Bildet blir automatisk tilpasset. Du kan laste opp rett fra telefonen.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Kort beskrivelse av bildet",
          type: "string",
          description:
            "For blinde og svaksynte. For eksempel «Frank Brunner i atelieret».",
        }),
      ],
    }),
    defineField({
      name: "presentasjon",
      title: "Om kunstneren",
      type: "array",
      description: "Noen avsnitt om kunstneren og arbeidet.",
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
                fields: [
                  { name: "href", type: "url", title: "Nettadresse" },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "framhevet",
      title: "Vis på forsiden",
      type: "boolean",
      description: "Skru på for kunstnere som skal fram på forsiden.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "navn", subtitle: "levetid", media: "portrett" },
  },
  orderings: [
    {
      title: "Navn A til Å",
      name: "navnAsc",
      by: [{ field: "navn", direction: "asc" }],
    },
  ],
});
