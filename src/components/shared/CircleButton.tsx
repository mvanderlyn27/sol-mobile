import { useState } from "react";
import { ButtonType } from "@/src/types/shared.types";
import { Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { styled } from "nativewind";
import { MotiView } from "moti";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export const StyledMotiView = styled(MotiView);
export const StyledIon = styled(Ionicons);
export const StyledAnt = styled(AntDesign);
export const StyledFA = styled(FontAwesome);
export const StyledMaterial = styled(MaterialIcons);
const StyledFeather = styled(Feather);
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
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="menu" size={40} />;
      case "profile":
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="person" size={40} />;
      case "journal-check":
        return <StyledAnt className={`text-center ${getTextColor(buttonType)}`} name="checksquareo" size={50} />;
      case "journal-edit":
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="pencil" size={40} />;
      case "library":
        return <StyledFA className={`text-center ${getTextColor(buttonType)}`} name="book" size={40} />;
      case "share":
        return <StyledMaterial className={`text-center ${getTextColor(buttonType)}`} name="ios-share" size={40} />;
      case "tutorial":
        return <StyledAnt className={`text-center ${getTextColor(buttonType)}`} name="infocirlceo" size={40} />;
      case "x":
        return <StyledAnt className={`text-center ${getTextColor(buttonType)}`} name="close" size={40} />;
      case "edit":
        return <StyledFeather className={`text-center ${getTextColor(buttonType)}`} name="edit-2" size={40} />;
      case "react":
        return <StyledFA className={`text-center ${getTextColor(buttonType)}`} name="comment-o" size={40} />;
      case "view":
        return <StyledAnt className={`text-center ${getTextColor(buttonType)}`} name="eyeo" size={40} />;
      case "background":
        return <StyledMaterial name="wallpaper" className={`text-center ${getTextColor(buttonType)}`} size={40} />;
      case "image":
        return <StyledFeather name="image" className={`text-center ${getTextColor(buttonType)}`} size={40} />;
      case "text":
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="text" size={40} />;
      case "settings":
        return (
          <Ionicons
            name="settings-outline"
            className={`text-center ${getTextColor(buttonType)}`}
            size={40}
            color="#E7DBCB"
          />
        );
      default:
        return <StyledIon className={`text-center ${getTextColor(buttonType)}`} name="menu" size={40} />;
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
