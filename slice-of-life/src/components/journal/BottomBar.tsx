import { View, Pressable } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { ButtonType } from "@/src/types/shared.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
//<MaterialIcons name="text-fields" size={24} color="black" />
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// <MaterialCommunityIcons name="content-save-outline" size={24} color="black" />
import Feather from "@expo/vector-icons/Feather";
//<Feather name="image" size={24} color="black" />
//<Feather name="layout" size={24} color="black" />
import AntDesign from "@expo/vector-icons/AntDesign";
//<AntDesign name="closecircleo" size={24} color="black" />
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
export default function BottomBar({
  editMode,
  onExit,
  onSave,
}: {
  editMode: boolean;
  onExit: () => void;
  onSave: () => void;
}) {
  const handleTemplate = () => {};
  const handleFrame = () => {};
  const handleText = () => {};
  return (
    <AnimatePresence>
      {editMode && (
        <StyledMotiView
          className=" absolute bottom-6 right-2 left-2 p-8 flex-row justify-between items-center bg-black/60 rounded-xl"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 20 }}
          exitTransition={{ type: "timing", duration: 200 }}
          transition={{ type: "timing", duration: 200 }}>
          <BottomBarButton onPress={onExit} buttonType={ButtonType.X} />
          <BottomBarButton onPress={handleTemplate} buttonType={ButtonType.Template} />
          <BottomBarButton onPress={handleFrame} buttonType={ButtonType.Frame} />
          <BottomBarButton onPress={handleText} buttonType={ButtonType.Text} />
          <BottomBarButton onPress={onSave} buttonType={ButtonType.Save} />
        </StyledMotiView>
      )}
    </AnimatePresence>
  );
}

function BottomBarButton({
  onPress,
  disabled = false,
  buttonType,
}: {
  onPress: () => void;
  disabled?: boolean;
  buttonType: ButtonType;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const getButtonIcon = () => {
    switch (buttonType) {
      case "text":
        return <StyledMaterial name="text-fields" size={24} color="black" />;
      case "save":
        return <StyledMaterialCommunity name="content-save-outline" size={24} color="black" />;
      case "frame":
        return <StyledFeather name="image" size={24} color="black" />;
      case "template":
        return <StyledFeather name="layout" size={24} color="black" />;
      case "x":
        return <StyledAnt name="closecircleo" size={24} color="black" />;

      default:
        return null;
    }
  };
  const getButtonColor = () => {
    switch (buttonType) {
      default:
        return "bg-white";
    }
  };

  return (
    <Pressable onPress={disabled ? () => {} : onPress}>
      <StyledMotiView
        className={` w-[30px] h-[30px] rounded-full ${getButtonColor()} items-center justify-center`}
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
