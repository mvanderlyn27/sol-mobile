import { useData } from "@/src/contexts/DataProvider";
import { CanvasFrame } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Image, Dimensions } from "react-native";

const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const { width, height } = Dimensions.get("window");

export default function EditCanvasFrame({
  item,
  onExit,
  onCancel,
}: {
  item: CanvasFrame;
  onExit: () => void;
  onCancel: () => void;
}) {
  //might need to recheck this math
  const aspectRatio = item.width / item.height;
  const maxFrameWidth = width * 0.8;
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

      {/* Button at the bottom */}
      <StyledMotiView className="absolute top-16  right-8">
        <StyledPressable onPress={onCancel} className="bg-clear px-4 py-2 rounded-md">
          <StyledText className="text-white">Done</StyledText>
        </StyledPressable>
      </StyledMotiView>
    </StyledMotiView>
  );
}
