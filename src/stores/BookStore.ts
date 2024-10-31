import { observable } from "@legendapp/state";
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Book, BookType } from "../types/shared.types";
const generateId = () => uuidv4();
configureSyncedSupabase({
  generateId,
});
interface BookStore {
  selectedBook: string | null;
  //   books: Book | null;
  addBook: (type: BookType) => void;
}

export const books$ = observable(
  syncedSupabase({
    supabase,
    collection: "books",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    // persist: { name: "books", retrySync: true },
    // changeSince: 'last-sync'
  })
);

export const bookStore$ = observable<BookStore>({
  selectedBook: null,
  // books: books$.get()
  addBook: (type: BookType) => {
    const id = generateId();
    // books$[id].set({
    //   id,
    //   type,
    //   created_at: null,
    //   updated_at: null,
    // });
  },
});
