import { Observable, beginBatch, endBatch, observable } from "@legendapp/state";
import {
  Canvas,
  CanvasItem,
  CanvasReactionItem,
  ImageType,
  NotificationType,
  PageReaction,
  ReactionItem,
  ReactionTextItem,
} from "../types/shared.types";
import { Dimensions } from "react-native";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import { supabase } from "../lib/supabase";
import authStore$ from "./AuthStore";
import { getPageForUser, pageStore$, pages$ } from "./PagesStore";
import { Json } from "../types/supabase.types";
import { jsonToReact } from "../services/Reaction";
import { uiStore$ } from "./UIStore";
import ReactItem from "../components/journal/reactions/ReactItem";
import { addNotification } from "./NotificationStore";
import { max } from "lodash";
import { posthog } from "../services/Posthog";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";

//@ts-ignore
export const pageReactions$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "page_reactions",
    select: (from: any) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "page_reactions",
      //for some reason this is needed to make the real time syncing consistent
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<PageReaction>) => {
      if (type === "delete") {
        const reactions$ = Object.values(reactionItems$).forEach((item$) => {
          if (item$.page_reaction_id.get() === value.id) {
            item$.delete();
          }
        });
      } else {
        return pages$[value.page_id].created_at;
      }
    },
    onError: (error: any) => {
      console.log("page reaction error", error);
      posthog.capture("page-reaction-sync-error", { error });
    },
  })
);
export const reactionItems$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "reaction_items",
    select: (from: any) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "reaction_items",
      //for some reason this is needed to make the real time syncing consistent
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<ReactionItem>) => {
      if (type === "delete") {
        switch (value.type) {
          case "text": {
            console.log("deleting reaction text item before reaction item");
            reactionTextItems$[value.id].delete();
            break;
          }
        }
      } else {
        return pageReactions$[value.page_reaction_id].created_at;
      }
    },
    onError: (error: any) => {
      console.log("reaction item error", error);
      posthog.capture("reaction-item-sync-error", { error });
    },
  })
);
export const reactionTextItems$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "reaction_text_items",
    select: (from: any) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "reaction_text_items",
      //for some reason this is needed to make the real time syncing consistent
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<ReactionTextItem>) => {
      if (type !== "delete") {
        return reactionItems$[value.id].created_at;
      }
    },
    onError: (error: any) => {
      posthog.capture("reaction-text-item-sync-error", { error });
    },
  })
);
interface ReactStore {
  showReactions: boolean;
  showNonUserReactions: boolean;
  reactEditMode: boolean;
  curPageReactionId: string | null;
  curPageReactionDraftId: string | null;
}

const { width, height } = Dimensions.get("window");

// Observable store
export const reactStore$ = observable<ReactStore>({
  showReactions: true,
  showNonUserReactions: true,
  reactEditMode: false,
  curPageReactionId: null,
  curPageReactionDraftId: null,
});
export const cleanUpReactions = (pageId: string) => {
  //removes any old drafts
  Object.values(pageReactions$)
    .filter((pageReaction) => pageReaction.page_id.get() === pageId && pageReaction.draft.get())
    .forEach((pageReaction) => pageReaction.delete());
};
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
  cleanUpReactions(pageId);
  const oldReactionPageId = Object.values(pageReactions$)
    .find((reaction) => reaction.page_id.get() === pageId)
    ?.id.get();
  const newReactionPageId = generateId();
  if (oldReactionPageId) {
    //duplicate reaction info
    const oldReaction = pageReactions$[oldReactionPageId].get();
    console.log("existing page reaction creating draft", oldReaction, newReactionPageId);
    pageReactions$[newReactionPageId].set({
      id: newReactionPageId,
      draft: true,
      page_id: oldReaction.page_id,
      created_by: oldReaction.created_by,
    } as PageReaction);
    const oldReactionItems = Object.values(reactionItems$).filter(
      (reaction) => reaction.page_reaction_id.get() === oldReaction.id
    );
    oldReactionItems.forEach((reaction$) => {
      const reaction = reaction$.get();
      console.log("duplicating reaction", reaction);
      const newReactionId = generateId();
      const newReactionItem = {
        id: newReactionId,
        x: reaction.x,
        y: reaction.y,
        z: reaction.z,
        rotation: reaction.rotation,
        type: reaction.type,
        height: reaction.height,
        width: reaction.width,
        page_reaction_id: newReactionPageId,
      } as ReactionItem;

      reactionItems$[newReactionId].set(newReactionItem);
      switch (reaction.type) {
        case "text": {
          const oldTextReaction = reactionTextItems$[reaction.id].get();
          const newTextReaction = {
            id: newReactionId,
            font: oldTextReaction.font,
            font_size: oldTextReaction.font_size,
            color: oldTextReaction.color,
            text: oldTextReaction.text,
          } as ReactionTextItem;
          reactionTextItems$[newReactionId].set(newTextReaction);
        }
      }
    });
  } else {
    //create new
    console.log("creating new page reaction");
    pageReactions$[newReactionPageId].set({
      id: newReactionPageId,
      page_id: pageId,
      created_by: curUserId,
      draft: true,
    } as PageReaction);
  }
  beginBatch();

  uiStore$.displayReactMenu.set(true);
  uiStore$.displayJournalMenu.set(false);
  reactStore$.curPageReactionId.set(oldReactionPageId || null);
  reactStore$.curPageReactionDraftId.set(newReactionPageId);
  reactStore$.reactEditMode.set(true);
  reactStore$.showReactions.set(true);
  reactStore$.showNonUserReactions.set(true);
  endBatch();
};
export const handleCancelReaction = () => {
  const draftId = reactStore$.curPageReactionDraftId.get();
  if (!draftId) {
    console.log("error canceling reaction, please try again");
    addNotification({ id: generateId(), type: NotificationType.error, message: "error canceling, please try again" });
    return;
  }
  pageReactions$[draftId].delete();
  beginBatch();
  uiStore$.displayReactMenu.set(false);
  uiStore$.displayJournalMenu.set(true);
  reactStore$.reactEditMode.set(false);
  reactStore$.curPageReactionId.set(null);
  reactStore$.curPageReactionDraftId.set(null);
  reactStore$.showReactions.set(true);
  reactStore$.showNonUserReactions.set(true);
  endBatch();
};
export const handleSaveReaction = () => {
  const oldId = reactStore$.curPageReactionId.get();
  const draftId = reactStore$.curPageReactionDraftId.get();
  if (!draftId) {
    console.log("error can't save, no draft found");
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Error saving reacitons, please try again",
    });
    return;
  }
  pageReactions$[draftId].draft.set(false);
  if (oldId) {
    console.log("removing old reaction", oldId);
    pageReactions$[oldId].delete();
  }
  //save draft reaction, delete old reaction
  beginBatch();
  uiStore$.displayReactMenu.set(false);
  uiStore$.displayJournalMenu.set(true);
  reactStore$.reactEditMode.set(false);
  reactStore$.showReactions.set(true);
  reactStore$.showNonUserReactions.set(true);
  reactStore$.curPageReactionId.set(null);
  reactStore$.curPageReactionDraftId.set(null);
  endBatch();
};

export const addReactionItem = (item: CanvasReactionItem) => {
  console.log("adding reaction item", item);
  const draftReactionPageId = reactStore$.curPageReactionDraftId.get();
  if (!draftReactionPageId) {
    console.log("error finding pageReaction for reaction add");
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: "Error adding reaction, please try again",
    });
    return;
  }
  beginBatch();
  const reactionItem: ReactionItem = {
    id: item.id,
    x: item.x,
    y: item.y,
    z: item.z,
    page_reaction_id: draftReactionPageId,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
    type: item.type,
  } as ReactionItem;
  console.log("pageItem", reactionItem);
  reactionItems$[item.id].set(reactionItem);
  switch (item.type) {
    case "text": {
      const reactionTextItem: ReactionTextItem = {
        id: item.id,
        color: item.fontColor,
        font_size: item.fontSize,
        font: item.fontType,
        text: item.textContent,
      } as ReactionTextItem;
      console.log("adding new text item", reactionTextItem);
      reactionTextItems$[item.id].set(reactionTextItem);
      break;
    }
  }
  bringReactionToFront(item.id);
  endBatch();
};

export const updateReactionItem = (item: CanvasReactionItem) => {
  const reactionItem = {} as ReactionItem;
  if (item.x !== undefined) {
    reactionItem.x = item.x;
  }
  if (item.y !== undefined) {
    reactionItem.y = item.y;
  }
  if (item.z !== undefined) {
    reactionItem.z = item.z;
  }
  if (item.width !== undefined) {
    reactionItem.width = item.width;
  }
  if (item.height !== undefined) {
    reactionItem.height = item.height;
  }
  if (item.rotation !== undefined) {
    reactionItem.rotation = item.rotation;
  }
  reactionItems$[item.id].assign(reactionItem);
  switch (item.type) {
    case "text": {
      const textItem = {} as ReactionTextItem;
      if (item.fontColor !== undefined) {
        textItem.color = item.fontColor;
      }
      if (item.fontSize !== undefined) {
        textItem.font_size = item.fontSize;
      }
      if (item.fontType !== undefined) {
        textItem.font = item.fontType;
      }
      if (item.textContent !== undefined) {
        textItem.text = item.textContent;
      }
      reactionTextItems$[item.id].assign(textItem);
    }
  }
};
export const removeReactItem = (id: string) => {
  //should auto delete child from store waitForSync
  reactionItems$[id].delete();
};
const getMaxReactionZ = (pageId: string) => {
  const zValues = Object.values(reactionItems$)
    .filter((item: Observable<ReactionItem>) => item.page_reaction_id.get() === pageId)
    .map((item) => item.z.get());
  return max(zValues) || 0;
};
export const bringReactionToFront = (itemId: string) => {
  const curItem$ = reactionItems$[itemId];
  const curMax = getMaxReactionZ(curItem$.page_reaction_id.get());
  const curZ = curItem$.z.get();
  // if (curZ === 0 || curMax > curZ) {
  //only update if current z isn't already max
  curItem$.z.set(curMax + 1);
  // }
};
