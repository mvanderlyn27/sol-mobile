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
import MenuButton from "@/src/components/shared/MenuButton";
import { ButtonType } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";
import { Keyboard } from "react-native";

// Styled components
const StyledView = styled(View);
const StyledMotiView = styled(MotiView);
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
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const handleColorSelect = debounce((colors: returnedResults) => {
    // onColorChange(color); // Notify parent component of color selection

    textStore$.color.set(colors.hex);
  }, 100);
  const handleColorSliderClick = () => {
    if (isColorPickerOpen) {
      setIsColorPickerOpen(false);
      return;
    }
    Keyboard.dismiss();
    setIsColorPickerOpen(true);
  };
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
        thumbSize={20}
        thumbInnerStyle={{ borderWidth: 2, borderColor: "#e7dbcb" }}>
        <StyledView className="pt-3 flex-row items-center justify-center">
          <StyledView className="flex-none">
            <MenuButton disabled onPress={() => console.log("slider")} buttonType={ButtonType.TextSize} />
          </StyledView>

          <StyledView className="flex-1">
            <Slider
              minimumValue={10}
              maximumValue={100}
              step={1}
              value={size}
              thumbTintColor={color}
              onValueChange={handleTextSizeChange}
              style={{ width: "100%", height: 10 }}
              maximumTrackTintColor="#e7dbcb"
              minimumTrackTintColor="#e7dbcb"
              thumbSize={26}
              trackHeight={5}
              thumbStyle={{ borderWidth: 2, borderColor: "#e7dbcb" }}
            />
          </StyledView>
        </StyledView>

        <StyledView className="py-3 flex-row items-start justify-center">
          <StyledView className="flex-none">
            <MenuButton onPress={() => handleColorSliderClick()} buttonType={ButtonType.Sliders} />
          </StyledView>

          <StyledView className="flex-1">
            <Swatches
              colors={colorOptions}
              swatchStyle={{ width: 26, height: 26, borderWidth: 2, borderColor: "#e7dbcb" }}
              style={{ alignItems: "center" }}
            />
            <AnimatePresence>
              {isColorPickerOpen && (
                <StyledMotiView
                  className=" pt-2"
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "timing", duration: 300 }}>
                  <StyledView className="py-3">
                    <HueSlider />
                  </StyledView>
                  <StyledView className="py-3">
                    <BrightnessSlider />
                  </StyledView>
                  <StyledView className="py-3">
                    <SaturationSlider />
                  </StyledView>
                </StyledMotiView>
              )}
            </AnimatePresence>
          </StyledView>
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
