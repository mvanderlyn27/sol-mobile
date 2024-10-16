import { useState } from "react";
import { ButtonType } from "@/src/types/shared.types";
import { Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { styled } from "nativewind";
import { MotiView } from "moti";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Button } from "@rneui/themed";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const StyledMotiView = styled(MotiView);
export const StyledIon = styled(Ionicons);
export const StyledAnt = styled(AntDesign);
export const StyledFA = styled(FontAwesome);
export const StyledMaterial = styled(MaterialIcons);
export default function RoundButton({
  onClick,
  buttonType,
  iconColor,
  backgroundColor,
  borderColor,
  primary,
  selected,
  disabled,
}: {
  onClick: () => void;
  buttonType: ButtonType;
  iconColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  primary?: boolean;
  selected?: boolean;
  disabled?: boolean;
}): JSX.Element {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200); // Reset the animation state after 200ms
    onClick(); // Trigger the passed click handler
  };

  const getButtonIcon = (buttonType: ButtonType) => {
    switch (buttonType) {
      case "menu":
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="menu" size={50} />;
      case "profile":
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="person" size={50} />;
      case "journal-check":
        return <StyledAnt className={`text-center ${getTextColor(buttonType)}`} name="checksquareo" size={50} />;
      case "journal-edit":
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="pencil" size={50} />;
      case "library":
        return <StyledFA className={`text-center ${getTextColor(buttonType)}`} name="book" size={50} />;
      case "share":
        return <StyledMaterial className={`text-center ${getTextColor(buttonType)}`} name="ios-share" size={50} />;
      case "x":
        return <StyledAnt className={`text-center ${getTextColor(buttonType)}`} name="close" size={50} />;
      case "settings":
        return (
          <Ionicons
            name="settings-outline"
            className={`text-center ${getTextColor(buttonType)}`}
            size={50}
            color="#E7DBCB"
          />
        );
      default:
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="menu" size={50} />;
    }
  };
  const getButtonColor = (buttonType: ButtonType) => {
    if (primary) {
      return "bg-primary";
    }
    if (disabled) {
      return "bg-disabled";
    }
    if (selected) {
      return "bg-darkPrimary";
    }
    if (backgroundColor) {
      return backgroundColor;
    }
    switch (buttonType) {
      case "settings": {
        return "bg-darkPrimary";
      }
      case "x": {
        return "bg-red-500";
      }
      default: {
        return "bg-secondary";
      }
    }
  };
  const getBorderColor = (buttonType: ButtonType) => {
    if (primary) {
      return "border-primary";
    }
    if (disabled) {
      return "border-disabled";
    }
    if (selected) {
      return "border-secondary";
    }
    if (borderColor) {
      return borderColor;
    }
    switch (buttonType) {
      case "settings": {
        return "border-secondary";
      }
      default: {
        return "border-darkPrimary";
      }
    }
  };
  const getTextColor = (buttonType: ButtonType) => {
    if (primary) {
      return "text-white";
    }
    if (disabled) {
      //might need to be white
      return "text-secondary";
    }
    if (selected) {
      return "text-secondary";
    }
    if (iconColor) {
      return iconColor;
    }
    switch (buttonType) {
      case "x": {
        return "text-white";
      }
      case "settings": {
        return "text-secondary";
      }
      default: {
        return "text-darkPrimary";
      }
    }
  };
  return (
    <Pressable onPress={disabled ? () => {} : handlePress}>
      <StyledMotiView
        className={` w-[70px] h-[70px] rounded-full ${getButtonColor(buttonType)} border-2 ${getBorderColor(
          buttonType
        )}  items-center justify-center`}
        from={{ scale: 1 }}
        animate={disabled ? {} : { scale: isPressed ? 1.2 : 1 }} // Scale up when pressed
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 150,
        }}>
        {getButtonIcon(buttonType)}
      </StyledMotiView>
    </Pressable>
  );
}
