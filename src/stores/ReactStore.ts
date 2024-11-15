import { batch, beginBatch, endBatch, observable } from "@legendapp/state";
import { Canvas, CanvasItem, CanvasReaction, ImageType, Reaction } from "../types/shared.types";
import { Dimensions } from "react-native";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import { supabase } from "../lib/supabase";
import authStore$ from "./AuthStore";
import { getPageForUser, pageStore$ } from "./PagesStore";
import { Json } from "../types/supabase.types";
import { jsonToReact, reactToJson } from "../services/Reaction";
import { uiStore$ } from "./UIStore";

//@ts-ignore
export const reactions$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "reactions",
    select: (from: any) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    // persist: { name: "pages", retrySync: true },
    // retry: {
    //   infinite: true,
    // },
  })
);
export const filterNonUserReactions = (pageId: string): Reaction[] => {
  const curUserId = authStore$.session.user.id.get();
  return Object.values(reactions$.get() || {}).filter((reaction) => {
    return reaction.page_id === pageId && reaction.created_by !== curUserId;
  });
};
export const filterUserReactions = (pageId: string): Reaction[] => {
  const curUserId = authStore$.session.user.id.get();
  return Object.values(reactions$.get() || {}).filter((reaction) => {
    return reaction.page_id === pageId && reaction.created_by === curUserId;
  });
};
interface ReactStore {
  showReactions: boolean;
  reactEditMode: boolean;
  //   curCanvas: Canvas | null;
}

const { width, height } = Dimensions.get("window");

// Observable store
export const reactStore$ = observable<ReactStore>({
  showReactions: true,
  reactEditMode: false,
});
interface editReactStore$ {
  showNonUserReactions: boolean;
  userReactions: CanvasReaction[];
  edits: CanvasItem[];
}
export const editReactStore$ = observable<editReactStore$>({
  showNonUserReactions: true,
  userReactions: [],
  edits: [],
});
export const initializeEditReactStore = () => {
  const pageId = getPageForUser(
    pageStore$.members[pageStore$.curRow.get()].get().user_id,
    pageStore$.dates[pageStore$.curCol.get()].get().date
  )?.id;
  const reactions: CanvasReaction[] = filterUserReactions(pageId || "")
    .map((reaction) => jsonToReact(reaction.reaction))
    .filter((item): item is CanvasReaction => item !== null);
  editReactStore$.userReactions.set(reactions);
};
export const removeReactItem = (id: string) => {
  if (Object.keys(reactions$.get() || {}).includes(id)) {
    reactions$[id].delete();
  }
};
export const addReactItem = (newItem: CanvasReaction) => {
  const id = generateId();
  const userId = authStore$.session.user.id.get();
  const pageId = getPageForUser(
    pageStore$.members[pageStore$.curRow.get()].get().user_id,
    pageStore$.dates[pageStore$.curCol.get()].get().date
  )?.id;
  if (!pageId) {
    console.log("no page selected");
    return null;
  }
  console.log("creating reaction");
  //@ts-ignore
  //   reactions$[id].set({ id: id, reaction: JSON.stringify(newItem), created_by: userId, page_id: pageId });
  const curItems = editReactStore$.items.get();
  editReactStore$.userReactions.set([...curItems, newItem]);
};
export const updateReactItem = (id: string, newItem: CanvasReaction) => {
  const curItems = editReactStore$.userReactions.get();
  const index = curItems.findIndex((val) => val.id === id);
  if (index === -1) {
    console.log("Can't find id");
    return null;
  }
  // Correct way to update the item at the found index
  editReactStore$.userReactions[index].set(newItem);
};

export const saveReacts = () => {
  const curItems = editReactStore$.userReactions.get();
  const userId = authStore$.session.user.id.get();
  const pageId = getPageForUser(
    pageStore$.members[pageStore$.curRow.get()].get().user_id,
    pageStore$.dates[pageStore$.curCol.get()].get().date
  )?.id;
  if (!userId || !pageId) {
    console.log("can't get user or page for reacts");
    return null;
  }
  curItems.forEach((item) => {
    //@ts-ignore
    reactions$[item.id].set({
      id: item.id,
      page_id: pageId,
      created_by: userId,
      reaction: reactToJson(item),
    });
  });
  editReactStore$.showNonUserReactions.set(true);
  reactStore$.reactEditMode.set(false);
  uiStore$.displayReactMenu.set(false);
  uiStore$.displayJournalMenu.set(true);
};
export const cancelReacts = () => {
  editReactStore$.showNonUserReactions.set(true);
  editReactStore$.userReactions.set([]);
  reactStore$.reactEditMode.set(false);
  uiStore$.displayReactMenu.set(false);
  uiStore$.displayJournalMenu.set(true);
};
// // Add a new item to the canvas
// export const addCanvasItem = (item: CanvasItem) => {
//   beginBatch();
//   const items = canvasStore$.curCanvas.items.get() || [];
//   canvasStore$.curCanvas.items.set([...items, item]);
//   const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
//   canvasStore$.curCanvas.maxZIndex.set(newZ);
//   endBatch();
// };

// // Update an existing item on the canvas
// export const updateCanvasItem = (id: string, item: CanvasItem) => {
//   console.log("updating item", item.id);
//   const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
//   canvasStore$.curCanvas.items.set((items) =>
//     items?.map((canvasItem) => (canvasItem.id === id ? { ...canvasItem, ...item, z: newZ } : canvasItem))
//   );
//   canvasStore$.curCanvas.maxZIndex.set(newZ);
// };

// // Clear the canvas to its default state
// export const clearCanvas = () => {
//   canvasStore$.curCanvas.set(defaultCanvas);
// };

// // Remove an item from the canvas by its ID
// export const removeCanvasItem = (id: string) => {
//   canvasStore$.curCanvas.items.set((items) => items?.filter((canvasItem) => canvasItem.id !== id));
// };
