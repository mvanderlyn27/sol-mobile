import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasFrame } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Dimensions } from "react-native";
import BottomDrawer from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";

const StyledMotiView = styled(MotiView);
const StyledBottomDrawer = styled(BottomDrawer);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const { height } = Dimensions.get("window");
export default function RectangleButton({
  action,
  color,
  textColor,
  text,
}: {
  action: () => void;
  color: string;
  textColor: string;
  text: string;
}) {
  return (
    <StyledPressable
      onPress={action}
      className={`${color} px-7 py-3 rounded-full shadow-md flex justify-center items-center`}>
      <StyledText
        className={`${textColor ?? "text-white"} text-lg font-bold`}
        style={{ fontFamily: "PragmaticaExtended-light" }}>
        {text}
      </StyledText>
    </StyledPressable>
  );
}
