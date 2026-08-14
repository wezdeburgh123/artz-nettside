import type { StructureResolver } from "sanity/structure";

// Menyen eieren ser i Studio. Fire punkter, ingenting mer.
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
    ]);
