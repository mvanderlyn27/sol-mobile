import {
  editReactStore$,
  filterNonUserReactions,
  filterUserReactions,
  initializeEditReactStore,
  reactStore$,
} from "@/src/stores/ReactStore";
import { Show, observer } from "@legendapp/state/react";
import ReactItem from "./ReactItem";
import { getPageForUser, pageStore$ } from "@/src/stores/PagesStore";
import { CanvasReaction } from "@/src/types/shared.types";
import { styled } from "nativewind";
import { jsonToReact } from "@/src/services/Reaction";
import { useEffect, useMemo } from "react";
import { View } from "moti";

const StyledShow = styled(Show);

const ReactHolder = observer(function ReactHolder({ row, col }) {
  // Fetching required observables
  const reactEditMode = reactStore$.reactEditMode.get();
  const showNonUserReactions = editReactStore$.showNonUserReactions.get();
  const showReactions = reactStore$.showReactions.get();

  // Grabbing the current user and date to fetch the page
  const user = pageStore$.members[row].get();
  const date = pageStore$.dates[col].get();
  const page = getPageForUser(user?.user_id, date?.date);

  useEffect(() => {
    // Initialize edit store if entering edit mode on the current page
    if (reactEditMode && row === pageStore$.curRow.get() && col === pageStore$.curCol.get()) {
      initializeEditReactStore();
    }
  }, [reactEditMode]);

  // Memoize reactions to avoid recomputation unless dependencies change
  const nonUserCanvasReactions = filterNonUserReactions(page?.id || "")
    .map((reaction) => jsonToReact(reaction.reaction))
    .filter((item): item is CanvasReaction => item !== null);

  const userCanvasReactions = filterUserReactions(page?.id || "")
    .map((reaction) => jsonToReact(reaction.reaction))
    .filter((item): item is CanvasReaction => item !== null);

  //   console.log("user reactions", userCanvasReactions);
  //   console.log("non user reactions", nonUserCanvasReactions);

  const editUserReactions = editReactStore$.userReactions.peek();

  return (
    <StyledShow
      if={reactEditMode}
      className="absolute top-0 right-0 left-0 bottom-0"
      else={
        <View style={{ flex: 1 }}>
          {showNonUserReactions &&
            nonUserCanvasReactions.map((reaction, index) => (
              <ReactItem key={`nonUser-${reaction.id || index}`} item={reaction} usersReaction={false} />
            ))}
          {editUserReactions.map((reaction, index) => (
            <ReactItem key={`user-${reaction.id || index}`} item={reaction} usersReaction={true} />
          ))}
        </View>
      }>
      <View>
        {showReactions &&
          nonUserCanvasReactions.map((reaction, index) => {
            return <ReactItem key={`nonUser-${reaction.id || index}`} item={reaction} usersReaction={false} />;
          })}
        {showReactions &&
          userCanvasReactions.map((reaction, index) => {
            return <ReactItem key={`edit-${reaction.id || index}`} item={reaction} usersReaction={true} />;
          })}
      </View>
    </StyledShow>
  );
});

export default ReactHolder;
