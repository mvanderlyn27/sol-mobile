import { Observable, batch, computed, observable, observe, syncState, when, whenReady } from "@legendapp/state";
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
  differenceInCalendarDays,
} from "date-fns";
import {
  Canvas,
  CanvasImage,
  CanvasText,
  CanvasItem,
  CanvasItemBase,
  GroupMember,
  ImageItem,
  ImageType,
  Page,
  PageItem,
  TextItem,
} from "../types/shared.types";
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
import { reactStore$ } from "./ReactStore";
import { posthog } from "../services/Posthog";
import { images$ } from "./ImageStore";

export const pages$ = observable<Record<string, Page>>(
  customSupabaseSynced({
    supabase,
    collection: "pages_test",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: "pages_test",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);

export const pageItems$ = observable<Record<string, PageItem>>(
  customSupabaseSynced({
    supabase,
    collection: "page_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: "page_items",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);

export const imagesItems$ = observable<Record<string, ImageItem>>(
  customSupabaseSynced({
    supabase,
    collection: "image_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: "image_items",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);
export const textItems$ = observable<Record<string, TextItem>>(
  customSupabaseSynced({
    supabase,
    collection: "text_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: "text_items",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);

export const getPageForUser = (pages: Record<string, Page>, curUser: string, date: string): Page | undefined => {
  const groupId = groupStore$.selectedGroup.get();
  const out = Object.values(pages || {}).find((page: Page) => {
    return page.created_by === curUser && page.date === date && page.group_id === groupId;
  });
  return out;
};

interface PageStore {
  members: GroupMember[];
  initialUser: string | undefined;
  initialDate: string | undefined;
  dates: DateItem[];
  curRow: number;
  curCol: number;
  editMode: boolean;
  loadedPages: number;
  saving: boolean;
  ready: boolean;
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
  members: [],
  dates: [],
  initialDate: undefined,
  initialUser: undefined,
  curRow: 0,
  curCol: 0,
  editMode: false,
  loadedPages: START_PAGE_NUM,
  saving: false,
  ready: false,
});

/**
 * Initialize the group members and pages for a specific group.
 */
export function initializePageStore() {
  pageStore$.ready.set(false);
  // const syncPage$ = syncState(pages$);
  // await syncPage$.sync();
  // await when(syncPage$.isLoaded);
  const user = pageStore$.initialUser.get();
  const day = pageStore$.initialDate.get();
  loadGroupMembers(user);
  loadInitialPages(day);
  pageStore$.ready.set(true);
}

/**
 * Load group members for a given groupId.
 */
function loadGroupMembers(user?: string) {
  const currentUserId = authStore$.session.user.id.get();
  const users = Object.values(
    filterGroupMembers(groupMembers$.get(), groupStore$.selectedGroup.get() || "") || {}
  ).sort((a, b) => {
    if (a.user_id === currentUserId) return -1; // Move the logged-in user to the top
    if (b.user_id === currentUserId) return 1; // Keep the logged-in user at the top
    return 0; // Leave the order unchanged for others
  });
  const userIds = users.map((user) => user.user_id);
  if (user && userIds.includes(user)) {
    pageStore$.curRow.set(userIds.indexOf(user));
  }
  pageStore$.members.set(users);
}

/**
 * Load initial members and dates, setting up a specified number of unique dates.
 */
function loadInitialPages(date?: string) {
  if (date) {
    const dateNum = differenceInCalendarDays(new Date(), new Date(date));
    const allDates = getAllUniqueDates(Math.max(dateNum, START_PAGE_NUM)); // Get unique dates for initial range
    const index = allDates.findIndex((dateObject) => dateObject.date === date);
    pageStore$.dates.set(allDates); // Set initial dates range
    pageStore$.curCol.set(index);
  } else {
    const allDates = getAllUniqueDates(START_PAGE_NUM); // Get unique dates for initial range
    pageStore$.dates.set(allDates); // Set initial dates range
  }
  pageStore$.loadedPages.set(START_PAGE_NUM); // Track number of loaded dates/pages
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
export async function handleEdit() {
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const pageId = getPageForUser(pages$.get(), user || "", day.date)?.id;
  if (pageId) {
    console.log("editing page");
    const page = pages$?.get()[pageId];
    /*
      NEED TO FIX THIS

    */
    // await when(getCanvas$(pageId));
    // const canvas = getCanvas$(pageId).get() || { ...defaultCanvas };
    // canvasStore$.curCanvas.set({ ...canvas });
  } else {
    console.log("editing with no page, clearing");
    clearCanvas();
  }
  uiStore$.displayCanvasMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  pageStore$.editMode.set(true);
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
      posthog.capture("upload-page-image-error", { error });
      // Alert.alert("Error", "Failed to generate blurhash.");
      return null;
    });

  const image = await resizeImage(selectedImageUri, width, height)
    .then((image) => image)
    .catch((error) => {
      console.log("error optimizing image");
      posthog.capture("upload-page-image-error", { error });
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
    posthog.capture("upload-page-image-error", { error });
    //show notif here

    // setLoading(false);
    return null;
  }
  const path = supabase.storage.from("page_photos").getPublicUrl(`${pageId}/${imageId}.webp`);
  console.log("starting last update");
  // groups$[groupId].cover_url.set(path.data.publicUrl + `?t=${new Date().toISOString()}`);
  // groups$[groupId].cover_placeholder.set(blurhash);
  console.log("finished update", path);
  return { index: index, path: path.data.publicUrl, blurhash: blurhash };
};
const uploadImages = async (pageId: string): Promise<CanvasItem[]> => {
  const newCanvas = canvasStore$.curCanvas.get();
  if (!newCanvas || !pageId) {
    console.log("no items to upload");
    return [];
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
          posthog.capture("upload-page-images-error: " + item.id, { error });

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
  // canvasStore$.curCanvas.items.set(newItems);
  return newItems;
};
export async function handlePageSave() {
  pageStore$.saving.set(true);
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const curPageId = getPageForUser(pages$.get(), user || "", day.date)?.id;
  // console.log("Saving: cur pageId", curPageId);
  let pageId = curPageId || generateId();
  let newPage = null;
  try {
    // Perform async upload outside the `batch()` block
    const updatedCanvasItems = await uploadImages(pageId);
    // console.log("updated canvas", updatedCanvasItems);
    batch(() => {
      uiStore$.displayJournalMenu.set(true);
      uiStore$.displayCanvasMenu.set(false);
      // canvasStore$.curCanvas.items.set(updatedCanvas);
      const newCanvas = {
        ...canvasStore$.curCanvas.get(),
        items: updatedCanvasItems,
      };
      console.log("saving canvas", newCanvas);
      if (curPageId) {
        pageId = curPageId;
        const currentPage = pages$[curPageId].get();
        // console.log("saving existing page", newCanvas);
        //@ts-ignore
        newPage = { ...currentPage, canvas: newCanvas } as Page;
      } else {
        const groupId = groupStore$.selectedGroup.get();
        const userId = authStore$.session.get()?.user.id;
        const curDate = day.date;
        if (!groupId || !userId) {
          console.log("Missing info");
          throw new Error("Required group ID or user ID is missing.");
        }
        //@ts-ignore
        newPage = {
          id: pageId,
          group_id: groupId,
          created_by: userId,
          date: curDate,
          canvas: newCanvas,
        } as Page;
        // console.log("new page", newCanvas);
      }

      // Update state within the batch
      clearCanvas();
      pages$[pageId].set(newPage);
    });
  } catch (error) {
    console.error("Error during page save:", error);
    posthog.capture("page-save-error", { error });
    throw error;
  } finally {
    console.log("save complete");
    pageStore$.editMode.set(true);
    pageStore$.editMode.set(false);
    pageStore$.saving.set(false);
    console.log("finished update");
  }
}

export function handlePageCancel() {
  console.log("canceling edits");
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  clearCanvas();
  pageStore$.editMode.set(false);
}
// export const getCanvas$ = (pageId?: string): Observable<Canvas | undefined> =>
//   computed(() => {
//     if (!pageId) return { ...defaultCanvas };
//     const page = pages$[pageId].get();
//     if (!page) return;
//     const backgroundImage = images$[page.background_image_id].get();
//     // Get items linked to this page
//     const pageItems = Object.values(pageItems$.get() || {}).filter((pageItem) => pageItem.page_id === pageId);

//     // Build CanvasItems with type-specific logic
//     const items = pageItems.map((item) => {
//       const base: CanvasItemBase = {
//         id: item.id,
//         x: item.x,
//         y: item.y,
//         z: item.z,
//         rotation: item.rotation,
//         width: item.width,
//         height: item.height,
//       };

//       // Switch on type to construct specific CanvasItem
//       switch (item.type) {
//         case "image": {
//           const imageItem = imagesItems$[item.id].get();
//           const image = imageItem && images$.get()[imageItem.image_id];
//           return {
//             ...base,
//             type: "image",
//             path: image?.path || "",
//             placeholder: image?.placeholder,
//             // width: image?.width || 0,
//             // height: image?.height || 0,
//           } as CanvasImage;
//         }
//         case "text": {
//           const textItem = textItems$[item.id].get();
//           return {
//             ...base,
//             type: "text",
//             textContent: textItem.text || "",
//             fontSize: textItem.font_size || 16,
//             fontColor: textItem.color || "#000000",
//             fontType: textItem.font || "Arial",
//           } as CanvasText;
//         }

//         default:
//           throw new Error(`Unsupported item type: ${item.type}`);
//       }
//     });

//     // Construct the full Canvas object
//     const canvas: Canvas = {
//       id: page.id,
//       backgroundImage: backgroundImage,
//       items,
//       screenWidth: page.screen_width,
//       screenHeight: page.screen_height,
//       maxZIndex: Math.max(...items.map((item) => item.z), 0),
//     };

//     console.log("canvas", canvas);
//     return canvas;
//   });

export const saveCanvas = (pageId: string): void => {};
