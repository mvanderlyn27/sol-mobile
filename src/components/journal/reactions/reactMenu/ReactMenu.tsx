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
import { useJournal } from "@/src/contexts/JournalProvider";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { BlurView } from "expo-blur";
import Foundation from "@expo/vector-icons/Foundation";
import { observer } from "@legendapp/state/react";
import { uiStore$ } from "@/src/stores/UIStore";
import { SafeAreaFrameContext, SafeAreaView } from "react-native-safe-area-context";
import { handlePageCancel, handlePageSave, pageStore$ } from "@/src/stores/PagesStore";
import MenuButton from "@/src/components/shared/MenuButton";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { imageEditStore$ } from "@/src/stores/ImageEditStore";
import { addCanvasItem, canvasStore$ } from "@/src/stores/CanvasStore";
import { generateId } from "@/src/stores/AsyncStorage";
import RoundButton from "@/src/components/shared/CircleButton";
import UserPic from "@/src/components/shared/UserPic";
import { cancelReacts, editReactStore$, reactStore$, saveReacts } from "@/src/stores/ReactStore";
import { textStore$ } from "@/src/stores/EditTextStore";
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
const StyledPressable = styled(Pressable);
const ReactMenu = observer(function ReactMenu() {
  const handleSaveReact = () => {
    saveReacts();
  };
  const handleCancelReact = () => {
    cancelReacts();
  };

  const curUser = pageStore$.members[pageStore$.curRow.get()].get();
  const handleReact = () => {
    uiStore$.displayReactOverlay.set(true);
    uiStore$.displayReactMenu.set(false);
    textStore$.reset();
    reactStore$.reactEditMode.set(true);
  };
  const handleViewReact = () => {
    editReactStore$.showNonUserReactions.toggle();
  };
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
          <MenuButton onPress={handleCancelReact} buttonType={ButtonType.X} />
        </StyledView>
        <StyledView className="flex-1 items-end">
          <MenuButton onPress={handleSaveReact} buttonType={ButtonType.Save} />
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
          <UserPic userId={curUser.user_id} largeView />
        </StyledView>
        <StyledView className="flex-1 items-center">
          <RoundButton selected onClick={handleReact} buttonType={ButtonType.Add} primary />
        </StyledView>
        <StyledView className="flex-1 items-center">
          <RoundButton selected onClick={handleViewReact} buttonType={ButtonType.View} />
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

export default ReactMenu;
