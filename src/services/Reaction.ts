import { batch, beginBatch, endBatch, Observable } from "@legendapp/state";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { addNotification } from "../stores/NotificationStore";
import { pageStore$, pages$ } from "../stores/PagesStore";
import { reactions$, reactStore$ } from "../stores/ReactStore";
import { uiStore$ } from "../stores/UIStore";
import { CanvasReaction, CanvasReactionItem, Json, NotificationType, Page, Reaction } from "../types/shared.types";
import { isEqual, max } from "lodash";
import { getPageForUser } from "./Page";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import { groupStore$ } from "../stores/GroupStore";
import { ApiService } from "./ApiService";
export const initializeReactStore = () => {};
export const useInitializeReactRealtimeListeners = () => {
  useEffect(() => {
    const subscription = supabase
      .channel("reactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "reactions",
          schema: "public",
          // filter: filter || undefined,
        },
        (payload) => {
          console.log("realtime update reactions", payload);
          const { eventType, new: value, old } = payload;
          if (eventType === "INSERT" || eventType === "UPDATE") {
            const cur = reactions$.peek()?.[value.id];
            if (cur && isEqual(value.reaction, cur?.reaction)) {
              console.log("No reaction changes detected, skipping update");
              return;
            }
            let isOk = false;
            let lastSync = undefined;
            if (!isOk) {
              const curDateStr = cur && (cur["updated_at"] || cur["created_at"]);
              const valueDateStr = (true && value["updated_at"]) || (true && value["created_at"]);
              lastSync = +new Date(valueDateStr);
              isOk =
                valueDateStr &&
                (!curDateStr || lastSync > +new Date(curDateStr)) &&
                JSON.stringify(value.reaction) !== JSON.stringify(cur?.reaction);
            }
            if (isOk) {
              console.log("updating reaction from realtime");
              reactions$[value.id].set(value as Reaction);
            }
          } else if (eventType === "DELETE") {
            reactions$[old.id].delete();
          }
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []); // Empty dependency array ensures this runs only on mount/unmount
};
export const handleEditReaction = () => {
  //create draft object, duplicate any needed values
  const day = pageStore$.dates[pageStore$.curCol.get()].get();
  const userId = pageStore$.members[pageStore$.curRow.get()]?.user_id.get();
  const curUserId = authStore$.session.user.id.get();
  const pageId = getPageForUser(pages$.get() as Record<string, Page>, userId, day.date)?.id;
  if (!pageId) {
    console.log("error finding page for edit");
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Error editing page, please try again",
    });
    return;
  }
  const reactionId = Object.values(reactions$.get() || {}).find(
    (r) => r.page_id === pageId && r.created_by === curUserId
  )?.id;
  if (reactionId) {
    const oldReaction = reactions$[reactionId].get()?.reaction as CanvasReaction;
    reactStore$.reaction.set(JSON.parse(JSON.stringify(oldReaction)));
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
export const handleSaveReaction = async () => {
  const reactionId = reactStore$.curReactionId.get();
  if (reactionId) {
    //reaction exits, update it
    const updatedReaction = { reaction: reactStore$.reaction.get() as Json } as Reaction;
    // reactions$[reactionId].assign(updatedReaction);
    const { error } = await ApiService.optimisticSave("reactions", updatedReaction);
    if (error) {
      console.log("error updating reaction");
      //update state properly
    }
  } else {
    console.log("creating new reaction");
    //create new reaction
    const newReactionId = generateId();
    const newReaction = {
      id: newReactionId,
      page_id: pageStore$.curPageId.get(),
      created_by: authStore$.session.user.id.get(),
      reaction: reactStore$.reaction.get() as Json,
    } as Reaction;
    // reactions$[newReactionId].set(newReaction);
    const { error } = await ApiService.optimisticSave("reactions", newReaction);
    if (error) {
      console.log("error saving reaction");
      //update state properly
    }
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
  const oldItem = reactStore$.reaction.items[index].get();
  reactStore$.reaction.items[index].set({ ...oldItem, ...item });
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
