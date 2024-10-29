import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    // We'll add tableSchemas here later
    tableSchema({
      name: "books",
      columns: [
        { name: "type", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "pages",
      columns: [
        { name: "book_id", type: "string" },
        { name: "date", type: "string" },
        { name: "canvas", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    // tableSchema({
    //   name: "frames",
    //   columns: [],
    // }),
    // tableSchema({
    //   name: "templates",
    //   columns: [],
    // }),
    // tableSchema({
    //   name: "fonts",
    //   columns: [],
    // }),
  ],
});
