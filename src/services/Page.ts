import { batch, beginBatch, endBatch, Observable } from "@legendapp/state";
import { differenceInCalendarDays, startOfToday, subDays, eachDayOfInterval, format } from "date-fns";
import { max } from "lodash";
import { Blurhash } from "react-native-blurhash";
import StorageService from "../api/storage";
import { supabase } from "../lib/supabase";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { groupStore$ } from "../stores/GroupStore";
import { images$, backgroundImages } from "../stores/ImageStore";
import { filterGroupMembers, groupMembers$ } from "../stores/MemberStore";
import { addNotification } from "../stores/NotificationStore";
import { pageStore$, pages$, pageItems$, textItems$, imagesItems$, DateItem } from "../stores/PagesStore";
import { pageReactions$ } from "../stores/ReactStore";
import { uiStore$ } from "../stores/UIStore";
import { NotificationType, Page, PageItem, TextItem, ImageItem, CanvasItem, Image } from "../types/shared.types";
import { resizeImage } from "./Media";
import { posthog } from "./Posthog";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const START_PAGE_NUM = 3; // Number of pages to load initially per user
export const LOAD_MORE_PAGES = 3; // Number of pages to load in each additional batch

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
/**
 * Initialize the group members and pages for a specific group.
 */
export function initializePageStore(user?: string, day?: string) {
  loadGroupMembers(user);
  loadInitialPages(day);
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
 * Toggle edit mode
 */
export function cleanUpPages(newPageId: string, drafts = true) {
  const curUserId = authStore$.session.user.id.get();
  const curGroupId = groupStore$.selectedGroup.get();
  const newPage$ = pages$[newPageId];
  const oldPages = Object.values(pages$.get()).filter(
    (page) =>
      page.created_by === curUserId &&
      page.group_id === curGroupId &&
      page.date === newPage$.date.get() &&
      page.id !== newPageId &&
      //optionally only clean up drafts
      (drafts ? page.draft : true)
  );

  oldPages.map((page) => {
    //move all old pageReactions over to new page
    Object.values(pageReactions$)
      .filter((pageReaction) => pageReaction.page_id.get() === page.id)
      .forEach((pageReaction) => pageReaction.page_id.set(newPageId));
    //delete old page
    deletePage(page.id);
  });
}
export async function handleEdit() {
  /*
      Modifying this to duplicate existing page
    */
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const page = getPageForUser(pages$.get(), user || "", day.date);
  const newPageId = generateId();
  const groupId = groupStore$.selectedGroup.get();
  if (!user || !day || !groupId) {
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to edit, please try again",
    });
    posthog.capture("handled-edit-failed", { message: "missing user or day or groupId" });
    return;
  }
  if (page) {
    cleanUpPages(page?.id);
    //create new from this page
    const draftPage: Page = {
      id: newPageId,
      created_by: page.created_by,
      date: page.date,
      group_id: page.group_id,
      screen_width: page.screen_width,
      screen_height: page.screen_height,
      background_image: page.background_image,
      draft: true,
    } as Page;
    pages$[newPageId].set(draftPage);
    //get old page
    const items = Object.values(pageItems$).filter((item) => item.page_id.get() === page.id);
    batch(() =>
      items.forEach((item$) => {
        const item = item$.get();
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
            break;
          }
          case "image": {
            const imageItem = imagesItems$[item.id];
            const image = images$[imageItem.image_id.get()].get();
            const newImageId = generateId();
            images$[newImageId].set({
              id: newImageId,
              width: image.width,
              height: image.height,
              type: image.type,
              path: image.path,
              placeholder: image.placeholder,
              uploaded: image.uploaded,
              created_by: image.created_by,
            } as Image);
            imagesItems$[newItemId].set({
              id: newItemId,
              image_id: newImageId,
            } as ImageItem);
            break;
          }
        }
      })
    );
  } else {
    //if no group, create a new one
    const newPage: Page = {
      id: newPageId,
      draft: true,
      group_id: groupId,
      created_by: user,
      date: day.date,
      background_image: "bg_04",
      screen_height: height,
      screen_width: width,
      // created_at: now,
      // updated_at: now,
      // deleted: false,
    } as Page;
    pages$[newPageId].set(newPage);
    //create new edit mode
  }
  beginBatch();
  uiStore$.displayCanvasMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  pageStore$.editMode.set(true);
  endBatch();
}

export async function handlePageSave() {
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const draftPageId = getPageForUser(pages$.get(), user || "", day.date, true)?.id;
  if (!draftPageId) {
    posthog.capture("no drafts found to save", { message: "no draftpageid found" });
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to save, please try again",
    });
    return;
  }
  beginBatch();
  pageStore$.saving.set(true);
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  endBatch();
  await saveCanvas(draftPageId);
  beginBatch();
  pageStore$.editMode.set(false);
  pageStore$.saving.set(false);
  endBatch();
}

export function handlePageCancel() {
  //delete all entries for temp page
  if (!pageStore$.editMode.get()) {
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to cancel, please try again",
    });
    posthog.capture("cancel-edit-error", { error: "not in edit mode" });
    return;
  }
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const draftPageId = getPageForUser(pages$.get(), user || "", day.date, pageStore$.editMode.get())?.id;
  if (!draftPageId) {
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to cancel, please try again",
    });
    posthog.capture("cancel-edit-error", { error: "no draft page id" });
    return;
  }
  deletePage(draftPageId);
  beginBatch();
  uiStore$.displayJournalMenu.set(true);
  uiStore$.displayCanvasMenu.set(false);
  pageStore$.editMode.set(false);
  endBatch();
}

export const uploadImage = async (
  pageId: string,
  imageItemId: string,
  selectedImageUri: string,
  width: number,
  height: number
): Promise<void> => {
  const userId = authStore$.session.user.id.get();
  if (!userId) {
    posthog.capture("upload-page-image-error", { error: "Not logged in" });

    throw new Error("error no user");
  }
  const imageId = imagesItems$[imageItemId].image_id.get();
  if (!imageId) {
    posthog.capture("upload-page-image-error", { error: "No image found" });
    throw new Error("error no image found");
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

  const image = await resizeImage(selectedImageUri, width, height)
    .then((image) => image)
    .catch((error) => {
      posthog.capture("upload-page-image-error", { error });
      throw new Error("error optimizing image");
    });

  if (!image || !blurhash) {
    // setLoading(false);
    throw new Error("error getting blurhash");
  }
  const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" });
  //check if we already have a photo with this blurhash
  let photoPath = Object.values(images$[imageId]).find(
    (item) => item.blurhash === blurhash && item.created_by === userId
  )?.path;
  if (!photoPath) {
    const { success, data, error } = await StorageService.uploadFile({
      bucket: "page_photos",
      filePath: `${userId}/${imageId}.webp`,
      base64: base64,
      fileExtension: "webp",
      mimeType: "image/webp",
    });
    if (error || !data) {
      posthog.capture("upload-page-image-error", { error });
      //show notif here
      throw new Error("Error uploading image");
    }
    //eventaully want to ensure that it isn't uploading duplicates, only one copy of a photo at a time
    photoPath = supabase.storage.from("page_photos").getPublicUrl(`${userId}/${imageId}.webp`).data.publicUrl;
  }
  images$[imageId].assign({
    path: photoPath,
    placeholder: blurhash,
    width: width,
    height: height,
    type: "web",
    uploaded: true,
    created_by: userId,
  } as Image);
};
const uploadImages = async (): Promise<{ success: boolean; error?: string }> => {
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const draftPageId = getPageForUser(pages$.get(), user || "", day.date, pageStore$.editMode.get())?.id;
  const pageItems = Object.values(pageItems$).filter((item) => item.page_id.get() === draftPageId);
  const imageItems = Object.values(imagesItems$).filter((item) =>
    pageItems.some((pageItem) => pageItem.id.get() === item.id.get())
  );
  const curUserId = authStore$.session.user.id.get();
  if (!imageItems || !draftPageId || !curUserId) {
    return { success: false, error: "No items to upload, or no page, or not logged in" };
  }
  // let newItems: CanvasItem[] = [];
  const promiseAr = imageItems.map((item$) => {
    const item = item$.get();
    const image$ = images$[item.image_id];
    if (!image$.uploaded.get()) {
      //we need to upload image
      return uploadImage(
        draftPageId,
        item.id,
        image$.path.get(),
        pageItems$[item.id].width.get() * 1.5,
        pageItems$[item.id].height.get() * 1.5
      );
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

export const saveCanvas = async (newPageId: string): Promise<void> => {
  /*
      modify this to set new page to no longer be draft
      set old page to be DELETED
      set all old items to be DELETED 
  
    */
  const curUserId = authStore$.session.user.id.get();
  const curGroupId = groupStore$.selectedGroup.get();
  if (!curUserId || !curGroupId) {
    posthog.capture("page-save-error", { error: "no user or selected group" });
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to save, please try again",
    });
    return;
  }
  //parallel save all images to storage on backend
  //upload images, get id for them
  const { error } = await uploadImages();
  if (error) {
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Failed to save, please try again",
    });
    posthog.capture("page-save-error", { error });
    return;
  }
  //save page
  const newPage$ = pages$[newPageId];
  if (newPage$.get()) {
    newPage$.draft.set(false);
  }
  //remove all pages besides the new entry
  cleanUpPages(newPageId, false);
};

export const deletePage = (pageId: string): void => {
  posthog.capture("delete-page", { message: "delete page " + pageId });
  const oldPage$ = pages$[pageId];
  oldPage$.delete();
};

export const addPageItem = (item: CanvasItem) => {
  posthog.capture("add-page-item", { message: "add item " + item.id });
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const draftPageId = getPageForUser(pages$.get(), user || "", day.date, pageStore$.editMode.get())?.id;
  beginBatch();
  const pageItem = {
    id: item.id,
    x: item.x,
    y: item.y,
    z: item.z,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
    page_id: draftPageId,
    type: item.type,
  } as PageItem;
  pageItems$[item.id].set(pageItem);
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
  bringToFront(item.id);
  endBatch();
};
export const updatePageItem = (item: CanvasItem) => {
  beginBatch();
  const pageItem = {} as PageItem;
  if (item.x !== undefined) {
    pageItem.x = item.x;
  }
  if (item.y !== undefined) {
    pageItem.y = item.y;
  }
  if (item.z !== undefined) {
    pageItem.z = item.z;
  }
  if (item.width !== undefined) {
    pageItem.width = item.width;
  }
  if (item.height !== undefined) {
    pageItem.height = item.height;
  }
  if (item.rotation !== undefined) {
    pageItem.rotation = item.rotation;
  }
  pageItems$[item.id].assign(pageItem);
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
      //nothing to update for now
      break;
    }
  }
  endBatch();
};
export const removePageItem = (itemId: string) => {
  pageItems$[itemId].delete();
};
const getMaxZ = (pageId: string) => {
  const zValues = Object.values(pageItems$)
    .filter((item: Observable<PageItem>) => item.page_id.get() === pageId)
    .map((item) => item.z.get());
  return max(zValues) || 0;
};
export const bringToFront = (itemId: string) => {
  const curItem$ = pageItems$[itemId];
  const curMax = getMaxZ(curItem$.page_id.get());
  const curZ = curItem$.z.get();
  // if (curZ === 0 || curMax > curZ) {
  //only update if current z isn't already max
  curItem$.z.set(curMax + 1);
  // }
};

export const changeBackground = () => {
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const user = authStore$.session.user.id.get();
  const draftPage = getPageForUser(pages$.get(), user || "", day.date, pageStore$.editMode.get());
  if (!draftPage) {
    posthog.capture("change-background-failed", { message: "couldn't find draftPage to update background" });
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Error changing background, please try again later",
    });
    return;
  }

  const index = backgroundImages.findIndex((background: string) => background === draftPage.background_image);
  const nextBackground = backgroundImages[(index + 1) % backgroundImages.length];
  pages$[draftPage.id].background_image.set(nextBackground);
};
