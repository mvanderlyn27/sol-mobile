import { observable, observe, syncState, when, whenReady } from "@legendapp/state";
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Book, BookType } from "../types/shared.types";
import authStore$ from "./AuthStore";
import { syncObservable } from "@legendapp/state/sync";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
interface BookStore {
  selectedBook: string | null;
  isReady: boolean;
}

export const books$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "books",
    select: (from) => from.select("*"),
    persist: { name: "books" },
  })
);

export const bookStore$ = observable<BookStore>({
  selectedBook: books$.get() ? books$.get()[0].id : null,
  isReady: false,
});
export const initBookStore = async () => {
  console.log("book store init");
  const status$ = syncState(books$);
  observe(() => {
    // This will re-run as the status changes
    const { isLoaded, error } = status$.get();
    if (error) {
      console.error(error);
      // Handle error
    } else if (isLoaded) {
      console.log("loaded");
      // Do the thing
      const selectedBook = bookStore$.selectedBook;
      const books = books$.get();
      if (!selectedBook) {
        bookStore$.selectedBook.set(books[0].id);
        console.log("books", books);
      }
      bookStore$.isReady.set(true);
    }
  });
};
export const addBook = (type: BookType): string | null => {
  console.log("trying to add book");
  const userId = authStore$.session.get()?.user.id;
  if (!userId) {
    console.log("Error: user not logged in");
    return null;
  }
  console.log(userId);
  const id = generateId();
  books$[id].set({
    id,
    type,
    // created_at: new Date().toISOString(),
    // updated_at: new Date().toISOString(),
    // created_by: userId,
    // deleted: false,
  });
  return id;
};

export const deleteBook = (id: string) => {
  console.log("removing id", id);
  if (!books$[id]) {
    console.log("id not in list");
  }
  books$[id].delete();
};
