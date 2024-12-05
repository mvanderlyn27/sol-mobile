import { beginBatch, endBatch, Observable } from "@legendapp/state";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { addNotification } from "../stores/NotificationStore";
import { pageStore$, pages$ } from "../stores/PagesStore";
import { pageReactions$, reactionItems$, reactionTextItems$, reactStore$ } from "../stores/ReactStore";
import { uiStore$ } from "../stores/UIStore";
import {
  NotificationType,
  PageReaction,
  ReactionItem,
  ReactionTextItem,
  CanvasReactionItem,
} from "../types/shared.types";
import { max } from "lodash";
import { getPageForUser } from "./Page";

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
    .find((reaction) => reaction.page_id.get() === pageId && reaction.created_by.get() === curUserId)
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
