import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasFrame } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Image, Dimensions } from "react-native";
import BottomDrawer, { BottomDrawerMethods } from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import Drawer from "../../shared/Drawer";

const StyledMotiView = styled(MotiView);
const StyledBottomDrawer = styled(BottomDrawer);
const StyledText = styled(Text);
const StyledIon = styled(Ionicons);
const StyledPressable = styled(Pressable);
const { width, height } = Dimensions.get("window");

export default function EditCanvasFrame({ item }: { item: CanvasFrame }) {
  //might need to recheck this math
  const bottomDrawerRef = useRef<BottomDrawerMethods>(null);
  const { saveCanvasItemEdits, exitEditCanvas, removeCanvasItem, exitEditCanvasItem } = useCanvas();
  const { setBottomBarVisible } = useJournal();
  const aspectRatio = item.width / item.height;
  const maxFrameWidth = width * 0.8;
  const [showBottomDrawer, setShowBottomDrawer] = useState(false);
  const handleDone = () => {
    saveCanvasItemEdits(item.id, { ...item });
    setBottomBarVisible(true);
  };
  const startDelete = () => {
    setShowBottomDrawer(true);
  };
  const handleDelete = () => {
    exitEditCanvasItem();
    removeCanvasItem(item.id);
    setShowBottomDrawer(false);
    setBottomBarVisible(true);
  };
  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 bg-black/80">
      {/* Pressable background area */}
      {/* <Pressable style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} onPress={onExit} /> */}

      {/* Centered image */}
      <StyledMotiView className="flex-1 justify-center items-center">
        <Image
          source={{ uri: item.path }} // Replace with your image URL or source
          style={{ width: maxFrameWidth, height: maxFrameWidth / aspectRatio, borderRadius: 10 }}
        />
      </StyledMotiView>

      <StyledMotiView className="absolute top-16  left-8">
        <StyledPressable onPress={startDelete} className="bg-clear px-4 py-2 rounded-md">
          <StyledIon name="trash-outline" size={30} className="text-red-500" />
        </StyledPressable>
      </StyledMotiView>

      {/* Button at the bottom */}
      <StyledMotiView className="absolute top-16  right-8">
        <StyledPressable onPress={handleDone} className="bg-clear px-4 py-2 rounded-md">
          <StyledText className="text-white text-lg">Done</StyledText>
        </StyledPressable>
      </StyledMotiView>
      {showBottomDrawer && (
        <Drawer
          key="edit-frame-bottom-drawer"
          text={"Are you sure you want to delete?"}
          buttons={[{ action: handleDelete, text: "Yep, Delete it!", color: "bg-red-500" }]}
        />
      )}
    </StyledMotiView>
  );
}
