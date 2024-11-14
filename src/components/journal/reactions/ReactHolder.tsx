import { filteredPageReactions, reactStore$, reactions$ } from "@/src/stores/ReactStore";
import { For, Show, observer } from "@legendapp/state/react";
import ReactItem from "./ReactItem";
import { getPageForUser, pageStore$ } from "@/src/stores/PagesStore";
import { Reaction } from "@/src/types/shared.types";
import { styled } from "nativewind";
import { jsonToReact } from "@/src/services/Reaction";
const StyledShow = styled(Show);
//holds all the reacts for this page
const ReactHolder = observer(function ReactHolder({ row, col }: { row: number; col: number }) {
  const user = pageStore$.members[row].get();
  const date = pageStore$.dates[col].get();
  const page = getPageForUser(user.user_id, date.date);
  const pageReactions: Reaction[] = filteredPageReactions(page?.id || "");
  console.log("all reactions", pageReactions);
  return (
    <StyledShow if={reactStore$.showReactions} className="absolute top-0 right-0 left-0 bottom-0">
      {pageReactions.map((reaction, index) => {
        const reactionObject = jsonToReact(reaction.reaction);
        console.log("tojson", reactionObject);
        return reactionObject && <ReactItem key={index} item={reactionObject} />;
      })}
    </StyledShow>
  );
});
export default ReactHolder;
