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
import { CanvasReaction, Reaction } from "@/src/types/shared.types";
import { styled } from "nativewind";
import { jsonToReact } from "@/src/services/Reaction";
import { memo, useEffect, useMemo } from "react";
import { AnimatePresence, MotiView, View } from "moti";
import { whenReady } from "@legendapp/state";
import authStore$ from "@/src/stores/AuthStore";

const StyledShow = styled(Show);
const StyledView = styled(View);

const ReactHolder = observer(function ReactHolder({ reactions }: { reactions: Reaction[] }) {
  // Fetching required observables
  console.log("re-rendering", reactions.length);
  return (
    <StyledView className="absolute top-0 right-0 left-0 bottom-0 bg-transparent" pointerEvents="box-none">
      {reactions.map((reaction, index) => {
        const canvasReaction = jsonToReact(reaction.reaction);
        if (!canvasReaction) return null;
        return (
          <AnimatePresence key={`nonUser-${reaction.id}-${index}`}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}>
              <ReactItem
                item={canvasReaction}
                usersReaction={reaction.created_by === authStore$.session.user.id.get()}
              />
            </MotiView>
          </AnimatePresence>
        );
      })}
    </StyledView>
  );
});

export default memo(ReactHolder);
