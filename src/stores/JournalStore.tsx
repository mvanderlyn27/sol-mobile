import { create } from "zustand";
import { format, addDays, parseISO } from "date-fns";
import { fetchPageByDay } from "../api/local-journal";
import Page from "../localDb/models/Page";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
import { useBookStore } from "./BookStore";
import { nullValue } from "@nozbe/watermelondb/RawRecord";

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

type JournalStore = {
  pagesByDate: Record<string, Page | null>;
  selectedDate: string | null;
  editMode: boolean;
  initializeStore: () => Promise<void>;
  setSelectedDate: (date: Date) => Promise<void>;
  loadInitialPages: () => Promise<void>;
  loadMorePages: () => Promise<void>;
  setEditMode: (val: boolean) => void;
};

export const useJournalStore = create<JournalStore>((set, get) => ({
  pagesByDate: {},
  selectedDate: null,
  editMode: true,

  initializeStore: async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    set({ selectedDate: today });
    await get().loadInitialPages();
  },

  loadInitialPages: async () => {
    const { selectedDate } = get();
    if (!selectedDate) return;

    const parsedDate = parseISO(selectedDate);
    const prevDate1 = format(addDays(parsedDate, -1), "yyyy-MM-dd");
    const prevDate2 = format(addDays(parsedDate, -2), "yyyy-MM-dd");
    const curBook = useBookStore.getState().currentBook;
    if (!curBook) return;

    // Fetch today's and yesterday's pages
    const todayPage = await fetchPageByDay(curBook, selectedDate);
    const prevPage1 = await fetchPageByDay(curBook, prevDate1);
    const prevPage2 = await fetchPageByDay(curBook, prevDate2);
    // console.log("pages: ", todayPage?.date, yesterdayPage?.date);
    set(() => ({
      pagesByDate: {
        [prevDate1]: prevPage1,
        [prevDate2]: prevPage2,
        [selectedDate]: todayPage,
      },
    }));
  },

  setSelectedDate: async (date: Date) => {
    const newDate = format(date, "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");

    // Prevent navigating to dates in the future
    if (newDate > today) return;

    set({ selectedDate: newDate });

    const { pagesByDate } = get();
    if (!pagesByDate[newDate]) {
      const curBook = useBookStore.getState().currentBook;
      if (!curBook) return;
      const newPage = await fetchPageByDay(curBook, newDate);
      set((state) => ({
        pagesByDate: {
          ...state.pagesByDate,
          [newDate]: newPage,
        },
      }));
    }
  },

  loadMorePages: async () => {
    //should add the next 2 dates to the store
    const { pagesByDate } = get();

    // Find the earliest date in pagesByDate
    const sortedDates = Object.keys(pagesByDate).sort();
    const firstDate = sortedDates[0];
    const previousDate1 = format(addDays(parseISO(firstDate), -1), "yyyy-MM-dd");
    const previousDate2 = format(addDays(parseISO(firstDate), -2), "yyyy-MM-dd");

    const curBook = useBookStore.getState().currentBook;
    if (!curBook) return;
    // Fetch the previous page and add it if it doesn't exist
    let prevPage1: Page | null = null;
    let prevPage2: Page | null = null;
    if (!pagesByDate[previousDate1]) {
      prevPage1 = await fetchPageByDay(curBook, previousDate1);
    }
    if (!pagesByDate[previousDate2]) {
      prevPage2 = await fetchPageByDay(curBook, previousDate2);
    }
    set((state) => ({
      pagesByDate: {
        ...state.pagesByDate,
        [previousDate1]: prevPage1 || null,
        [previousDate2]: prevPage2 || null,
      },
    }));
  },
  setEditMode: (val: boolean) => set({ editMode: val }),
}));
