import {
  editReactStore$,
  filterNonUserReactions,
  filterUserReactions,
  initializeEditReactStore,
  reactStore$,
} from "@/src/stores/ReactStore";
import { Show, observer, useMount } from "@legendapp/state/react";
import ReactItem from "./ReactItem";
import { getPageForUser, pageStore$ } from "@/src/stores/PagesStore";
import { CanvasReaction } from "@/src/types/shared.types";
import { styled } from "nativewind";
import { jsonToReact } from "@/src/services/Reaction";
import { memo, useEffect, useMemo } from "react";
import { AnimatePresence, MotiView, View } from "moti";
import { whenReady } from "@legendapp/state";

const StyledShow = styled(Show);
const StyledView = styled(View);

const ReactHolder = observer(function ReactHolder({ row, col, active }) {
  // Fetching required observables

  // Grabbing the current user and date to fetch the page
  const user = pageStore$.members[row].get();
  const date = pageStore$.dates[col].get();
  const page = getPageForUser(user?.user_id, date?.date);
  const nonUserCanvasReactions = filterNonUserReactions(page?.id || "")
    .map((reaction) => jsonToReact(reaction.reaction))
    .filter((item): item is CanvasReaction => item !== null);

  const userCanvasReactions = filterUserReactions(page?.id || "")
    .map((reaction) => jsonToReact(reaction.reaction))
    .filter((item): item is CanvasReaction => item !== null);
  let reactEditMode = false;
  let showEditNonUserReactions = false;
  let showReactions = true;
  let editUserReactions: CanvasReaction[] = [];
  let showNonUserReactions = true;

  console.log("r,c, active? ", row, col, active);
  if (active) {
    reactEditMode = reactStore$.reactEditMode.get();
    showEditNonUserReactions = editReactStore$.showNonUserReactions.get();
    showReactions = reactStore$.showReactions.get();
    editUserReactions = editReactStore$.userReactions.get();
    showNonUserReactions = (!reactEditMode && showReactions) || (reactEditMode && showEditNonUserReactions);
    whenReady(editReactStore$.userReactions, () => editReactStore$.isReady.set(true));
    // console.log("non user reactions", nonUserCanvasReactions);
    // console.log("user reactions", userCanvasReactions);
    // console.log("edit reactions", editUserReactions);
  }

  return (
    <StyledView className="absolute top-0 right-0 left-0 bottom-0" pointerEvents="box-none">
      <AnimatePresence>
        {showNonUserReactions && (
          <MotiView
            key="non-user-reactions"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}>
            {nonUserCanvasReactions.map((reaction, index) => {
              return <ReactItem key={`nonUser-${reaction.id || index}`} item={reaction} usersReaction={false} />;
            })}
          </MotiView>
        )}
        {!reactEditMode && showReactions && (
          <MotiView
            key="edit-user-reactions"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}>
            {userCanvasReactions.map((reaction, index) => {
              return <ReactItem key={`edit-${reaction.id || index}`} item={reaction} usersReaction={true} />;
            })}
          </MotiView>
        )}
        {reactEditMode && editReactStore$.isReady.get() && (
          <MotiView
            key="user-reactions"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}>
            {editUserReactions.map((reaction, index) => (
              <ReactItem key={`user-${reaction.id || index}`} item={reaction} usersReaction={true} />
            ))}
          </MotiView>
        )}
      </AnimatePresence>
    </StyledView>
  );
});

export default memo(ReactHolder);
