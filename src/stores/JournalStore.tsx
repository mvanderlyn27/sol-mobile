import { computed, observable, observe, syncState, when, whenReady } from "@legendapp/state";
import { format, addDays, parseISO, startOfDay } from "date-fns";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
import { supabase } from "../lib/supabase";
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { customSupabaseSynced, generateId, persistOptions } from "./AsyncStorage";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import { bookStore$ } from "./BookStore";
import { Json } from "../types/supabase.types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const defaultCanvas: Canvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [] as CanvasItem[],
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  curId: 0,
  maxZIndex: 0,
};

const DEFAULT_PAGE = {
  id: "",
  bookId: "",
  canvas: defaultCanvas,
  date: "",
};

//@ts-ignore
export const pages$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "pages",
    select: (from) => from.select("*"),
    filter: (select) => select.eq("book_id", bookStore$.selectedBook),
    actions: ["read", "create", "update", "delete"],
    persist: { name: "pages", retrySync: true },
    retry: {
      infinite: true,
    },
  })
);
//@ts-ignore
export const journalStore$ = observable({
  pages: computed(() =>
    Object.values(pages$.get()).reduce((acc: Record<string, Json>, page) => {
      const dateKey = format(new Date(page.date), "yyyy-MM-dd");
      acc[dateKey] = page;
      return acc;
    }, {})
  ),
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  currentDates: [format(new Date(), "yyyy-MM-dd")],
  loading: false,
  editMode: false,

  updatePage: () => {},
  deletePage: () => {},
});
export const addPage = (date?: string | undefined, canvas?: Canvas): string | null => {
  console.log("trying to add book");
  const curBook = bookStore$.selectedBook.get();
  if (!curBook) {
    console.error("no selected book can't add page");
    return null;
  }
  if (!journalStore$.selectedDate.get() && !date) {
    console.log("no selected date, or passed in date");
    return null;
  }
  const id = generateId();
  //@ts-ignore
  pages$[id].set({
    id,
    book_id: curBook,
    date: date ? format(date, "yyyy-MM-dd") : journalStore$.selectedDate.get(),
    canvas: JSON.stringify(canvas || defaultCanvas),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return id;
};
