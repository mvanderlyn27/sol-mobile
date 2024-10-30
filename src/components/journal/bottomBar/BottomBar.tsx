import { View, Pressable, Dimensions } from "react-native";
import { AnimatePresence, MotiView } from "moti";
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
import FontTab from "./FontTab";
import ImageTab from "./ImageTab";
import TemplateTab from "./TemplateTab";
import { useJournal } from "@/src/contexts/JournalProvider";
import Drawer from "../../shared/Drawer";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { BlurView } from "expo-blur";
import { StyledPressable } from "../canvas/CanvasFrameHolder";
import Foundation from "@expo/vector-icons/Foundation";
import { useUIStore } from "@/src/stores/UIStore";
import BackgroundTab from "./BackgroundTab";
import StickerTab from "./StickerTab";
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
export default function BottomBar() {
  // const { canvasHasChanges } = useCanvas();
  // const { editMode, bottomBarVisible } = useJournal();
  const displayJournalEditMenu = useUIStore((state) => state.displayJournalEditMenu);
  const [selectedTab, setSelectedTab] = useState<BottomBarTab | null>(null);
  const [showCancelDrawer, setShowCancelDrawer] = useState<boolean>(false);
  const handleExit = () => {
    if (selectedTab) setSelectedTab(null);
    // if (canvasHasChanges) {
    setShowCancelDrawer(true);
    // } else {
    // onExit();
    // }
  };
  const handleSave = () => {};
  const handleDrawerSave = () => {
    setShowCancelDrawer(false);
    // onSave();
    if (selectedTab) setSelectedTab(null);
    // onExit();
  };
  const handleDrawerExit = () => {
    setShowCancelDrawer(false);
    if (selectedTab) setSelectedTab(null);
    // onExit();
  };
  const handleTemplate = () => {
    if (selectedTab === BottomBarTab.Template) {
      setSelectedTab(null);
      return;
    }
    setSelectedTab(BottomBarTab.Template);
  };
  const handleFrame = () => {
    if (selectedTab === BottomBarTab.Image) {
      setSelectedTab(null);
      return;
    }
    setSelectedTab(BottomBarTab.Image);
  };
  const handleText = () => {
    if (selectedTab === BottomBarTab.Text) {
      setSelectedTab(null);
      return;
    }
    setSelectedTab(BottomBarTab.Text);
  };
  const handleSelect = () => {
    setSelectedTab(null);
  };
  const getSelectedTab = () => {
    switch (selectedTab) {
      case BottomBarTab.Background:
        return <BackgroundTab onSelect={handleSelect} />;
      case BottomBarTab.Sticker:
        return <StickerTab onSelect={handleSelect} />;
      case BottomBarTab.Template:
        return <TemplateTab onSelect={handleSelect} />;
      case BottomBarTab.Image:
        return <ImageTab onSelect={handleSelect} />;
      case BottomBarTab.Text:
        return <FontTab onSelect={handleSelect} />;
      default:
        return null;
    }
  };
  return (
    <AnimatePresence>
      {/* {editMode && bottomBarVisible && ( */}
      {displayJournalEditMenu && (
        <StyledMotiView
          key="bottom-bar"
          className="absolute bottom-6 right-4 left-4 rounded-xl overflow-hidden z-10"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 20 }}
          exitTransition={{ type: "timing", duration: 200 }}
          transition={{ type: "timing", duration: 200 }}>
          <StyledBlurView intensity={80} tint="dark" className="p-4 flex-1 rounded-[40px] bg-black">
            <AnimatePresence>
              {selectedTab && (
                <StyledMotiView
                  key="bottom-bar-data"
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: height * 0.6 }}
                  exit={{ opacity: 0, height: 0 }}
                  exitTransition={{ type: "timing", duration: 300 }}
                  transition={{ type: "timing", duration: 400 }}>
                  {/* This is where the tab data */}
                  {selectedTab && getSelectedTab()}
                </StyledMotiView>
              )}
            </AnimatePresence>
            <StyledMotiView key="bottom-bar" className="  flex-row justify-between items-center rounded-full ">
              <BottomBarButton
                onPress={handleExit}
                buttonType={ButtonType.Template}
                selected={selectedTab === BottomBarTab.Template}
              />
              <BottomBarButton
                selected={selectedTab === BottomBarTab.Background}
                onPress={handleTemplate}
                buttonType={ButtonType.Background}
              />
              <BottomBarButton
                selected={selectedTab === BottomBarTab.Image}
                onPress={handleFrame}
                buttonType={ButtonType.Image}
              />
              <BottomBarButton
                selected={selectedTab === BottomBarTab.Text}
                onPress={handleText}
                buttonType={ButtonType.Text}
              />
              <BottomBarButton onPress={handleSave} buttonType={ButtonType.Sticker} />
            </StyledMotiView>
          </StyledBlurView>
        </StyledMotiView>
      )}
      {showCancelDrawer && (
        <Drawer
          key="bottom-bar-cancel-drawer"
          text={"Save unsaved changes?"}
          onClose={() => setShowCancelDrawer(false)}
          buttons={[
            { action: handleDrawerSave, text: "Save", color: "bg-primary" },
            { action: () => handleDrawerExit(), text: "Leave", color: "bg-red-500" },
          ]}
        />
      )}
    </AnimatePresence>
  );
}

function BottomBarButton({
  onPress,
  disabled = false,
  buttonType,
  selected = false,
}: {
  onPress: () => void;
  disabled?: boolean;
  buttonType: ButtonType;
  selected?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const getButtonIcon = () => {
    switch (buttonType) {
      case "text":
        return (
          <StyledMaterial name="text-fields" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />
        );
      case "save":
        return <StyledMaterialCommunity name="content-save-outline" size={24} className="text-primary" />;
      case "image":
        return <StyledFeather name="image" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />;
      case "template":
        return <StyledFeather name="layout" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />;
      case "x":
        return <StyledAnt name="closecircleo" size={24} className="text-red-500" />;
      case "sticker":
        return <StyledAnt name="smile-circle" size={24} className="text-secondary" />;
      case "background":
        return <StyledFoundation name="page" size={24} className={"text-secondary"} />;

      default:
        return null;
    }
  };
  const getButtonColor = () => {
    if (selected) {
      return "bg-secondary";
    } else {
      return "bg-clear";
    }
  };

  return (
    <Pressable onPress={disabled ? () => {} : onPress}>
      <StyledMotiView
        className={` w-[40px] h-[40px] rounded-full ${getButtonColor()} items-center justify-center`}
        from={{ scale: 1 }}
        animate={disabled ? {} : { scale: isPressed ? 1.2 : 1 }} // Scale up when pressed
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 150,
        }}>
        {getButtonIcon()}
      </StyledMotiView>
    </Pressable>
  );
}
