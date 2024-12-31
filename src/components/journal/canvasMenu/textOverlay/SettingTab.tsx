import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import Slider from "@react-native-assets/slider";
import { textStore$ } from "@/src/stores/EditTextStore";
import { observer } from "@legendapp/state/react";
import ColorPicker, {
  BrightnessSlider,
  HueSlider,
  SaturationSlider,
  Swatches,
  returnedResults,
} from "reanimated-color-picker";
import { debounce } from "lodash";

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Color options (you can add more colors as needed)
const colorOptions = ["#000", "#FFF", "#E03024", "#F27100", "#FFC300", "#55D87E", "#669bbc", "#967EEB"];

const SettingsTab = observer(function () {
  const size = textStore$.size.get();
  const color = textStore$.color.get() || "#000";
  const handleTextSizeChange = debounce((size: number) => {
    // onTextSizeChange(size); // Notify parent component of text size change
    textStore$.size.set(size);
  }, 0);

  const handleColorSelect = debounce((colors: returnedResults) => {
    // onColorChange(color); // Notify parent component of color selection

    textStore$.color.set(colors.hex);
  }, 100);
  return (
    <StyledView className="px-4 pt-2">
      {/* Text Size Slider */}
      {/* <StyledText className="text-lg  mb-2 text-white">
        Text Size: <Text style={{ fontWeight: "bold" }}>{size}px</Text>
      </StyledText> */}
      <ColorPicker
        value={color}
        onChange={handleColorSelect}
        style={{ width: "100%" }}
        boundedThumb
        thumbShape="circle"
        sliderThickness={5}
        thumbSize={26}
        thumbInnerStyle={{ borderWidth: 2, borderColor: "#e7dbcb" }}>
        <StyledView className="pt-3 pb-2">
          <Slider
            minimumValue={10}
            maximumValue={100}
            step={1}
            value={size}
            thumbTintColor={color}
            onValueChange={handleTextSizeChange}
            style={{ width: "100%", height: 10 }}
            maximumTrackTintColor="#fff"
            minimumTrackTintColor="#fff"
            thumbSize={26}
            trackHeight={5}
            thumbStyle={{ borderWidth: 2, borderColor: "#e7dbcb" }}
          />
        </StyledView>
        <StyledView className="py-3">
          <HueSlider />
        </StyledView>
        <StyledView className="py-3">
          <BrightnessSlider />
        </StyledView>
        <StyledView className="py-3">
          <SaturationSlider />
        </StyledView>
        <StyledView className="pt-3">
          <Swatches
            colors={colorOptions}
            swatchStyle={{ width: 30, height: 30, borderWidth: 2, borderColor: "#e7dbcb" }}
          />
        </StyledView>
      </ColorPicker>
      {/* Color Selector */}
      {/* <StyledView className="flex-row justify-center mt-2">
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
      </StyledView> */}
    </StyledView>
  );
});

export default SettingsTab;
