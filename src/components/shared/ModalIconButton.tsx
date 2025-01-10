import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, ButtonType, CanvasFrame } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Dimensions } from "react-native";
import BottomDrawer from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";
import Feather from "@expo/vector-icons/Feather";
import { FontAwesome } from "@expo/vector-icons";

const StyledMotiView = styled(MotiView);
const StyledBottomDrawer = styled(BottomDrawer);
const StyledText = styled(Text);
const StyledFeather = styled(Feather);
const StyledPressable = styled(Pressable);
const StyledFontAwesome = styled(FontAwesome);
const { height } = Dimensions.get("window");
export default function ModalIconButton({
  disabled,
  action,
  color,
  textColor,
  text,
  buttonType,
}: {
  action?: () => void;
  disabled?: boolean;
  color?: string;
  textColor?: string;
  text?: string;
  buttonType: ButtonType;
}) {
  console.log("buttonType", buttonType);
  const getIconType = () => {
    console.log("button type", buttonType);
    switch (buttonType) {
      case "createGroup":
        return <StyledFeather name="plus" size={20} className={`${textColor ?? "text-white"} px-2`} />;
      case "joinGroup":
        return <StyledFontAwesome name="group" size={20} className={`${textColor ?? "text-white"} px-2`} />;
      default:
        return <StyledFeather name="plus" size={20} className={`${textColor ?? "text-white"} px-2`} />;
    }
  };
  return (
    <StyledPressable
      disabled={disabled}
      onPress={action}
      className={`${
        disabled ? "bg-disabled" : color
      } flex-1 mx-1  py-3 rounded-xl shadow-md flex-row justify-start items-center`}>
      {getIconType()}
      <StyledText
        className={`${textColor ?? "text-white"} text-xs font-bold`}
        style={{ fontFamily: "PragmaticaExtended-light" }}>
        {text}
      </StyledText>
    </StyledPressable>
  );
}
