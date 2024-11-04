import { ButtonType } from "@/src/types/shared.types";
import React, { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { styled } from "nativewind";
import { AntDesign, MaterialIcons, MaterialCommunityIcons, Feather, Foundation } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
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
// const { canvasHasChanges } = useCanvas();
// const { editMode, bottomBarVisible } = useJournal();
export default function MenuButton({
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
