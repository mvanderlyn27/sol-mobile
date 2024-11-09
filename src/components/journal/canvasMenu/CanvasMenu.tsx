import { View, Pressable, Dimensions, Text } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { BottomBarTab, BottomDrawerType, ButtonType, Canvas, ImageType } from "@/src/types/shared.types";
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
import { StyledPressable } from "../canvas/CanvasFrameHolder";
import { journalStore$ } from "@/src/stores/PagesStore";
import MenuButton from "@/src/components/shared/MenuButton";
import * as ImagePicker from "expo-image-picker";
import { imageEditStore$ } from "@/src/stores/ImageEditStore";
import RoundButton from "../../shared/CircleButton";
import { canvasStore$ } from "@/src/stores/CanvasStore";
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
const CanvasMenu = observer(function CanvasMenu() {
  // const { canvasHasChanges } = useCanvas();
  // const { editMode, bottomBarVisible } = useJournal();
  const displayCanvasMenu = uiStore$.displayCanvasMenu.get();
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
  const handleSave = () => {
    handleClose();
  };
  const handleClose = () => {
    journalStore$.editMode.set(false);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayJournalMenu.set(true);
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
  const backgrounds = ["bg_01", "bg_02", "bg_03", "bg_04", "bg_05", "bg_06", "bg_07", "bg_08", "bg_09"];
  let curIndex = 1;
  console.log("canvas", canvasStore$.curCanvas.get());
  const curBackground = canvasStore$.curCanvas.get()?.backgroundImage?.path;
  if (curBackground) {
    curIndex = backgrounds.indexOf(curBackground);
  }
  const handleBackground = () => {
    const curCanvas = canvasStore$.curCanvas.get();
    console.log("canvas before", curCanvas);
    canvasStore$.curCanvas.set({
      ...curCanvas,
      backgroundImage: { type: ImageType.Local, path: backgrounds[(curIndex + 1) % backgrounds.length] },
    } as Canvas);
    console.log("canvas", canvasStore$.curCanvas.get()?.backgroundImage);
  };
  const handleImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      imageEditStore$.selectedImage.set(result.assets[0].uri);
      uiStore$.displayCanvasMenu.set(false);
      uiStore$.displayImageEditOverlay.set(true);
    }
  };
  const handleSticker = () => {};
  return (
    <StyledView className="flex-1" pointerEvents="box-none">
      <StyledMotiView
        className="absolute top-2 right-8 left-8 flex-row items-center justify-center"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 200 }}
        transition={{ type: "timing", duration: 200 }}>
        <StyledView className="flex-1 items-start">
          <MenuButton onPress={journalStore$.cancelEdit} buttonType={ButtonType.X} />
        </StyledView>
        <StyledView className="flex-1 items-end">
          <MenuButton onPress={journalStore$.saveEdit} buttonType={ButtonType.Save} />
        </StyledView>
      </StyledMotiView>
      <StyledMotiView
        className="absolute bottom-4 right-8 left-8 flex-row items-center justify-center"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        exitTransition={{ type: "timing", duration: 200 }}
        transition={{ type: "timing", duration: 200 }}>
        <StyledView className="flex-1 items-center">
          <RoundButton selected onClick={handleBackground} buttonType={ButtonType.Background} />
        </StyledView>
        <StyledView className="flex-1 items-center">
          <RoundButton
            selected
            onClick={function (): void {
              throw new Error("Function not implemented.");
            }}
            buttonType={ButtonType.Image}
          />
        </StyledView>
        <StyledView className="flex-1 items-center">
          <RoundButton
            selected
            onClick={function (): void {
              throw new Error("Function not implemented.");
            }}
            buttonType={ButtonType.Text}
          />
        </StyledView>
      </StyledMotiView>
    </StyledView>
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

export default CanvasMenu;
