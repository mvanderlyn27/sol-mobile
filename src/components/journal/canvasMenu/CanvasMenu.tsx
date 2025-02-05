import { View, Pressable, Dimensions, Text } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { BottomBarTab, BottomDrawerType, ButtonType, Canvas, CanvasImage, ImageType } from "@/src/types/shared.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
//<MaterialIcons name="text-fields" size={24} color="black" />
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// <MaterialCommunityIcons name="content-save-outline" size={24} color="black" />
import Feather from "@expo/vector-icons/Feather";
//<Feather name="image" size={24} color="black" />
//<Feather name="layout" size={24} color="black" />
import AntDesign from "@expo/vector-icons/AntDesign";
import Foundation from "@expo/vector-icons/Foundation";
import { observer } from "@legendapp/state/react";
import { uiStore$ } from "@/src/stores/UIStore";
import { pageStore$ } from "@/src/stores/PagesStore";
import MenuButton from "@/src/components/shared/MenuButton";
import * as ImagePicker from "expo-image-picker";
import RoundButton from "../../shared/CircleButton";
import { generateId } from "@/src/stores/AsyncStorage";
import { reactStore$ } from "@/src/stores/ReactStore";
import { addCanvasItem, changeBackground, handleCancel, handleSave } from "@/src/services/Page";
import { appState$ } from "@/src/stores/AppStore";
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledFoundation = styled(Foundation);
const { width, height } = Dimensions.get("window");
const CanvasMenu = observer(function CanvasMenu() {
  const [selectedTab, setSelectedTab] = useState<BottomBarTab | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [canceling, setCanceling] = useState<boolean>(false);
  const handleExit = () => {
    if (selectedTab) setSelectedTab(null);
    // if (canvasHasChanges) {
    // } else {
    // onExit();
    // }
  };
  const handleCanvasSave = () => {
    if (saving) return;
    setSaving(true);
    reactStore$.showReactions.set(true);
    handleSave();
    setSaving(false);
  };
  const handleCancelEdit = () => {
    if (canceling) return;
    setCanceling(true);
    handleCancel();
    setCanceling(false);
  };
  const handleDrawerSave = () => {
    // onSave();
    if (selectedTab) setSelectedTab(null);
    // onExit();
  };
  const handleDrawerExit = () => {
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
    uiStore$.displayTextOverlay.set(true);
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
  const handleBackground = () => {
    changeBackground();
  };
  const resizeImage = (uri: string, originalWidth: number, originalHeight: number) => {
    //ensure image is max the size of the screen
    // Get screen dimensions

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    const newWidth = Math.min(width, originalWidth);
    const newHeight = newWidth / aspectRatio;
    return { width: newWidth, height: newHeight };
  };
  const handleImage = async () => {
    // No permissions request is necessary for launching the image library
    pageStore$.loading.set(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // base64: false,
      // quality: 0,
      // allowsEditing: true,
      // aspect: [4, 3],
      // preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
    });

    if (!result.canceled) {
      // imageEditStore$.selectedImage.set(result.assets[0].uri);
      const imgWidth = result.assets[0].width;
      const imgHeight = result.assets[0].height;
      const { width: newWidth, height: newHeight } = resizeImage(result.assets[0].uri, imgWidth, imgHeight);
      console.log("w/h", newWidth, newHeight);
      const id = generateId();
      const image: CanvasImage = {
        id: id,
        path: result.assets[0].uri,
        x: 0.1,
        y: 0.1,
        z: 0,
        width: newWidth / appState$.adjustedWidth.get(),
        // width: imgWidth,
        height: newHeight / appState$.adjustedHeight.get(),
        // height: imgHeight,
        rotation: 0,
        type: "image",
      };

      addCanvasItem(image);
      // uiStore$.displayCanvasMenu.set(false);
      // uiStore$.displayImageEditOverlay.set(true);
    }
    pageStore$.loading.set(false);
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
          <MenuButton disabled={saving || canceling} onPress={handleCancelEdit} buttonType={ButtonType.X} />
        </StyledView>
        <StyledView className="flex-1 items-end">
          <MenuButton disabled={canceling || saving} onPress={handleCanvasSave} buttonType={ButtonType.Save} />
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
          <RoundButton selected onClick={handleImage} buttonType={ButtonType.Image} />
        </StyledView>
        <StyledView className="flex-1 items-center">
          <RoundButton selected onClick={handleText} buttonType={ButtonType.Text} />
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
