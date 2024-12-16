import { View } from "react-native";
import { styled } from "nativewind";
import { ButtonType } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import { pageStore$, pages$ } from "@/src/stores/PagesStore";
import RoundButton from "../../shared/CircleButton";
import authStore$ from "@/src/stores/AuthStore";
import { reactStore$ } from "@/src/stores/ReactStore";
import { getPageForUser, handleEdit } from "@/src/services/Page";
import { handleEditReaction } from "@/src/services/Reaction";
const StyledView = styled(View);
const JournalFabs = observer(function JournalFabs() {
  const loggedInUser = authStore$.session.user.id.get();
  const curUser = pageStore$.members[pageStore$.curRow.get()].get().user_id;
  const curDate = pageStore$.dates[pageStore$.curCol.get()].get()?.date;
  const pageId = getPageForUser(pages$.get(), curUser, curDate)?.id;
  const onUsersPage = loggedInUser === curUser;
  const handleReact = () => {
    handleEditReaction();
  };
  const editPage = () => {
    reactStore$.showReactions.set(false);
    handleEdit();
  };
  return (
    <StyledView className=" flex-col justify-center items-center">
      <StyledView className="py-2">
        <RoundButton
          selected={reactStore$.showReactions.get()}
          onClick={reactStore$.showReactions.toggle}
          buttonType={ButtonType.View}
          disabled={!pageId}
        />
      </StyledView>
      <StyledView className="py-2">
        {onUsersPage ? (
          <RoundButton primary onClick={editPage} buttonType={ButtonType.Edit} />
        ) : (
          <RoundButton
            primary={pageId !== undefined}
            onClick={handleReact}
            buttonType={ButtonType.React}
            disabled={!pageId}
          />
        )}
      </StyledView>
    </StyledView>
  );
});

export default JournalFabs;
