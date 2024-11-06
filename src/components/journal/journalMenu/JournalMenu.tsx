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
import { journalStore$ } from "@/src/stores/PagesStore";
import { batch, beginBatch, endBatch } from "@legendapp/state";
import MenuButton from "../../shared/MenuButton";
import RoundButton from "../../shared/CircleButton";
//<AntDesign name="closecircleo" size={24} color="black" />
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
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

  const handleEditMode = () => {
    beginBatch();
    journalStore$.editMode.set(true);
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayJournalMenu.set(false);
    endBatch();
  };
  const handleMenu = () => {
    beginBatch();
    journalStore$.editMode.set(false);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayJournalMenu.set(false);
    uiStore$.displayNavigationBar.set(true);
    endBatch();
  };
  console.log("journal day", journalStore$.selectedDate.get());
  return (
    <>
      <StyledMotiView
        className="absolute top-10 right-10 "
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 100 }}
        transition={{ type: "timing", duration: 100 }}>
        <MenuButton
          onPress={function (): void {
            throw new Error("Function not implemented.");
          }}
          buttonType={ButtonType.Save}
        />
      </StyledMotiView>
      <StyledMotiView
        className="absolute top-10 left-10 "
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 100 }}
        transition={{ type: "timing", duration: 100 }}>
        <MenuButton
          onPress={function (): void {
            throw new Error("Function not implemented.");
          }}
          buttonType={ButtonType.X}
        />
      </StyledMotiView>

      <StyledMotiView
        className="absolute bottom-10 left-10 right-10 flex-row justify-center items-center"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 100 }}
        transition={{ type: "timing", duration: 100 }}>
        <StyledView className="flex-1 justify-center items-center ">
          <RoundButton
            onClick={function (): void {
              throw new Error("Function not implemented.");
            }}
            buttonType={ButtonType.Menu}
          />
        </StyledView>
        <StyledView className="flex-1 justify-center items-center ">
          <RoundButton
            onClick={function (): void {
              throw new Error("Function not implemented.");
            }}
            buttonType={ButtonType.Menu}
          />
        </StyledView>
        <StyledView className="flex-1 justify-center items-center ">
          <RoundButton
            onClick={function (): void {
              throw new Error("Function not implemented.");
            }}
            buttonType={ButtonType.Menu}
          />
        </StyledView>
      </StyledMotiView>
    </>
  );
});

export default JournalMenu;
