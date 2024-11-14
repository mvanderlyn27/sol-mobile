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
import { pageStore$, pages$ } from "@/src/stores/PagesStore";
import { batch, beginBatch, endBatch } from "@legendapp/state";
import MenuButton from "../../shared/MenuButton";
import RoundButton from "../../shared/CircleButton";
import DateIndicator from "./DateIndicator";
import UserPic from "../../shared/UserPic";
import { router } from "expo-router";
import JournalFabs from "./JournalFabs";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import { jsonToCanvas } from "@/src/services/Canvas";
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
const JournalMenu = observer(function JournalMenu() {
  // const { canvasHasChanges } = useCanvas();
  // const { editMode, bottomBarVisible } = useJournal();
  const displayJournalMenu = uiStore$.displayJournalMenu.get();
  const [selectedTab, setSelectedTab] = useState<BottomBarTab | null>(null);
  const [showCancelDrawer, setShowCancelDrawer] = useState<boolean>(false);
  const members = pageStore$.members.get();
  const row = pageStore$.curRow.get();
  const userId = members[row].user_id;
  return (
    <StyledView className="flex-1" pointerEvents={"box-none"}>
      <StyledMotiView
        className="absolute top-2 right-8 left-8 flex-row justify-center items-center "
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 200 }}
        transition={{ type: "timing", duration: 200 }}>
        <StyledPressable
          onPress={() => {
            console.log("back");
            router.back();
          }}
          className="">
          <AntDesign name="left" size={30} color="black" />
        </StyledPressable>
        <DateIndicator />
        <UserPic userId={userId} />
      </StyledMotiView>
      <StyledMotiView
        className="absolute bottom-4 right-8"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 200 }}
        transition={{ type: "timing", duration: 200 }}>
        <JournalFabs />
      </StyledMotiView>
    </StyledView>
  );
});

export default JournalMenu;
