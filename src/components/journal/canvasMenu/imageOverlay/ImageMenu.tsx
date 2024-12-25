import { View, Pressable, Dimensions, Text } from "react-native";
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
import { useJournal } from "@/src/contexts/JournalProvider";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { BlurView } from "expo-blur";
import Foundation from "@expo/vector-icons/Foundation";
import { observer } from "@legendapp/state/react";
import { uiStore$ } from "@/src/stores/UIStore";
import { SafeAreaFrameContext, SafeAreaView } from "react-native-safe-area-context";
import MenuButton from "@/src/components/shared/MenuButton";
import OverlayTextButton from "@/src/components/shared/OverlayTextButton";
import { imageEditStore$ } from "@/src/stores/ImageEditStore";
import { removeCanvasItem } from "@/src/services/Page";
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
const ImageMenu = observer(function ImageMenu() {
  // const { canvasHasChanges } = useCanvas();
  // const { editMode, bottomBarVisible } = useJournal();
  const displayCanvasMenu = uiStore$.displayCanvasMenu.get();
  const [selectedTab, setSelectedTab] = useState<BottomBarTab | null>(null); //(BottomBarTab.Background);
  const [showCancelDrawer, setShowCancelDrawer] = useState<boolean>(false);
  const handleExit = () => {
    if (selectedTab) setSelectedTab(null);
    // if (canvasHasChanges) {
    setShowCancelDrawer(true);
    // } else {
    // onExit();
    // }
  };

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
  //   const getSelectedTab = () => {
  //     switch (selectedTab) {
  //       case BottomBarTab.Background:
  //         return <BackgroundTab onSelect={handleSelect} />;
  //       case BottomBarTab.Sticker:
  //         return <StickerTab onSelect={handleSelect} />;
  //       case BottomBarTab.Template:
  //         return <TemplateTab onSelect={handleSelect} />;
  //       case BottomBarTab.Image:
  //         return <ImageTab onSelect={handleSelect} />;
  //       case BottomBarTab.Text:
  //         return <FontTab onSelect={handleSelect} />;
  //       default:
  //         return null;
  //     }
  //   };
  const handleBackground = () => {};
  const handleImage = () => {};
  const handleSticker = () => {};
  const { height, width } = Dimensions.get("screen");
  // const maxHeight = height * 0.66;
  const maxHeight = 400;
  const handleDelete = () => {
    const id = imageEditStore$.id.get();
    removeCanvasItem(id);
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayImageEditOverlay.set(false);
  };
  return (
    <StyledMotiView
      key="bottom-bar"
      className={`w-full px-4`}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 20 }}
      transition={{ type: "timing", duration: 100 }}>
      <StyledView className={`bg-black w-full rounded-[50px] z-10 flex-col`}>
        <AnimatePresence>
          {selectedTab && (
            <StyledMotiView
              key="bottom-bar-data"
              className="w-full"
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              exitTransition={{ type: "timing", duration: 300 }}
              transition={{ type: "timing", duration: 400 }}>
              {/* Tab content can go here */}
              <StyledView className="w-full bg-blue h-[500px]"></StyledView>
            </StyledMotiView>
          )}
        </AnimatePresence>

        {/* <StyledView className="w-full h-[75px] flex-row items-center justify-between  px-10"> */}
        <StyledView className="w-full h-[50px] flex-row items-center justify-center px-10">
          <CanvasBarButton
            onPress={handleDelete}
            buttonType={ButtonType.Trash}
            // selected={selectedTab === BottomBarTab.Template}
          />
          {/* <CanvasBarButton
            onPress={() => {}}
            buttonType={ButtonType.Template}
            selected={selectedTab === BottomBarTab.Template}
          />
          <CanvasBarButton
            onPress={() => {}}
            buttonType={ButtonType.Background}
            selected={selectedTab === BottomBarTab.Background}
          />
          <CanvasBarButton
            onPress={() => {}}
            buttonType={ButtonType.Image}
            selected={selectedTab === BottomBarTab.Image}
          />
          <CanvasBarButton
            onPress={() => {}}
            buttonType={ButtonType.Text}
            selected={selectedTab === BottomBarTab.Text}
          />
          <CanvasBarButton
            onPress={() => {}}
            buttonType={ButtonType.Sticker}
            selected={selectedTab === BottomBarTab.Sticker}
          /> */}
        </StyledView>
      </StyledView>
    </StyledMotiView>
  );
});

function CanvasBarButton({
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
      case "trash":
        return <StyledFeather name="trash" size={24} className={"text-red-500"} />;

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

export default ImageMenu;
