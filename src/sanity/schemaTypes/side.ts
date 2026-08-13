import { defineField, defineType } from "sanity";

// Faste sider: forside, utsmykking, rammeverkstedet, grafikksenteret, kontakt.
// Eieren skal kunne endre teksten, men ikke lage nye sider eller endre adressen.

export const side = defineType({
  name: "side",
  title: "Fast side",
  type: "document",
  fields: [
    defineField({
      name: "tittel",
      title: "Overskrift på siden",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "nokkel",
      title: "Hvilken side er dette?",
      type: "string",
      description: "Velg fra lista. Skal bare settes én gang.",
      options: {
        list: [
          { title: "Forside", value: "forside" },
          { title: "Utsmykking", value: "utsmykking" },
          { title: "Rammeverkstedet", value: "rammeverkstedet" },
          { title: "Grafikksenteret", value: "grafikksenteret" },
          { title: "Kontakt", value: "kontakt" },
          { title: "Om ARTZ", value: "om" },
        ],
        layout: "dropdown",
      },
      readOnly: ({ value }) => Boolean(value),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ingress",
      title: "Kort innledning",
      type: "text",
      rows: 3,
      description: "Noen setninger som står øverst på siden.",
    }),
    defineField({
      name: "bilde",
      title: "Hovedbilde",
      type: "image",
      description: "Valgfritt.",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Kort beskrivelse av bildet" },
      ],
    }),
    defineField({
      name: "tekst",
      title: "Tekst",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Vanlig tekst", value: "normal" },
            { title: "Mellomtittel", value: "h2" },
          ],
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
    select: { title: "tittel", subtitle: "nokkel", media: "bilde" },
  },
});
