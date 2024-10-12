import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { CanvasText } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, Image, Button, TextInput } from "react-native";

const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

export default function EditCanvasText({ item }: { item: CanvasText }) {
  const { tempCanvas, saveCanvasItemEdits } = useCanvas();
  const { setBottomBarVisible } = useJournal();
  const [textInput, setTextInput] = React.useState(item.textContent);
  const handleDone = () => {
    //save changes
    //later on update more vals
    saveCanvasItemEdits(item.id, { ...item, textContent: textInput });
    setBottomBarVisible(true);
    //handle save
  };
  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 bg-black/80 z-[1000]">
      {/* Pressable background area */}
      {/* <Pressable style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} onPress={onExit} /> */}

      {/* Centered image */}
      <StyledMotiView className="flex-1 justify-center items-center">
        <StyledTextInput
          className="text-white"
          style={{
            fontFamily: item.fontType ?? "System",
            fontSize: item.fontSize,
            color: "white",
          }}
          onChangeText={setTextInput}
          autoFocus>
          {item.textContent}
        </StyledTextInput>
      </StyledMotiView>

      {/* Should probably add a way to change font/update color/ size */}
      {/* Button at the bottom */}
      <StyledMotiView className="absolute top-16  right-8">
        <StyledPressable onPress={handleDone} className="bg-clear px-4 py-2 rounded-md">
          <StyledText className="text-white">Done</StyledText>
        </StyledPressable>
      </StyledMotiView>
    </StyledMotiView>
  );
}
