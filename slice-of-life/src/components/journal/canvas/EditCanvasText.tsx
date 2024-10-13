import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasText } from "@/src/types/shared.types";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import Ionicons from "@expo/vector-icons/Ionicons";
import Drawer from "../../shared/Drawer";
import { useState } from "react";

const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledIon = styled(Ionicons);

export default function EditCanvasText({ item }: { item: CanvasText }) {
  const { saveCanvasItemEdits, exitEditCanvasItem, removeCanvasItem, exitEditCanvas } = useCanvas();
  const { setBottomBarVisible } = useJournal();
  const [textInput, setTextInput] = useState(item.textContent);
  const [updatedFontSize, setUpdatedFontSize] = useState(item.fontSize);
  const [updatedFontColor, setUpdatedFontColor] = useState(item.fontColor);
  const [showBottomDrawer, setShowBottomDrawer] = useState(false);

  // List of colors for the color picker
  const colors = ["#FFF", "#F99603", "#E7DBCB", "#262326", "#1E90FF", "#FF4500"];

  const handleDone = () => {
    // Save changes to the canvas item
    saveCanvasItemEdits(item.id, {
      ...item,
      textContent: textInput,
      fontSize: updatedFontSize,
      fontColor: updatedFontColor,
    });
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
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 bg-black/80 z-[1000]">
      {/* Centered text input and slider */}
      <StyledMotiView className="flex-1 justify-center items-center">
        <StyledMotiView className="flex-col justify-center items-center">
          <StyledMotiView className="justify-center items-center">
            <StyledTextInput
              className="text-white"
              style={{
                fontFamily: item.fontType ?? "System",
                fontSize: updatedFontSize,
                color: updatedFontColor,
              }}
              onChangeText={setTextInput}
              autoFocus
              value={textInput}
            />
          </StyledMotiView>

          {/* Slider to adjust font size */}
          <StyledMotiView>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={10}
              maximumValue={200}
              minimumTrackTintColor={updatedFontColor}
              thumbTintColor={updatedFontColor}
              maximumTrackTintColor="#000000"
              onValueChange={setUpdatedFontSize}
              value={updatedFontSize}
            />
          </StyledMotiView>

          {/* Color picker row */}
          <StyledMotiView className="flex-row mt-4 space-x-2">
            {colors.map((color) => (
              <StyledPressable
                key={color}
                onPress={() => setUpdatedFontColor(color)}
                style={{
                  backgroundColor: color,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  borderWidth: updatedFontColor === color ? 4 : 1,
                  borderColor: "#F0F0F0",
                }}
              />
            ))}
          </StyledMotiView>
        </StyledMotiView>
      </StyledMotiView>
      <StyledMotiView className="absolute top-16  left-8">
        <StyledPressable onPress={startDelete} className="bg-clear px-4 py-2 rounded-md">
          <StyledIon name="trash-outline" size={30} className="text-red-500" />
        </StyledPressable>
      </StyledMotiView>
      {/* Done button at the top-right */}
      <StyledMotiView className="absolute top-16 right-8">
        <StyledPressable onPress={handleDone} className="bg-clear px-4 py-2 rounded-md">
          <StyledText className="text-white">Done</StyledText>
        </StyledPressable>
      </StyledMotiView>
      {showBottomDrawer && (
        <Drawer
          key="edit-text-drawer"
          text={"Are you sure you want to delete?"}
          buttons={[{ action: handleDelete, text: "Yep, Delete it!", color: "bg-red-500" }]}
        />
      )}
    </StyledMotiView>
  );
}
