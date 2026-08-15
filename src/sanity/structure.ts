import type { StructureResolver } from "sanity/structure";

// Menyen eieren ser i Studio. Fem punkter, ingenting mer.
//
// Nettstedinnstillinger er et enkeltdokument og åpnes direkte, uten liste
// foran. Derfor S.document() og ikke S.documentTypeList(). Dokument-ID-en er
// låst til «innstillinger», slik at det aldri kan bli to av dem.
export const struktur: StructureResolver = (S) =>
  S.list()
    .title("Innhold")
    .items([
      S.listItem()
        .title("Kunstnere")
        .child(
          S.documentTypeList("kunstner")
            .title("Kunstnere")
            .defaultOrdering([{ field: "navn", direction: "asc" }])
        ),
      S.listItem()
        .title("Verk")
        .child(
          S.documentTypeList("verk")
            .title("Verk")
            .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
        ),
      S.listItem()
        .title("Om kunsten")
        .child(
          S.documentTypeList("aktuelt")
            .title("Om kunsten")
            .defaultOrdering([{ field: "dato", direction: "desc" }])
        ),
      S.divider(),
      S.listItem()
        .title("Faste sider")
        .child(
          S.documentTypeList("side")
            .title("Faste sider")
            .defaultOrdering([{ field: "tittel", direction: "asc" }])
        ),
      S.listItem()
        .title("Bunnen på nettsiden")
        .id("innstillinger")
        .child(
          S.document()
            .schemaType("innstillinger")
            .documentId("innstillinger")
            .title("Bunnen på nettsiden")
        ),
    ]);
