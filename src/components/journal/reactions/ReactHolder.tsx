import { Show, observer } from "@legendapp/state/react";
import ReactItem from "./ReactItem";
import { CanvasReaction, CanvasTextReaction } from "@/src/types/shared.types";
import { styled } from "nativewind";
import { memo, useMemo } from "react";
import { AnimatePresence, MotiView, View } from "moti";
import authStore$ from "@/src/stores/AuthStore";
import { reactStore$, reactions$ } from "@/src/stores/ReactStore";
import { generateJsonHash } from "@/src/utils/crypto";

const StyledView = styled(View);

const ReactHolder = observer(function ReactHolder({
  pageId,
  editMode,
}: {
  pageId: string | undefined;
  editMode: boolean;
}) {
  const curUserId = authStore$.session.user.id.get();
  if (!pageId || !curUserId) {
    return null;
  }
  if (!reactStore$.showReactions.get()) {
    return null;
  }
  const myReactions = editMode
    ? reactStore$.reaction.get()
    : (Object.values(reactions$.get() || {}).find((reaction) => {
        return reaction.page_id === pageId && reaction.created_by === curUserId;
      })?.reaction as CanvasReaction);
  const otherUserReactions = reactStore$.showNonUserReactions.get()
    ? Object.values(reactions$.get() || {})
        .filter((reaction) => {
          return reaction.page_id === pageId && reaction.created_by !== curUserId;
        })
        .map((reaction) => reaction.reaction as CanvasReaction)
    : [];

  const otherReactions = otherUserReactions
    .map((reaction) => {
      return reaction.items;
    })
    .flat();
  // const key = useMemo(() => generateJsonHash([myReactions, ...otherReactions]), [myReactions, otherReactions]);
  // console.log("keys", key);
  return (
    <StyledView className="absolute top-0 right-0 left-0 bottom-0 bg-transparent" pointerEvents="box-none">
      {myReactions?.items.map((reaction, index) => {
        if (!reaction) return null;
        // const key = useMemo(() => generateJsonHash(reaction), [reaction ? reaction : null]);
        switch (reaction.type) {
          case "text": {
            return (
              <AnimatePresence key={`${index}`}>
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "timing", duration: 200 }}>
                  <ReactItem item={reaction} usersReaction={true} />
                </MotiView>
              </AnimatePresence>
            );
          }
        }
      })}
      {otherReactions.map((reaction, index) => {
        if (!reaction) return null;
        const key = useMemo(() => generateJsonHash(reaction), [reaction ? reaction : null]);
        switch (reaction.type) {
          case "text": {
            return (
              <AnimatePresence key={key}>
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "timing", duration: 200 }}>
                  <ReactItem key={`nonUser-${reaction.id}-${index}`} item={reaction} usersReaction={false} />
                </MotiView>
              </AnimatePresence>
            );
          }
        }
      })}
    </StyledView>
  );
});

export default ReactHolder;
