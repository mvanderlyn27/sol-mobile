import { ButtonType } from "@/src/types/shared.types";
import React, { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { styled } from "nativewind";
import { AntDesign, MaterialIcons, MaterialCommunityIcons, Feather, Foundation, FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { getImageFromPath } from "@/src/assets/images/images";
import { Image } from "expo-image";
//<AntDesign name="closecircleo" size={24} color="black" />
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledFoundation = styled(Foundation);
const StyledAwesome = styled(FontAwesome);
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
        return <StyledMaterialCommunity name="content-save-outline" size={34} className="text-primary" />;
      case "image":
        return <StyledFeather name="image" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />;
      case "template":
        return <StyledFeather name="layout" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />;
      case "x":
        return <StyledAnt name="closecircleo" size={30} className="text-red-500" />;
      case "sticker":
        return <StyledAnt name="smile-circle" size={24} className="text-secondary" />;
      case "background":
        return <StyledFoundation name="page" size={24} className={"text-secondary"} />;
      case "settings":
        return <StyledFeather name="settings" size={24} className={"text-secondary"} />;
      case "trash":
        return <StyledFeather name="trash" size={24} className={"text-red-500"} />;
      case "text-center":
        return <StyledFeather name="align-center" size={24} className={"text-secondary"} />;
      case "text-left":
        return <StyledFeather name="align-left" size={24} className={"text-secondary"} />;
      case "text-right":
        return <StyledFeather name="align-right" size={24} className={"text-secondary"} />;
      case "text-size":
        return <StyledMaterialCommunity name="format-size" size={24} className={"text-gray-400"} />;
      case "text-background":
        return <StyledFoundation name="background-color" size={24} className={"text-secondary"} />;
      case "sliders":
        return (
          <Image
            source={getImageFromPath("color_wheel")}
            style={{ width: 30, height: 30, borderWidth: 2, borderColor: "#e7dbcb", borderRadius: 100 }}
          />
        );
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
