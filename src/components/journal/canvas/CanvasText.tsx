import { Show, observer } from "@legendapp/state/react";
import React from "react";
import { Dimensions, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { canvasStore$, updateCanvasItem } from "@/src/stores/CanvasStore";
import { pageStore$ } from "@/src/stores/PagesStore";
import { CanvasText } from "@/src/types/shared.types";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { textStore$ } from "@/src/stores/EditTextStore";

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);
export const StyledText = styled(MotiText);

const CanvasTextHolder = observer(function CanvasTextHolder({ item }: { item: CanvasText }) {
  console.log("text item updated", item.fontSize);
  const editMode = pageStore$.editMode.get();
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(item.rotation);

  // Initialize shared value for font size instead of scale
  const fontSize = useSharedValue(item.fontSize);
  const savedFontSize = useSharedValue(item.fontSize);

  const { height, width } = Dimensions.get("screen");

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: item.z,
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
  }));
  const animatedText = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  const handleGestureStart = () => {
    if (!pageStore$.editMode) return; // Disable gestures if not in edit mode
    updateCanvasItem(item.id, { ...item });
  };

  // Define gestures
  const dragGesture = Gesture.Pan()
    .onBegin(() => runOnJS(handleGestureStart)())
    .averageTouches(true)
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = { x: offset.value.x, y: offset.value.y };
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Adjust font size instead of scale
      fontSize.value = Math.min(savedFontSize.value * event.scale, 100);
    })
    .onEnd(() => {
      savedFontSize.value = fontSize.value;
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        fontSize: fontSize.value, // Save the new font size to the store
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  // Combine gestures
  const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);

  const handleEdit = () => {
    textStore$.editText(item.id);
  };

  return (
    <StyledMotiView key={"frame-" + item.id} style={[animatedStyles, { position: "absolute" }]}>
      <GestureDetector gesture={composed}>
        <Pressable onPress={handleEdit}>
          <StyledText
            style={[
              animatedText,
              {
                fontFamily: item.fontType || "Inkfree",
                // fontSize: fontSize.value, // Use the updated font size here
                color: item.fontColor,
              },
            ]}>
            {item.textContent}
          </StyledText>
        </Pressable>
      </GestureDetector>
    </StyledMotiView>
  );
});

export default CanvasTextHolder;
