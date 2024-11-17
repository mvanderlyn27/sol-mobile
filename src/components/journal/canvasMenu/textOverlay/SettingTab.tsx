import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import Slider from "@react-native-community/slider";
import { textStore$ } from "@/src/stores/EditTextStore";
import { observer } from "@legendapp/state/react";

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Color options (you can add more colors as needed)
const colorOptions = ["#FFF", "#000", "#fdf0d5", "#c1121f", "#FFC300", "#669bbc"];

const SettingsTab = observer(function () {
  const size = textStore$.size.get();
  const color = textStore$.color.get() || "#fff";
  const handleTextSizeChange = (size: number) => {
    // onTextSizeChange(size); // Notify parent component of text size change
    textStore$.size.set(size);
  };

  const handleColorSelect = (color: string) => {
    // onColorChange(color); // Notify parent component of color selection
    textStore$.color.set(color);
  };

  return (
    <StyledView className="p-4">
      {/* Text Size Slider */}
      <StyledText className="text-lg  mb-2 text-white">
        Text Size: <Text style={{ fontWeight: "bold" }}>{size}px</Text>
      </StyledText>
      <Slider
        minimumValue={10}
        maximumValue={150}
        step={1}
        value={size}
        onValueChange={handleTextSizeChange}
        style={{ width: "100%", height: 40 }}
      />

      <StyledView className="flex-row justify-center mt-2">
        {colorOptions.map((color) => (
          <StyledTouchableOpacity
            key={color}
            onPress={() => handleColorSelect(color)}
            className={`w-10 h-10 rounded-full m-2 ${
              color === color ? "border-4 border-secondary" : "border-2 border-secondary"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </StyledView>
    </StyledView>
  );
});

export default SettingsTab;
