import { Show, observer } from "@legendapp/state/react";
import ReactItem from "./ReactItem";
import { CanvasTextReaction } from "@/src/types/shared.types";
import { styled } from "nativewind";
import { memo } from "react";
import { AnimatePresence, MotiView, View } from "moti";
import authStore$ from "@/src/stores/AuthStore";
import { pageReactions$, reactStore$, reactionItems$, reactionTextItems$ } from "@/src/stores/ReactStore";

const StyledView = styled(View);

const ReactHolder = observer(function ReactHolder({
  pageId,
  editMode,
}: {
  pageId: string | undefined;
  editMode: boolean;
}) {
  if (!pageId) {
    return null;
  }
  const curUserReactionPage = Object.values(pageReactions$)
    .find((reactionPage) => {
      return reactionPage.page_id.get() === pageId && (editMode ? reactionPage.draft.get() : !reactionPage.draft.get());
    })
    ?.get();
  if (!curUserReactionPage) {
    console.log("no reactions found");
    return null;
  }
  const otherUserReactionPagesIds = Object.values(pageReactions$)
    .filter(
      (reactionPage) =>
        reactionPage.page_id.get() === pageId && reactionPage.created_by.get() !== authStore$.session.user.id.get()
    )
    ?.map((reactionPage$) => reactionPage$.id.get());
  const reactions = reactStore$.showReactions.get()
    ? Object.values(reactionItems$.get() || {}).filter((reactionItem) => {
        return [
          ...([curUserReactionPage.id] || []),
          ...[reactStore$.showNonUserReactions ? otherUserReactionPagesIds : []],
        ].includes(reactionItem.page_reaction_id);
      })
    : [];
  return (
    <StyledView
      key={`${curUserReactionPage.id}`}
      className="absolute top-0 right-0 left-0 bottom-0 bg-transparent"
      pointerEvents="box-none">
      {reactions.map((reaction, index) => {
        if (!reaction) return null;
        switch (reaction.type) {
          case "text": {
            const reactionTextItem = reactionTextItems$[reaction.id].get();
            const canvasReaction: CanvasTextReaction = {
              ...reaction,
              textContent: reactionTextItem?.text,
              fontSize: reactionTextItem?.font_size,
              fontColor: reactionTextItem?.color,
              fontType: reactionTextItem?.font,
            } as CanvasTextReaction;
            return (
              <AnimatePresence key={`nonUser-${reaction.id}-${index}`}>
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "timing", duration: 200 }}>
                  <ReactItem
                    item={canvasReaction}
                    usersReaction={reaction.page_reaction_id === curUserReactionPage.id}
                  />
                </MotiView>
              </AnimatePresence>
            );
          }
        }
      })}
    </StyledView>
  );
});

export default memo(ReactHolder);
