import { batch, computed, observable, observe, syncState, when, whenReady } from "@legendapp/state";
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
import { Canvas, CanvasImage, CanvasItem, GroupMember, ImageType, Page } from "../types/shared.types";
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
import { canvasStore$, clearCanvas, defaultCanvas } from "./CanvasStore";
import { jsonToCanvas } from "../services/Canvas";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import * as FileSystem from "expo-file-system";
import StorageService from "@/src/api/storage";
import { Blurhash } from "react-native-blurhash";
import { resizeImage } from "@/src/services/Media";

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
  ready: true,
});

/**
 * Initialize the group members and pages for a specific group.
 */
export function initializePageStore() {
  loadGroupMembers();
  loadInitialPages();
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
  pageStore$.dates.set(newDates); // Update dates to include additional range
  pageStore$.loadedPages.set(newLoadedPages); // Update the count of loaded dates
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
  console.log("editing");
  pageStore$.editMode.set(true);
  uiStore$.displayCanvasMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const pageId = getPageForUser(user || "", day.date)?.id;
  if (pageId) {
    const page = pages$?.get()[pageId];
    const canvas = jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas;
    canvasStore$.curCanvas.set({ ...canvas });
  }
}
const uploadImage = async (
  pageId: string,
  imageId: string,
  index: number,
  selectedImageUri: string,
  width: number,
  height: number
) => {
  // if (!result.canceled) {
  // const selectedImageUri = result.assets[0].uri;
  // Resize the image to 100x100 using ImageManipulator
  const blurhash = await ImageManipulator.manipulateAsync(selectedImageUri, [{ resize: { width: 100, height: 100 } }], {
    compress: 0.5,
    format: ImageManipulator.SaveFormat.PNG,
  })
    .then((resizedImage) => Blurhash.encode(resizedImage.uri, 4, 3))
    .then((blurhash) => blurhash)
    .catch((error) => {
      console.error("Error generating blurhash:", error);
      // Alert.alert("Error", "Failed to generate blurhash.");
      return null;
    });

  const image = await resizeImage(selectedImageUri, width, height)
    .then((image) => image)
    .catch((error) => {
      console.log("error optimizing image");
      return null;
    });

  if (!image || !blurhash) {
    // setLoading(false);
    return;
  }
  const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" });
  const { success, data, error } = await StorageService.uploadFile({
    bucket: "page_photos",
    filePath: `${pageId}/${imageId}.webp`,
    base64: base64,
    fileExtension: "webp",
    mimeType: "image/webp",
  });
  console.log("done uploading", error, data, success);
  if (error || !data) {
    console.error("error uploading", error);
    //show notif here

    // setLoading(false);
    return null;
  }
  const path = supabase.storage.from("page_photos").getPublicUrl(`${pageId}/${imageId}.webp`);
  console.log("starting last update");
  // beginBatch();
  // groups$[groupId].cover_url.set(path.data.publicUrl + `?t=${new Date().toISOString()}`);
  // groups$[groupId].cover_placeholder.set(blurhash);
  // endBatch();
  console.log("finished update", path);
  return { index: index, path: path.data.publicUrl, blurhash: blurhash };
};
const uploadImages = async (pageId: string) => {
  const newCanvas = canvasStore$.curCanvas.get();
  if (!newCanvas || !pageId) {
    console.log("no items to upload");
    return;
  }
  let newItems: CanvasItem[] = [];

  // Create an array of promises
  const promiseAr = newCanvas.items.map((item, index) => {
    if (item.type !== "image" || (item.type === "image" && item.path.includes("https://"))) {
      newItems.push(item);
      return Promise.resolve(null); // Return a resolved promise for non-image items
    } else {
      // Upload image and handle post-completion logic
      return uploadImage(pageId, item.id, index, item.path, item.width * 1.5, item.height * 1.5)
        .then((result) => {
          if (result) {
            console.log(`Image uploaded: ${result.path}`);
            // Perform any additional logic after each upload here
          }
          return result;
        })
        .catch((error) => {
          console.error(`Failed to upload image with ID ${item.id}:`, error);
          return null; // Handle error and continue
        });
    }
  });

  // Wait for all promises to complete
  const results = await Promise.all(promiseAr || []);

  // Process the results after all uploads
  results.forEach((result, index) => {
    if (result) {
      console.log(`Processed result for item at index ${index}:`, result);
      // Update the newItems array or perform other actions
      const curItem: CanvasImage = newCanvas.items[result.index] as CanvasImage;
      newItems.push({
        ...curItem,
        path: result.path,
        placeholder: result.blurhash,
      });
    }
  });

  // Return new items or perform any final processing
  canvasStore$.curCanvas.items.set(newItems);
};
export async function handlePageSave() {
  // beginBatch();
  console.log("saving canvas");
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  pageStore$.ready.set(false);
  // canvasStore$.curCanvas.set(defaultCanvas);

  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const curPageId = getPageForUser(user || "", day.date)?.id;
  const id = generateId();
  await uploadImages(curPageId || id);
  const newCanvas = canvasStore$.curCanvas.get();
  console.log("saving: cur pageId", curPageId);
  if (curPageId) {
    const currentPage = pages$[curPageId].get();
    console.log("saving existing page", newCanvas);
    //@ts-ignore
    pages$[curPageId].set({ ...currentPage, canvas: newCanvas });
    // ADD UPLOAD IMAGE HERE
  } else {
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
  console.log("uploaded images, saved to backend");
  pageStore$.editMode.set(false);
  canvasStore$.curCanvas.set({ ...defaultCanvas });
  pageStore$.ready.set(true);
  // endBatch();
}
export function handlePageCancel() {
  console.log("canceling edits");
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  clearCanvas();
  pageStore$.editMode.set(false);
}
