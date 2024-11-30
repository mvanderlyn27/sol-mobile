import {
  Observable,
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
  Image,
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
import { canvasStore$, clearCanvas } from "./CanvasStore";
import { jsonToCanvas } from "../services/Canvas";

import { posthog } from "../services/Posthog";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import * as FileSystem from "expo-file-system";
import StorageService from "@/src/api/storage";
import { Blurhash } from "react-native-blurhash";
import { resizeImage } from "@/src/services/Media";
import { reactStore$ } from "./ReactStore";
import { backgroundImages$, images$ } from "./ImageStore";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
const { width, height } = Dimensions.get("window");
export const pages$ = observable<Record<string, Page>>(
  customSupabaseSynced({
    supabase,
    collection: "pages_test",
    select: (from: any) => from.select("*"),
    realtime: true,
    actions: ["read", "create", "update", "delete"],
    // persist: {
    //   name: "pages_test",
    //   retrySync: true, // Persist pending changes and retry
    // },
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
    // persist: {
    //   name: "page_items",
    //   retrySync: true, // Persist pending changes and retry
    // },
    // retry: {
    //   infinite: true, // Retry changes with exponential backoff
    // },
    waitForSet: ({ value }: WaitForSetCrudFnParams<PageItem>) => pages$[value.page_id].created_at,
  })
);

export const imagesItems$ = observable<Record<string, ImageItem>>(
  customSupabaseSynced({
    supabase,
    collection: "image_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    // persist: {
    //   name: "image_items",
    //   retrySync: true, // Persist pending changes and retry
    // },
    // retry: {
    //   infinite: true, // Retry changes with exponential backoff
    // },
    waitForSet: ({ value }: WaitForSetCrudFnParams<ImageItem>) =>
      pageItems$[value.id].created_at && images$[value.image_id].created_at,
  })
);
export const textItems$ = observable<Record<string, TextItem>>(
  customSupabaseSynced({
    supabase,
    collection: "text_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    // persist: {
    //   name: "text_items",
    //   retrySync: true, // Persist pending changes and retry
    // },
    // retry: {
    //   infinite: true, // Retry changes with exponential backoff
    // },
    waitForSet: ({ value }: WaitForSetCrudFnParams<TextItem>) => pageItems$[value.id].created_at,
  })
);

export const getPageForUser = (
  pages: Record<string, Page>,
  curUser: string,
  date: string,
  editMode?: boolean
): Page | undefined => {
  const groupId = groupStore$.selectedGroup.get();
  const out = Object.values(pages || {}).find((page: Page) => {
    return (
      page.created_by === curUser &&
      page.date === date &&
      page.group_id === groupId &&
      (editMode ? page.draft : !page.draft)
    );
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
  /*
    Modifying this to duplicate existing page
  */
  beginBatch();
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const page = getPageForUser(pages$.get(), user || "", day.date);
  const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const newPageId = generateId();
  const groupId = groupStore$.selectedGroup.get();
  if (!user || !day || !groupId) {
    console.log("No user, day, or group found");
    return;
  }
  if (page) {
    console.log("page exists, duplicating");
    console.log("pages before", pages$.get());
    //create new from this page

    const draftPage: Page = {
      id: newPageId,
      created_by: page.created_by,
      date: page.date,
      group_id: page.group_id,
      screen_width: page.screen_width,
      screen_height: page.screen_height,
      background_image_id: page.background_image_id,
      draft: true,
    } as Page;
    console.log("draftPage", draftPage);
    // const { error } = await supabase.from("pages_test").insert(draftPage);
    // console.log("error", error);
    pages$[newPageId].set(draftPage);
    const status$ = syncState(pages$[newPageId]);
    console.log("status ", status$.get());
    const items = Object.values(pageItems$.get()).filter((item) => item.page_id === page.id);
    console.log("items", items);
    items.forEach((item) => {
      const newItemId = generateId();
      pageItems$[newItemId].set({
        id: newItemId,
        page_id: newPageId,
        type: item.type,
        x: item.x,
        y: item.y,
        z: item.z,
        width: item.width,
        height: item.height,
        rotation: item.rotation,
      } as PageItem);
      switch (item.type) {
        case "text": {
          const textItem = textItems$[item.id].get();
          textItems$[newItemId].set({
            id: newItemId,
            color: textItem.color,
            font_size: textItem.font_size,
            font: textItem.font,
            text: textItem.text,
          } as TextItem);
        }
        case "image": {
          const imageItem = imagesItems$[item.id].get();
          imagesItems$[newItemId].set({
            id: newItemId,
            image_id: imageItem.image_id,
          } as ImageItem);
        }
      }
    });
  } else {
    console.log("inserting new page");
    //if no group, create a new one
    pages$[newPageId].set({
      id: newPageId,
      created_at: now,
      updated_at: now,
      deleted: false,
      draft: true,
      group_id: groupId,
      created_by: user,
      date: day.date,
      background_image_id: backgroundImages$.length > 0 ? backgroundImages$[0].id.get() : "",
      screen_height: height,
      screen_width: width,
    });
    //create new edit mode
  }
  console.log("pages after", pages$.get());
  uiStore$.displayCanvasMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  pageStore$.editMode.set(true);
  endBatch();
}

export async function handlePageSave() {
  pageStore$.saving.set(true);
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const curPageId = getPageForUser(pages$.get(), user || "", day.date, false)?.id;
  const oldPageId = getPageForUser(pages$.get(), user || "", day.date, true)?.id;
  const newPageId = curPageId || generateId();
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  await saveCanvas(newPageId, oldPageId || "");
  pageStore$.editMode.set(false);
  pageStore$.saving.set(false);
  console.log("finished update");
}

export function handlePageCancel() {
  console.log("canceling edits");
  //delete all entries for temp page
  if (!pageStore$.editMode.get()) {
    console.log("not in edit mode, can't cancel");
    return;
  }
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const draftPageId = getPageForUser(pages$.get(), user || "", day.date, pageStore$.editMode.get())?.id;
  if (!draftPageId) {
    console.log("no page found");
    return;
  }
  deletePage(draftPageId);
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  pageStore$.editMode.set(false);
}

export const uploadImage = async (
  pageId: string,
  imageItemId: string,
  selectedImageUri: string,
  width: number,
  height: number
): Promise<{ imageItemId: string; imageId: string } | undefined> => {
  const userId = authStore$.session.user.id.get();
  if (!userId) {
    console.log("not logged in");
    posthog.capture("upload-page-image-error", { error: "Not logged in" });
    return;
  }
  const imageId = generateId();
  // Resize the image to 100x100 using ImageManipulator
  const blurhash = await ImageManipulator.manipulateAsync(selectedImageUri, [{ resize: { width: 100, height: 100 } }], {
    compress: 0.5,
    format: ImageManipulator.SaveFormat.PNG,
  })
    .then((resizedImage) => Blurhash.encode(resizedImage.uri, 4, 3))
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
    filePath: `${pageId}/${imageItemId}.webp`,
    base64: base64,
    fileExtension: "webp",
    mimeType: "image/webp",
  });
  console.log("done uploading", error, data, success);
  if (error || !data) {
    console.error("error uploading", error);
    posthog.capture("upload-page-image-error", { error });
    //show notif here
    return;
  }
  const path = supabase.storage.from("page_photos").getPublicUrl(`${pageId}/${imageId}.webp`);
  console.log("starting last update");
  const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  images$[imageId].set({
    id: imageId,
    path: path.data.publicUrl,
    placeholder: blurhash,
    width: width,
    height: height,
    type: "web",
    updated_at: now,
    created_at: now,
    deleted: false,
    uploaded: true,
    created_by: userId,
    hash: null,
  });
  return { imageItemId: imageItemId, imageId: imageId };
};
const uploadImages = async (): Promise<Map<string, string>> => {
  /*
  Sudo code:
  go through items in canvasStore 
  if image, see if we have an images$ entry for it
  //we can just look up if the image_items has an entry with the id of the page_items since they are the same
  if there is an entry see if its uploaded
  if not upload
  if there is no entry upload
  record all id's of new image entries for map to return 


  modify upload to create an image entry?
  */

  const items = canvasStore$.items.get();
  const pageId = canvasStore$.pageId.get();
  const curUserId = authStore$.session.user.id.get();
  if (!items || !pageId || !curUserId) {
    console.log("no items to upload, or no page, or not logged in");
    return new Map();
  }
  // let newItems: CanvasItem[] = [];
  const promiseAr = items.map((item) => {
    if (item.type === "image") {
      const imageItem = imagesItems$[item.id].get();
      const image = imageItem && images$[imageItem.image_id].get();
      // if (!image || !image.uploaded) {
      //don't worry about upload failing, or doing stuff offline and needing to upload later
      if (!image) {
        //we need to upload image
        return uploadImage(pageId, item.id, item.path, item.width * 1.5, item.height * 1.5);
      } else {
        Promise.resolve(null);
      }
    }
  });
  // // Wait for all promises to complete
  // //MODIFY THE RESULT TO JUST BE ID's, Do the IMAGE creation in the above part, and only for the images that aren't uploaded yet
  const results = await Promise.all(promiseAr || []);
  const imageIdMap = new Map<string, string>();
  // const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  // // Process the results after all uploads
  results.forEach((result, index) => {
    if (result) {
      console.log(`Processed result for item  ${result.imageItemId}:`, result);
      imageIdMap.set(result.imageItemId, result.imageId);
    }
  });

  return imageIdMap;
};

export const saveCanvas = async (newPageId: string, oldPageId: string): Promise<void> => {
  /*
    modify this to set new page to no longer be draft
    set old page to be DELETED
    set all old items to be DELETED 

  */
  const curUserId = authStore$.session.user.id.get();
  const curGroupId = groupStore$.selectedGroup.get();
  if (!curUserId || !curGroupId) {
    console.log("no user or group");
    posthog.capture("page-save-error", { error: "no user or selected group" });
    return;
  }
  console.log("saving canvas");
  //parallel save all images to storage on backend
  //upload images, get id for them
  const imageItemMap = await uploadImages();
  //update new items to point to the new images that are uploaded
  //update new page to not be draft
  //delete all old items

  //save page
  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSSSS");
  const newPage$ = pages$[newPageId];
  const oldPage$ = pages$[oldPageId];
  if (newPage$.get()) {
    console.log("new page");
    // existing page
    //remove draft
    pages$[newPageId].draft.set(false);
    //update image ids
    Object.entries(imageItemMap).forEach(([itemId, imageId]) => {
      imagesItems$[itemId].image_id.set(imageId);
    });
  }
  if (oldPage$.get()) {
    //if old page then we delete it
    deletePage(oldPageId);
  }
};

export const deletePage = async (pageId: string): Promise<void> => {
  const oldPage$ = pages$[pageId];
  oldPage$.delete();
  const items = Object.values(pageItems$.get()).filter((item) => item.page_id === pageId);
  items.forEach((item) => {
    switch (item.type) {
      case "text": {
        textItems$[item.id].delete();
      }
      case "image": {
        imagesItems$[item.id].delete();
      }
    }
    pageItems$[item.id].delete();
  });
};

export const addPageItem = (pageId: string, item: CanvasItem) => {
  pageItems$[item.id].set({
    id: item.id,
    x: item.x,
    y: item.y,
    z: item.z,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
  } as PageItem);
  switch (item.type) {
    case "text": {
      textItems$[item.id].set({
        id: item.id,
        color: item.fontColor,
        font_size: item.fontSize,
        font: item.fontType,
        text: item.textContent,
      } as TextItem);
      break;
    }
    case "image": {
      // imagesItems$[item.id].assign({ });
      //nothing to update for now
      const imageId = generateId();
      images$[imageId].set({
        id: imageId,
        width: item.width,
        height: item.height,
        type: "local",
        path: item.path,
        placeholder: item.placeholder,
        uploaded: false,
        created_by: authStore$.session.user.id.get(),
      } as Image);
      imagesItems$[item.id].set({
        id: item.id,
        image_id: imageId,
      } as ImageItem);
      break;
    }
  }
};
export const updatePageItem = (item: CanvasItem) => {
  pageItems$[item.id].assign({
    x: item.x,
    y: item.y,
    z: item.z,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
  });
  switch (item.type) {
    case "text": {
      textItems$[item.id].assign({
        color: item.fontColor,
        font_size: item.fontSize,
        font: item.fontType,
        text: item.textContent,
      });
      break;
    }
    case "image": {
      // imagesItems$[item.id].assign({ });
      //nothing to update for now
      break;
    }
  }
};
export const removePageItem = (itemId: string) => {
  pageItems$[itemId].delete();
};
