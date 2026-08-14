import { defineField, defineType } from "sanity";

// Faste sider: forside, utsmykking, rammeverkstedet, kontakt, om ARTZ.
// Grafikksenteret er fjernet 14. august 2026, se _arkiv/grafikksenteret-fjernet-14aug/.
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
      name: "sitat",
      title: "Uthevet setning",
      type: "text",
      rows: 3,
      description:
        "En eller to setninger som skal stå stort midt på forsiden. La feltet stå tomt for å skjule det.",
      hidden: ({ document }: any) => document?.nokkel !== "forside",
    }),
    defineField({
      name: "bein",
      title: "De tre boksene på forsiden",
      type: "array",
      description:
        "Overskrift og tekst i de tre boksene under åpningen. Hvilken side boksen peker til velges fra lista.",
      hidden: ({ document }: any) => document?.nokkel !== "forside",
      of: [
        {
          type: "object",
          name: "beinPunkt",
          title: "Boks",
          fields: [
            {
              name: "tittel",
              title: "Overskrift",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "tekst",
              title: "Tekst",
              type: "text",
              rows: 3,
            },
            {
              name: "lenke",
              title: "Hvilken side skal boksen peke til?",
              type: "string",
              options: {
                list: [
                  { title: "Verk", value: "/galleri" },
                  { title: "Utsmykking", value: "/utsmykking" },
                  { title: "Rammeverkstedet", value: "/rammeverkstedet" },
                  { title: "Om kunsten", value: "/om-kunsten" },
                  { title: "Kontakt", value: "/kontakt" },
                ],
                layout: "dropdown",
              },
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: { select: { title: "tittel", subtitle: "tekst" } },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    // Rutenett og spørsmål. Brukes av utsmykking og rammeverkstedet, og er
    // skjult på alle andre. Samme mønster som «bein» på forsiden: eieren skal
    // bare se de feltene som gjelder siden han står i.
    defineField({
      name: "punkter",
      title: "Punktene i rutenettet",
      type: "array",
      description:
        "Korte punkter som vises side om side under innledningen. Maks seks.",
      hidden: ({ document }: any) =>
        !["utsmykking", "rammeverkstedet"].includes(document?.nokkel),
      of: [
        {
          type: "object",
          name: "sidePunkt",
          title: "Punkt",
          fields: [
            {
              name: "tittel",
              title: "Overskrift",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            { name: "tekst", title: "Tekst", type: "text", rows: 3 },
          ],
          preview: { select: { title: "tittel", subtitle: "tekst" } },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "sporsmal",
      title: "Spørsmål og svar",
      type: "array",
      description:
        "Vises nederst på siden. Svaret er skjult til leseren klikker på spørsmålet. Det første står åpent.",
      hidden: ({ document }: any) =>
        !["utsmykking", "rammeverkstedet"].includes(document?.nokkel),
      of: [
        {
          type: "object",
          name: "sideSporsmal",
          title: "Spørsmål",
          fields: [
            {
              name: "sporsmal",
              title: "Spørsmål",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "svar",
              title: "Svar",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [{ title: "Vanlig tekst", value: "normal" }],
                  lists: [{ title: "Punktliste", value: "bullet" }],
                },
              ],
            },
          ],
          preview: { select: { title: "sporsmal" } },
        },
      ],
      validation: (Rule) => Rule.max(6),
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
