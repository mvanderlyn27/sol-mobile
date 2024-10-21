import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasFrame } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Dimensions } from "react-native";
import BottomDrawer from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";
import RectangleButton from "./RectangleButton";

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
export default function Drawer({
  text,
  buttons,
  onClose,
}: {
  text: string;
  buttons: DrawerButtonInput[];
  onClose: () => void;
}) {
  return (
    <StyledBottomDrawer
      onClose={onClose}
      onBackdropPress={onClose}
      onBackPress={onClose}
      openOnMount
      initialHeight={height * 0.2}
      customStyles={{ container: { backgroundColor: "#E7DBCB" }, handle: { backgroundColor: "#262326" } }}>
      <StyledMotiView className="flex flex-col justify-center items-center gap-4 mb-4">
        <StyledText className="text-lg font-semibold text-darkPriamry" style={{ fontFamily: "PragmaticaExtended" }}>
          {text}
        </StyledText>
        <StyledMotiView className="w-full flex flex-row justify-center items-center gap-4">
          {buttons.map((item, index) => (
            <StyledMotiView key={index} className="mx-4">
              <RectangleButton
                key={"drawer-button-" + index}
                text={item.text}
                color={item.color ?? "bg-red-500"}
                textColor={item.textColor ?? "text-white"}
                action={item.action}
              />
            </StyledMotiView>
          ))}
        </StyledMotiView>
      </StyledMotiView>
    </StyledBottomDrawer>
  );
}
