import { batch, beginBatch, endBatch, observable, Observable, when } from "@legendapp/state";
import { differenceInCalendarDays, startOfToday, subDays, eachDayOfInterval, format, addDays } from "date-fns";
import { max } from "lodash";
import { Blurhash } from "react-native-blurhash";
import StorageService from "../api/storage";
import { supabase } from "../lib/supabase";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { groupStore$ } from "../stores/GroupStore";
import { addNotification } from "../stores/NotificationStore";
import { pageStore$, pages$, DateItem, canvasStore$ } from "../stores/PagesStore";
import { uiStore$ } from "../stores/UIStore";
import { NotificationType, Page, CanvasItem, Image, Json, Canvas, ImageType, CanvasImage } from "../types/shared.types";
import { resizeImage } from "./Media";
import { posthog } from "./Posthog";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";
import { filterGroupMembers } from "./Group";
import { groupMembers$ } from "../stores/MemberStore";
import { resyncObservables } from "./AppStore";
import { useEffect } from "react";

export const backgroundImages = ["bg_01", "bg_02", "bg_03", "bg_04", "bg_05", "bg_09"];
export const START_PAGE_NUM = 30; // Number of pages to load initially per user
// export const START_PAGE_NUM = 3; // Number of pages to load initially per user
export const LOAD_MORE_PAGES = 5; // Number of pages to load in each additional batch
// export const LOAD_MORE_PAGES = 2; // Number of pages to load in each additional batch
const { width, height } = Dimensions.get("window");

export const getPageForUser = (pages: Record<string, Page>, curUser: string, date: string): Page | undefined => {
  const groupId = groupStore$.selectedGroup.get();
  const out = Object.values(pages || {}).find((page: Page) => {
    return page.created_by === curUser && page.date === date && page.group_id === groupId;
  });
  return out;
};
/**
 * Initialize the group members and pages for a specific group.
 */
export async function initializePageStore(user?: string, day?: string) {
  // await resyncObservables();
  await when(pages$);
  loadGroupMembers(user);
  await loadInitialPages(day);
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
    const userIndex = userIds.indexOf(user);
    pageStore$.curRow.set(userIndex || 0);
  }
  pageStore$.members.set(users);
}

/**
 * Load initial members and dates, setting up a specified number of unique dates.
 */
async function loadInitialPages(date?: string) {
  if (date) {
    const dateNum = differenceInCalendarDays(new Date(), new Date(date));
    const allDates = getAllUniqueDates(Math.max(dateNum, START_PAGE_NUM)); // Get unique dates for initial range
    const index = allDates.findIndex((dateObject) => dateObject.date === date);
    pageStore$.dates.set(allDates); // Set initial dates range
    if (allDates.length > 0) {
      pageStore$.startDate.set(allDates[allDates.length - 1].date);
      pageStore$.endDate.set(allDates[0].date);
    }
    pageStore$.curCol.set(index || 0);
  } else {
    const allDates = getAllUniqueDates(START_PAGE_NUM); // Get unique dates for initial range
    pageStore$.dates.set(allDates); // Set initial dates range
  }
}

/**
 * Load additional dates, extending the date range backward in time.
 */
export async function loadMorePages() {
  console.log("Loading more pages...");
  const dates = pageStore$.dates.peek();
  const startDate = dates[dates.length - 1].date;
  const newDates = getAllUniqueDates(LOAD_MORE_PAGES, startDate);
  pageStore$.dates.set([...dates, ...newDates]);
}

export async function useInitializePageRealtimeUpdates() {
  useEffect(() => {
    const subscription = supabase
      .channel("realtime-pages")
      .on("postgres_changes", { event: "*", schema: "public", table: "pages" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedPageId = payload.old.id;
          pages$[deletedPageId].delete();
        } else {
          if (payload.new.group_id !== groupStore$.selectedGroup.get()) return;
          // const cur = pages$.peek()?.[payload.new.id];
          // let lastSync = undefined;
          // const curDateStr = cur && (cur.updated_at || cur.created_at);
          // const valueDateStr = payload.new.updated_at || payload.new.created_at;
          // lastSync = +new Date(valueDateStr);
          // let isOk = valueDateStr && (!curDateStr || lastSync > +new Date(curDateStr));
          // console.log("is ok to update? :", isOk, lastSync, curDateStr, valueDateStr);

          //test right now to see if we have new values to canvas
          const isOk = JSON.stringify(pages$.peek()[payload.new.id]?.canvas) !== JSON.stringify(payload.new.canvas);
          if (isOk) {
            const newPage: Page = payload.new as Page;
            // console.log("updating pages!", pages$[newPage.id].canvas.get() as Canvas);
            console.log("updating pages!", pages$[newPage.id].updated_at.get());
            pages$[newPage.id].set(newPage);
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
}

/**
 * Get unique dates from today, descending backward by `daysCount`.
 */
function getAllUniqueDates(count: number, startDate?: string): DateItem[] {
  const start = startDate ? new Date(startDate) : startOfToday();
  const end = subDays(start, count - 1); // Calculate the end date
  const dates = eachDayOfInterval({ start, end });
  return dates.map((date) => ({
    id: generateId(),
    date: format(date, "yyyy-MM-dd"),
  }));
}

export const uploadImage = async (
  index: number,
  selectedImageUri: string,
  width: number,
  height: number
): Promise<void> => {
  const userId = authStore$.session.user.id.get();
  if (!userId) {
    posthog.capture("upload-page-image-error", { error: "Not logged in" });
    throw new Error("error no user");
  }
  // Resize the image to 100x100 using ImageManipulator
  const blurhash = await ImageManipulator.manipulateAsync(selectedImageUri, [{ resize: { width: 100, height: 100 } }], {
    compress: 0.5,
    format: ImageManipulator.SaveFormat.PNG,
  })
    .then((resizedImage) => Blurhash.encode(resizedImage.uri, 4, 3))
    .catch((error) => {
      posthog.capture("upload-page-image-error", { error });
      throw new Error("error generating blurhash ");
    });
  const image = await resizeImage(selectedImageUri, width, height).catch((error) => {
    posthog.capture("upload-page-image-error", { error });
    throw new Error("error optimizing image");
  });
  if (!image || !blurhash) {
    // setLoading(false);
    throw new Error("error getting blurhash");
  }
  const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" });
  //check if we already have a photo with this blurhash
  let item = canvasStore$.canvas.items[index].get();
  if (!item) {
    console.log("error can't upload, no item found");
    addNotification({ id: generateId(), type: NotificationType.error, message: "Failed uploading image" });
    return;
  }
  const { success, data, error } = await StorageService.uploadFile({
    bucket: "page_photos",
    filePath: `${userId}/${item.id}.webp`,
    base64: base64,
    fileExtension: "webp",
    mimeType: "image/webp",
  });
  if (error || !data) {
    posthog.capture("upload-page-image-error", { error });
    //show notif here
    console.log("error", error);
    throw new Error("Error uploading image");
  }
  //eventaully want to ensure that it isn't uploading duplicates, only one copy of a photo at a time
  const photoPath = supabase.storage.from("page_photos").getPublicUrl(`${userId}/${item.id}.webp`).data.publicUrl;
  canvasStore$.canvas.items[index].set({ ...item, path: photoPath, placeholder: blurhash });
};
const uploadImages = async (): Promise<{ success: boolean; error?: string }> => {
  const items$ = canvasStore$.canvas.items;
  if (!items$.get()?.length) {
    return { success: true };
  }
  // let newItems: CanvasItem[] = [];
  const promiseAr = items$.map((item$, index) => {
    const item = item$.get();
    if (item$.type.get() === "image") {
      //we need to upload image
      const item: CanvasImage = item$.get() as CanvasImage;
      if (item.path.includes("file://")) {
        console.log("uploading image");
        return uploadImage(index, item.path, item.width * 1.5, item.height * 1.5);
      } else {
        Promise.resolve(null);
      }
    } else {
      Promise.resolve(null);
    }
  });
  // // Wait for all promises to complete
  try {
    await Promise.all(promiseAr || []);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const changeBackground = () => {
  const index = backgroundImages.findIndex(
    (background: string) => background === canvasStore$.canvas.backgroundImage.get()?.path
  );
  const nextBackground = { path: backgroundImages[(index + 1) % backgroundImages.length], type: ImageType.Local };
  canvasStore$.canvas.backgroundImage.set(nextBackground);
};

export const resetCanvas = () => {
  const defaultCanvas = {
    id: "",
    backgroundImage: { path: "bg_04", type: ImageType.Local },
    items: [],
    maxZIndex: 0,
    screenWidth: width,
    screenHeight: height,
  } as Canvas;
  canvasStore$.canvas.set({ ...defaultCanvas });
};
export const handleEdit = () => {
  /*
    set edit mode to true
    update canvas store to hold the data from the db
  */
  const curUser = pageStore$.members[pageStore$.curRow.get()].user_id.get();
  const curDate = pageStore$.dates[pageStore$.curCol.get()].date.get();
  const page = getPageForUser(pages$.get(), curUser, curDate);
  const canvas = page?.canvas;
  console.log("canvas for edit", page?.canvas);
  if (!canvas) {
    console.log("reseting canvas");
    resetCanvas();
  } else {
    // resetCanvas();
    const canvasCopy = JSON.parse(JSON.stringify(canvas)) as Canvas;
    canvasStore$.canvas.set(canvasCopy);
    // console.log("set canvas", canvasStore$.canvas.get());
  }
  uiStore$.displayCanvasMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  pageStore$.editMode.set(true);
  pageStore$.curPageId.set(page?.id || null);
};
export const handleSave = async () => {
  /*
    save the current editing canvas to the pages 
  */
  //save here
  //@ts-ignore
  pageStore$.saving.set(true);
  let pageId = pageStore$.curPageId.get();
  const { error } = await uploadImages();
  if (error) {
    console.log("error", error);
    posthog.capture("page-save-error", { error });
    pageStore$.saving.set(false);
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to save, please try again",
    });
    return;
  }
  console.log("saving for page: ", pageId);
  if (!pageId) {
    console.log("creating new page");
    pageId = generateId();
    canvasStore$.canvas.id.set(pageId);
    const page = {
      id: pageId,
      created_by: authStore$.session.user.id.get(),
      group_id: groupStore$.selectedGroup.get(),
      date: pageStore$.dates[pageStore$.curCol.get()].get().date,
      canvas: canvasStore$.canvas.get(),
    } as Page;
    //save new canvas
    pages$[pageId].set(page);
  } else {
    console.log("updating existing page");
    pages$[pageId].canvas.set(canvasStore$.canvas.get());
  }
  handleClose();
};
const handleClose = () => {
  batch(() => {
    resetCanvas();
    pageStore$.editMode.set(false);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayJournalMenu.set(true);
    pageStore$.curPageId.set(null);
    pageStore$.saving.set(false);
  });
};
export const handleCancel = () => {
  handleClose();
};
export const addCanvasItem = (item: CanvasItem) => {
  const curMax = canvasStore$.canvas.maxZIndex.get();
  const newMax = (curMax || 0) + 1;
  batch(() => {
    canvasStore$.canvas.items.push({ ...item, z: newMax });
    canvasStore$.canvas.maxZIndex.set(newMax);
  });
};
export const updateCanvasItem = (item: CanvasItem) => {
  const index = getCanvasItemIndex(item.id);
  const oldItem = canvasStore$.canvas.items[index].get();
  canvasStore$.canvas.items[index].set({ ...oldItem, ...item });
};
export const removeCanvasItem = (id: string) => {
  const index = getCanvasItemIndex(id);
  canvasStore$.canvas.items.splice(index, 1);
};
export const getCanvasItemIndex = (id: string) => {
  return canvasStore$.canvas.items.findIndex((val) => val.id.get() === id);
};
export const bringToFront = (id: string) => {
  const index = getCanvasItemIndex(id);
  const curMax = canvasStore$.canvas.maxZIndex.get();
  const item = canvasStore$.canvas.items[index].get();
  if (curMax && item && item.z < curMax) {
    canvasStore$.canvas.items[index].set({ ...item, z: curMax + 1 });
    canvasStore$.canvas.maxZIndex.set(curMax + 1);
  }
};
