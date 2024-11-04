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
    <StyledMotiView
      key="bottom-bar"
      className="absolute bottom-6 right-4 left-4 rounded-xl overflow-hidden z-10"
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 20 }}
      exitTransition={{ type: "timing", duration: 100 }}
      transition={{ type: "timing", duration: 100 }}>
      <StyledBlurView tint="dark" className="p-3">
        <StyledMotiView key="bottom-bar" className="  flex-row justify-between items-center rounded-full ">
          <MenuButton
            onPress={handleMenu}
            buttonType={ButtonType.Template}
            selected={selectedTab === BottomBarTab.Template}
          />
          <AnimatePresence exitBeforeEnter={true}>
            <MotiView
              key={journalStore$.selectedDate.get()} // Reset animation on each text change
              from={{
                opacity: 0,
                translateY: -50, // Start slightly above the frame
                rotateX: "90deg", // Initial rotation to make it appear from top
              }}
              animate={{
                opacity: 1,
                translateY: 0,
                rotateX: "0deg", // Rotate to bring text into view
              }}
              exit={{
                opacity: 0,
                translateY: 50, // Move out to bottom of frame
                rotateX: "-90deg", // Rotate out to complete 3D effect
              }}
              transition={{
                type: "timing",
                duration: 200,
              }}>
              <Text style={{ fontSize: 24, color: "black" }}>{journalStore$.selectedDate.get()}</Text>
            </MotiView>
          </AnimatePresence>
          <MenuButton
            selected={selectedTab === BottomBarTab.Background}
            onPress={handleEditMode}
            buttonType={ButtonType.Background}
          />
        </StyledMotiView>
      </StyledBlurView>
    </StyledMotiView>
  );
});

export default JournalMenu;
