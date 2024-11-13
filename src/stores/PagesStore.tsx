import {
  batch,
  beginBatch,
  computed,
  endBatch,
  observable,
  observe,
  syncState,
  when,
  whenReady,
} from "@legendapp/state";
import {
  format,
  addDays,
  parseISO,
  startOfDay,
  isBefore,
  isEqual,
  eachDayOfInterval,
  subDays,
  startOfToday,
} from "date-fns";
import { Canvas, CanvasItem, GroupMember, ImageType, Page } from "../types/shared.types";
import { Dimensions } from "react-native";
import { supabase } from "../lib/supabase";
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import { Json } from "../types/supabase.types";
import authStore$ from "./AuthStore";
import { uiStore$ } from "./UIStore";
import { groupStore$ } from "./GroupStore";
import { filterGroupMembers, groupMembers$ } from "./MemberStore";
import { canvasStore$ } from "./CanvasStore";
import { jsonToCanvas } from "../services/Canvas";
import { User } from "@supabase/supabase-js";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const defaultCanvas: Canvas = {
  id: generateId(),
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [] as CanvasItem[],
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  maxZIndex: 0,
};

const DEFAULT_PAGE: Page = {
  id: "",
  canvas: null,
  date: format(new Date(), "yyyy-MM-dd"),
  created_at: format(new Date(), "yyyy-MM-dd"),
  updated_at: format(new Date(), "yyyy-MM-dd"),
  deleted: false,
  created_by: "",
  group_id: "",
};

//@ts-ignore
export const pages$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "pages",
    select: (from: any) => from.select("*"),
    filter: (select) => select.eq("group_id", groupStore$.selectedGroup.get() || ""),
    actions: ["read", "create", "update", "delete"],
    // persist: { name: "pages", retrySync: true },
    // retry: {
    //   infinite: true,
    // },
  })
);

export const getPageIdsForUser = (curUser: string, pagesMap: Record<string, Page>): Map<string, string> | null => {
  if (!curUser || !pagesMap) {
    return null;
  }
  const daysToLoad = journalStore$.loadedDates.get();

  const today = startOfDay(new Date());
  const selectedGroup = groupStore$.selectedGroup.get();

  const userPages = Object.values(pagesMap)
    .filter((page) => page.group_id === selectedGroup && page.created_by === curUser)
    .reduce<Record<string, Page>>((acc, page) => {
      acc[page.date] = page; // Store by date for quick lookup
      return acc;
    }, {});

  //map of date -> id
  const pageMap: Map<string, string> = new Map();
  let currentDate = today;

  for (let i = 0; i < daysToLoad; i++) {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const pageForDate = userPages[dateKey];
    if (pageForDate) {
      pageMap.set(dateKey, pageForDate.id);
    } else {
      pageMap.set(dateKey, "");
    }
    currentDate = subDays(currentDate, 1); // Move back a day
  }

  return pageMap;
};

export const getPageForUser = (curUser: string, date: string): Page | undefined => {
  const pages = pages$.get();
  const out = Object.values(pages || {}).find((page: Page) => {
    return page.created_by === curUser && page.date === date;
  });
  return out;
};
export const getDateRange = (): string[] => {
  const start = startOfToday();
  const loadedDays = journalStore$.loadedDates.get();
  const end = subDays(start, loadedDays - 1);
  const dates = eachDayOfInterval({ start, end });
  return dates.map((date) => format(date, "yyyy-MM-dd"));
};
const INITIAL_LOAD_DAYS = 7;

interface JournalStore {
  // pageMap: Map<string, Page>;
  currentDate: string;
  currentPageId: string | null;
  loadedDates: number;
  currentUser?: GroupMember;
  currentUserIndex?: number | null;
  isUsersPage: boolean;
  loading: boolean;
  editMode: boolean;
  reactionMode: boolean;
  edit: () => void;
  react: () => void;
  saveReact: () => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  cancelReact: () => void;
}
//@ts-ignore
export const journalStore$ = observable<JournalStore>({
  //@ts-ignore
  currentDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
  currentPageId: null,
  loadedDates: INITIAL_LOAD_DAYS,
  // currentUser: () => authStore$.session.user.get(),
  currentUser: undefined,
  currentUserIndex: 0,
  isUsersPage: true,
  loading: false,
  editMode: false,
  reactionMode: false,
  edit: () => {
    beginBatch();
    console.log("editing");
    journalStore$.editMode.set(true);
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayJournalMenu.set(false);
    const pageId = journalStore$.currentPageId.get();
    console.log("page", pageId);
    if (pageId) {
      const page = pages$?.get()[pageId];
      canvasStore$.curCanvas.set(jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas);
    }
    console.log("canvas", canvasStore$.curCanvas.get());
    console.log("editmode", journalStore$.editMode.get());
    endBatch();
  },
  react: () => {},
  saveReact: () => {},
  saveEdit: () => {
    beginBatch();
    uiStore$.displayJournalMenu.set(true);
    uiStore$.displayCanvasMenu.set(false);
    // canvasStore$.curCanvas.set(defaultCanvas);
    const curPageId = journalStore$.currentPageId.get();
    const newCanvas = canvasStore$.curCanvas.get();
    console.log("saving: cur pageId", curPageId);
    if (curPageId) {
      const currentPage = pages$[curPageId].get();
      console.log("saving existing page", newCanvas);
      //@ts-ignore
      pages$[curPageId].set({ ...currentPage, canvas: newCanvas });
      // ADD UPLOAD IMAGE HERE
    } else {
      const id = generateId();
      const groupId = groupStore$.selectedGroup.get();
      const userId = authStore$.session.get()?.user.id;
      const curDate = journalStore$.currentDate.get();
      if (!groupId || !userId) {
        console.log("missing info");
        return;
      }
      //@ts-ignore
      const newPage = {
        id: id,
        group_id: groupId,
        created_by: userId,
        date: curDate,
        canvas: newCanvas,
      } as Page;
      console.log("saving new page", newPage);
      pages$[id].set(newPage);
    }
    // ADD UPLOAD IMAGE HERE
    journalStore$.editMode.set(false);
    canvasStore$.curCanvas.set(null);
    endBatch();
  },
  cancelReact: () => {
    uiStore$.displayJournalMenu.set(true);
    uiStore$.displayReactMenu.set(false);
  },
  cancelEdit: () => {
    beginBatch();
    uiStore$.displayJournalMenu.set(true);
    uiStore$.displayCanvasMenu.set(false);
    canvasStore$.curCanvas.set(defaultCanvas);
    journalStore$.editMode.set(false);
    endBatch();
  },
});
interface PageStore {
  // `${date}` -> Canvas
  pages: PageMap[];
  members: GroupMember[];
  dates: DateItem[];
  curRow: number;
  curCol: number;
  editMode: boolean;
  loadedPages: number;
  ready: boolean;
  //load more pages
  //
}
interface DateItem {
  id: string;
  date: string;
}
interface PageMap {
  id: string;
  pages: Map<string, Canvas>;
}
// Constants
const START_PAGE_NUM = 7; // Number of pages to load initially per user
const LOAD_MORE_PAGES = 5; // Number of pages to load in each additional batch
// Observable store for PageStore
export const pageStore$ = observable<PageStore>({
  pages: [],
  members: [],
  dates: [],
  curRow: 0,
  curCol: 0,
  editMode: false,
  loadedPages: START_PAGE_NUM,
  ready: false,
});

/**
 * Initialize the group members and pages for a specific group.
 */
export function initializePageStore() {
  if (pageStore$.ready.get()) {
    return;
  }
  loadGroupMembers();
  loadInitialPages();
  pageStore$.ready.set(true);
}

/**
 * Load group members for a given groupId.
 */
function loadGroupMembers() {
  const currentUserId = authStore$.session.user.id.get();
  const users = Object.values(
    filterGroupMembers(groupMembers$.get(), groupStore$.selectedGroup.get() || "") || {}
  ).sort((a, b) => {
    if (a.user_id === currentUserId) return -1; // Move the logged-in user to the top
    if (b.user_id === currentUserId) return 1; // Keep the logged-in user at the top
    return 0; // Leave the order unchanged for others
  });
  pageStore$.members.set(users);
}

const getPagesForUser = (userId: string, count: number) => {
  const pages = pages$.get();
  let curCount = 0;
  const out = Object.values(pages || {}).filter((page) => {
    curCount += 1;
    return page.created_by === userId && curCount < count;
  });
  return out;
};
/**
 * Load initial pages for each member in the group.
 */

function loadInitialPages() {
  const { members } = pageStore$.get();
  const initialPages: PageMap[] = [];
  const allDates = getAllUniqueDates(); // Get all unique dates for initial pages

  // Fetch START_PAGE_NUM pages for each group member
  for (const member of members) {
    const pagesForMember = getPagesForUser(member.user_id, START_PAGE_NUM);
    const pagesMap = new Map<string, Canvas>();

    // Populate pagesMap with actual canvas data for available dates
    pagesForMember.forEach((page) =>
      pagesMap.set(page.date, jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas)
    );

    // Ensure all dates have an entry in pagesMap, fill missing dates with defaultCanvas
    allDates.forEach((dateItem) => {
      if (!pagesMap.has(dateItem.date)) {
        pagesMap.set(dateItem.date, defaultCanvas);
      }
    });

    initialPages.push({ id: generateId(), pages: pagesMap });
  }

  // Update observable properties in a batch to minimize re-renders
  batch(() => {
    pageStore$.pages.set(initialPages);
    pageStore$.dates.set(allDates);
    pageStore$.loadedPages.set(START_PAGE_NUM);
  });
}

/**
 * Fetch more pages when the user reaches the end of the current loaded pages.
 */
export function loadMorePages() {
  const { members, loadedPages } = pageStore$.get();
  const newPages: PageMap[] = [];
  const newLoadedPages = loadedPages + LOAD_MORE_PAGES;

  // Calculate new dates for additional loaded pages
  const allDates = getAllUniqueDates().slice(0, newLoadedPages);

  // Fetch additional pages for each group member
  for (const member of members) {
    const morePagesForMember = getPagesForUser(member.user_id, LOAD_MORE_PAGES);
    const existingPagesMap = pageStore$.pages.get()[members.indexOf(member)].pages;

    // Add newly fetched pages to existingPagesMap
    morePagesForMember.forEach((page) => {
      existingPagesMap.set(page.date, jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas);
    });

    // Ensure all dates in the expanded range have an entry in existingPagesMap
    allDates.forEach((dateItem) => {
      if (!existingPagesMap.has(dateItem.date)) {
        existingPagesMap.set(dateItem.date, defaultCanvas);
      }
    });

    // Create the new PageMap entry for the current member
    newPages.push({
      id: pageStore$.pages.get()[members.indexOf(member)].id, // Keep existing ID for consistency
      pages: existingPagesMap,
    });
  }

  // Batch updates to minimize re-renders
  batch(() => {
    pageStore$.pages.set(newPages);
    pageStore$.dates.set(allDates); // Update dates to reflect expanded range
    pageStore$.loadedPages.set(newLoadedPages);
  });
}

/**
 * Get unique dates from all pages, sorted in descending order.
 */
function getAllUniqueDates(): DateItem[] {
  const start = startOfToday();
  const loadedDays = pageStore$.loadedPages.get();
  // Subtract `loadedDays - 1` to get the correct range
  const end = subDays(start, loadedDays - 1);
  const dates = eachDayOfInterval({ start, end });

  return dates.map((date) => {
    return { id: generateId(), date: format(date, "yyyy-MM-dd") };
  });
}

/**
 * Set the current row and column based on navigation inputs.
 */
export function navigateToPage(row: number, col: number) {
  const { pages, dates } = pageStore$.get();
  const maxRow = pages.length - 1;
  const maxCol = dates.length - 1;

  pageStore$.curRow.set(Math.max(0, Math.min(row, maxRow)));
  pageStore$.curCol.set(Math.max(0, Math.min(col, maxCol)));
}

/**
 * Toggle edit mode
 */
export function toggleEditMode() {
  pageStore$.editMode.set(!pageStore$.editMode.get());
}
