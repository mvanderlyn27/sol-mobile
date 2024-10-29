import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, addDays, parseISO } from "date-fns"; // for date calculations
import { fetchPageByDay } from "../api/local-journal";
import Page from "../localDb/models/Page";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
import { useBookStore } from "./BookStore";

type JournalStore = {
  leftPage: Page | null;
  currentPage: Page | null;
  rightPage: Page | null;
  selectedDate: string | null;
  updatePages: () => Promise<void>;
  initializeStore: () => Promise<void>;
  setSelectedDate: (date: Date) => Promise<void>;
};
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
export const useJournalStore = create<JournalStore>((set, get) => ({
  leftPage: null,
  currentPage: null,
  rightPage: null,
  selectedDate: null,
  initializeStore: async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    set({ selectedDate: today });
    await get().updatePages();
  },
  updatePages: async () => {
    //we want to update the current date, and load the pages to the left and right of
    const selectedDate = get().selectedDate;
    if (!selectedDate) return;
    const { currentBook } = useBookStore.getState();
    if (!currentBook?.id) {
      console.warn("No current book selected");
      return;
    }
    const parsedDate = parseISO(selectedDate);
    const today = format(new Date(), "yyyy-MM-dd");
    const prevDate = format(addDays(parsedDate, -1), "yyyy-MM-dd");
    const nextDate = format(addDays(parsedDate, +1), "yyyy-MM-dd");
    console.log(prevDate, selectedDate, nextDate);
    let leftPage: Page | null = await fetchPageByDay(currentBook, prevDate);
    let currentPage: Page | null = await fetchPageByDay(currentBook, selectedDate);
    let rightPage: Page | null = null;

    if (selectedDate !== today) {
      rightPage = await fetchPageByDay(currentBook, nextDate);
    }

    console.log("left", leftPage?.date, "cur", currentPage?.date, "right", rightPage?.date);
    set({ leftPage, currentPage, rightPage });
  },
  setSelectedDate: async (date: Date) => {
    //we want to update the current date
    if (date > new Date()) {
      return;
    }
    set({ selectedDate: format(date, "yyyy-MM-dd") });
    await get().updatePages();
  },
}));
