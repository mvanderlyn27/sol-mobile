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
import { canvasStore$, defaultCanvas } from "./CanvasStore";
import { jsonToCanvas } from "../services/Canvas";

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
  const daysToLoad = pageStore$.loadedPages.get();

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
  const groupId = groupStore$.selectedGroup.get();
  const out = Object.values(pages || {}).find((page: Page) => {
    return page.created_by === curUser && page.date === date && page.group_id === groupId;
  });
  return out;
};

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

/**
 * Load initial members and dates, setting up a specified number of unique dates.
 */
function loadInitialPages() {
  const allDates = getAllUniqueDates(START_PAGE_NUM); // Get unique dates for initial range

  // Batch update to set members and initial date range
  batch(() => {
    pageStore$.dates.set(allDates); // Set initial dates range
    pageStore$.loadedPages.set(START_PAGE_NUM); // Track number of loaded dates/pages
  });
}

/**
 * Load additional dates, extending the date range backward in time.
 */
export function loadMorePages() {
  const { loadedPages } = pageStore$.get();
  const newLoadedPages = loadedPages + LOAD_MORE_PAGES;

  // Extend the date range with additional dates further back in time
  const newDates = getAllUniqueDates(newLoadedPages);

  // Batch update to set the new expanded date range
  batch(() => {
    pageStore$.dates.set(newDates); // Update dates to include additional range
    pageStore$.loadedPages.set(newLoadedPages); // Update the count of loaded dates
  });
}

/**
 * Get unique dates from today, descending backward by `daysCount`.
 */
function getAllUniqueDates(daysCount: number): DateItem[] {
  const start = startOfToday();
  const end = subDays(start, daysCount - 1); // Calculate the end date based on the daysCount
  const dates = eachDayOfInterval({ start, end });

  // Map each date to a DateItem with unique IDs
  return dates.map((date) => ({
    id: generateId(),
    date: format(date, "yyyy-MM-dd"),
  }));
}

/**
 * Set the current row and column based on navigation inputs.
 */
export function navigateToPage(row: number, col: number) {
  const { dates } = pageStore$.get();
  const maxCol = dates.length - 1;

  pageStore$.curRow.set(Math.max(0, Math.min(row, pageStore$.members.length - 1)));
  pageStore$.curCol.set(Math.max(0, Math.min(col, maxCol)));
}

/**
 * Toggle edit mode
 */
export function handleEdit() {
  beginBatch();
  console.log("editing");
  pageStore$.editMode.set(true);
  uiStore$.displayCanvasMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const pageId = getPageForUser(user || "", day.date)?.id;
  if (pageId) {
    const page = pages$?.get()[pageId];
    canvasStore$.curCanvas.set(jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas);
  }
  endBatch();
}
export function handlePageSave() {
  beginBatch();
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  // canvasStore$.curCanvas.set(defaultCanvas);

  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const curPageId = getPageForUser(user || "", day.date)?.id;
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
    const curDate = day.date;
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
  pageStore$.editMode.set(false);
  canvasStore$.curCanvas.set({ ...defaultCanvas });
  endBatch();
}
export function handlePageCancel() {
  beginBatch();
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  canvasStore$.curCanvas.set(defaultCanvas);
  pageStore$.editMode.set(false);
  endBatch();
}
