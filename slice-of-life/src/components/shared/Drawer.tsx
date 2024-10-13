import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasFrame } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Image, Dimensions } from "react-native";
import BottomDrawer from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";

const StyledMotiView = styled(MotiView);
const StyledBottomDrawer = styled(BottomDrawer);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const { height } = Dimensions.get("window");
export type DrawerButtonInput = {
  text: string;
  action: () => void;
  color?: string;
  textColor?: string;
};
export default function Drawer({ text, buttons }: { text: string; buttons: DrawerButtonInput[] }) {
  const renderDrawerContent = () => {
    buttons.map((item, index) => {
      <StyledPressable
        onPress={item.action}
        className={`${item.color} px-7 py-3 rounded-full shadow-md flex justify-center items-center`}>
        <StyledText className={`${item.textColor ?? "text-white"} text-lg font-bold`}>{item.text}</StyledText>
      </StyledPressable>;
    });
  };

  return (
    <StyledBottomDrawer openOnMount initialHeight={height * 0.2} className="bg-secondary">
      <StyledMotiView className="flex flex-col justify-center items-center gap-4 mb-4">
        <StyledText className="text-lg font-semibold text-gray-800">{text}</StyledText>
        <StyledMotiView className="flex flex-row justify-center items-center gap-4">
          {buttons.map((item, index) => {
            return (
              <StyledPressable
                key={index}
                onPress={item.action}
                className={`${item.color} px-7 py-3 rounded-full shadow-md flex justify-center items-center`}>
                <StyledText className="text-white text-lg font-bold">{item.text}</StyledText>
              </StyledPressable>
            );
          })}
        </StyledMotiView>
      </StyledMotiView>
    </StyledBottomDrawer>
  );
}
