import { defineField, defineType } from "sanity";

// Nettstedinnstillinger: det som står i bunnen på hver eneste side.
//
// Opprettet 15. august 2026. Bunnen var hardkodet i src/layouts/Base.astro,
// med e-postadressen og setningen om hva ARTZ er skrevet rett inn i koden.
// Det betyr at André ikke kunne rette en e-postadresse uten en utvikler.
//
// Dette er et enkeltdokument. Det finnes bare ett, det heter «innstillinger»,
// og det kan ikke lages flere. Se src/sanity/structure.ts og malfilteret i
// sanity.config.ts.

export const innstillinger = defineType({
  name: "innstillinger",
  title: "Nettstedinnstillinger",
  type: "document",
  fields: [
    defineField({
      name: "beskrivelse",
      title: "Én linje om ARTZ",
      type: "string",
      description:
        "Står i bunnen på alle sider, rett under navnet. Én kort setning.",
      validation: (Rule) => Rule.max(90).warning("Hold den under 90 tegn."),
    }),
    defineField({
      name: "epost",
      title: "E-postadresse",
      type: "string",
      description: "Vises i bunnen som en lenke folk kan trykke på.",
    }),
    defineField({
      name: "telefon",
      title: "Telefonnummer",
      type: "string",
      description: "Valgfritt. La feltet stå tomt for å skjule det.",
    }),
    defineField({
      name: "adresse",
      title: "Besøksadresse",
      type: "text",
      rows: 3,
      description:
        "Rammeverkstedet. Skriv gateadresse, postnummer og sted. Valgfritt, og skjult så lenge det står tomt.",
    }),
    defineField({
      name: "orgnavn",
      title: "Juridisk navn",
      type: "string",
      description:
        "Navnet virksomheten er registrert under. Vises nederst i bunnen. Valgfritt.",
    }),
    defineField({
      name: "orgnummer",
      title: "Organisasjonsnummer",
      type: "string",
      description: "Ni siffer. Valgfritt, og skjult så lenge det står tomt.",
    }),
    defineField({
      name: "rettighetslinje",
      title: "Setningen om rettigheter",
      type: "string",
      description:
        "Står etter årstallet nederst. Årstallet settes automatisk og skal ikke skrives her.",
    }),
  ],
  preview: {
    select: { subtitle: "epost" },
    prepare: ({ subtitle }: any) => ({
      title: "Nettstedinnstillinger",
      subtitle: subtitle ?? "Ingen e-postadresse satt",
    }),
  },
});
