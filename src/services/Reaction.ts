import { batch, beginBatch, endBatch, Observable } from "@legendapp/state";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { addNotification } from "../stores/NotificationStore";
import { pageStore$, pages$ } from "../stores/PagesStore";
import { reactions$, reactStore$ } from "../stores/ReactStore";
import { uiStore$ } from "../stores/UIStore";
import { CanvasReaction, CanvasReactionItem, Json, NotificationType, Reaction } from "../types/shared.types";
import { max } from "lodash";
import { getPageForUser } from "./Page";
export const initializeReactListners = () => {};
export const handleEditReaction = () => {
  //create draft object, duplicate any needed values
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const userId = pageStore$.members[pageStore$.curRow.get()]?.user_id.get();
  const curUserId = authStore$.session.user.id.get();
  const pageId = getPageForUser(pages$.get(), userId, day.date)?.id;
  if (!pageId) {
    console.log("error finding page for edit");
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Error editing page, please try again",
    });
    return;
  }
  const reactionId = Object.values(reactions$.get()).find(
    (r) => r.page_id === pageId && r.created_by === curUserId
  )?.id;
  if (reactionId) {
    reactStore$.reaction.set(reactions$[reactionId].get().reaction as CanvasReaction);
    reactStore$.curReactionId.set(reactionId);
  } else {
    //create new reaction
    console.log("creating new reaction");
    resetCanvasReaction();
  }
  pageStore$.curPageId.set(pageId);
  reactStore$.reactEditMode.set(true);
  uiStore$.displayReactMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  // reactStore$.showReactions.set(false);
  // reactStore$.showNonUserReactions.set(false);
};
export const resetCanvasReaction = () => {
  reactStore$.curReactionId.set(null);
  reactStore$.reaction.set(null);
};
export const handleCancelReaction = () => {
  resetCanvasReaction();
  uiStore$.displayReactMenu.set(false);
  uiStore$.displayJournalMenu.set(true);
  reactStore$.reactEditMode.set(false);
  reactStore$.showReactions.set(true);
  reactStore$.showNonUserReactions.set(true);
  endBatch();
};
export const handleSaveReaction = () => {
  const reactionId = reactStore$.curReactionId.get();
  if (reactionId) {
    //reaction exits, update it
    const updatedReaction = { reaction: reactStore$.reaction.get() as Json } as Reaction;
    reactions$[reactionId].assign(updatedReaction);
  } else {
    //create new reaction
    const newReactionId = generateId();
    const newReaction = {
      id: newReactionId,
      page_id: pageStore$.curPageId.get(),
      created_by: authStore$.session.user.id.get(),
      reaction: reactStore$.reaction.get() as Json,
    } as Reaction;
    reactions$[newReactionId].set(newReaction);
  }
  //save draft reaction, delete old reaction
  beginBatch();
  uiStore$.displayReactMenu.set(false);
  uiStore$.displayJournalMenu.set(true);
  reactStore$.reactEditMode.set(false);
  reactStore$.showReactions.set(true);
  reactStore$.showNonUserReactions.set(true);
  resetCanvasReaction();
  endBatch();
};

export const addReactionItem = (item: CanvasReactionItem) => {
  const curMax = reactStore$.reaction.maxZIndex.get();
  const newMax = (curMax || 0) + 1;
  batch(() => {
    reactStore$.reaction.items.push({ ...item, z: newMax });
    reactStore$.reaction.maxZIndex.set(newMax);
  });
};

export const updateReactionItem = (item: CanvasReactionItem) => {
  const index = getCanvasReactionItemIndex(item.id);
  reactStore$.reaction.items[index].set(item);
};
export const removeReactItem = (id: string) => {
  const index = getCanvasReactionItemIndex(id);
  reactStore$.reaction.items.splice(index, 1);
};
export const getCanvasReactionItemIndex = (id: string) => {
  return reactStore$.reaction.items.findIndex((val) => val.id.get() === id);
};
export const bringReactionToFront = (id: string) => {
  console.log("bringing reaction to front");
  const index = getCanvasReactionItemIndex(id);
  const curMax = reactStore$.reaction.maxZIndex.get();
  const item = reactStore$.reaction.items[index].get();
  if (curMax && item && item.z < curMax) {
    reactStore$.reaction.items[index].set({ ...item, z: curMax + 1 });
    reactStore$.reaction.maxZIndex.set(curMax + 1);
  }
};
