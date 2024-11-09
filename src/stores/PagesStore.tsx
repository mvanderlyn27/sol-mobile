import { beginBatch, computed, endBatch, observable, observe, syncState, when, whenReady } from "@legendapp/state";
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const defaultCanvas: Canvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [] as CanvasItem[],
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  curId: 0,
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
    persist: { name: "pages", retrySync: true },
    retry: {
      infinite: true,
    },
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
  currentUser?: string;
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
  currentUser: authStore$.session.get()?.user.id,
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
    uiStore$.displayJournalMenu.set(true);
    uiStore$.displayCanvasMenu.set(false);
    journalStore$.editMode.set(false);
  },
  cancelReact: () => {
    uiStore$.displayJournalMenu.set(true);
    uiStore$.displayReactMenu.set(false);
  },
  cancelEdit: () => {
    uiStore$.displayJournalMenu.set(true);
    uiStore$.displayCanvasMenu.set(false);
    journalStore$.editMode.set(false);
  },
});
