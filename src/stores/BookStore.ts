import { create } from "zustand";
import Book from "../localDb/models/Book";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDefaultBook, insertDefaultBook } from "../api/local-journal";
interface BookState {
  currentBook: Book | null;
  setCurrentBook: (book: Book) => void;
  initializeBookStore: () => void;
}
export const useBookStore = create<BookState>((set, get) => ({
  currentBook: null,
  setCurrentBook: (book: Book) => set(() => ({ currentBook: book })),
  initializeBookStore: async () => {
    let book = await fetchDefaultBook();
    if (!book) {
      book = await insertDefaultBook();
    }
    console.log(book?.type);
    set(() => ({ currentBook: book }));
  },
}));
