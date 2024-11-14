import { batch, beginBatch, endBatch, observable } from "@legendapp/state";
import { Canvas, CanvasItem, CanvasReaction, ImageType, Reaction } from "../types/shared.types";
import { Dimensions } from "react-native";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import { supabase } from "../lib/supabase";
import authStore$ from "./AuthStore";
import { getPageForUser, pageStore$ } from "./PagesStore";

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
export const filteredPageReactions = (pageId: string) => {
  return Object.values(reactions$.get() || {}).filter((reaction) => {
    return reaction.page_id === pageId;
  });
};
interface ReactStore {
  edits: CanvasItem[];
  showReactions: boolean;
  reactEditMode: boolean;
  //   curCanvas: Canvas | null;
}

const { width, height } = Dimensions.get("window");

// Observable store
export const reactStore$ = observable<ReactStore>({
  edits: [],
  showReactions: true,
  reactEditMode: false,
});
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
  reactions$[id].set({ id: id, reaction: JSON.stringify(newItem), created_by: userId, page_id: pageId });
};
export const updateReactItem = (id: string, newItem: CanvasReaction) => {
  const reaction = reactions$[id].get();
  reactions$[id].set({ ...reaction, reaction: JSON.stringify(newItem) });
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
