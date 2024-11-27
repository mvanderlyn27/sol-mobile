import { View, Pressable, Dimensions } from "react-native";
import { AnimatePresence, MotiView, Text } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { BottomBarTab, BottomDrawerType, ButtonType } from "@/src/types/shared.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
//<MaterialIcons name="text-fields" size={24} color="black" />
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// <MaterialCommunityIcons name="content-save-outline" size={24} color="black" />
import Feather from "@expo/vector-icons/Feather";
//<Feather name="image" size={24} color="black" />
//<Feather name="layout" size={24} color="black" />
import AntDesign from "@expo/vector-icons/AntDesign";
import TemplateTab from "./TemplateTab";
import { useJournal } from "@/src/contexts/JournalProvider";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { BlurView } from "expo-blur";
import Foundation from "@expo/vector-icons/Foundation";
import BackgroundTab from "./BackgroundTab";
import { observer } from "@legendapp/state/react";
import { uiStore$ } from "@/src/stores/UIStore";
import { getPageForUser, handleEdit, pageStore$, pages$ } from "@/src/stores/PagesStore";
import MenuButton from "../../shared/MenuButton";
import RoundButton from "../../shared/CircleButton";
import DateIndicator from "./DateIndicator";
import UserPic from "../../shared/UserPic";
import { router } from "expo-router";
import authStore$ from "@/src/stores/AuthStore";
import { editReactStore$, initializeEditReactStore, reactStore$ } from "@/src/stores/ReactStore";
//<AntDesign name="closecircleo" size={24} color="black" />
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
const StyledPressable = styled(Pressable);
const StyledView = styled(View);
const StyledFoundation = styled(Foundation);
const { width, height } = Dimensions.get("window");
const StyledBlurView = styled(BlurView);
const JournalFabs = observer(function JournalFabs() {
  const loggedInUser = authStore$.session.user.id.get();
  const curUser = pageStore$.members[pageStore$.curRow.get()].get().user_id;
  const curDate = pageStore$.dates[pageStore$.curCol.get()].get()?.date;
  const pageId = getPageForUser(pages$.get(), curUser, curDate);
  const onUsersPage = loggedInUser === curUser;
  const handleReact = () => {
    uiStore$.displayReactMenu.set(true);
    uiStore$.displayJournalMenu.set(false);
    reactStore$.reactEditMode.set(true);
    reactStore$.showReactions.set(true);
    editReactStore$.showNonUserReactions.set(true);
    initializeEditReactStore();
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
