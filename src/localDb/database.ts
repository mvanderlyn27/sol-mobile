// src/models/database.js
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { schema } from "./schema";
import { migrations } from "./migrations";
import Page from "./models/Page";
import Book from "./models/Book";
// import User from './User';
// import Post from './Post';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, // enables faster JavaScript Interface (JSI) mode for improved performance
  migrations,
  onSetUpError: (error) => {
    console.log("error", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Book, Page],
});
