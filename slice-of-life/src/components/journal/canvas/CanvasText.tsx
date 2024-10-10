import React, { useState } from "react";
import { Text, TextInput, Dimensions } from "react-native";
import { styled } from "nativewind";
import { MotiView } from "moti";
import { CanvasText } from "@/src/types/shared.types";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

export const StyledMotiView = styled(Animated.View); // Changed to Animated.View for proper reanimated styling
export const StyledTextInput = styled(TextInput);
export const StyledText = styled(Text);

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CanvasTextHolder({ item }: { item: CanvasText }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.textContent);

  // Shared values for position, scale, and rotation
  const offsetX = useSharedValue(item.xPercent * screenWidth);
  const offsetY = useSharedValue(item.yPercent * screenHeight);
  const start = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  // Animated styles for transforming the text object
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  // Gesture to handle dragging
  const dragGesture = Gesture.Pan()
    .onBegin(() => {
      start.value = { x: offsetX.value, y: offsetY.value };
    })
    .onUpdate((e) => {
      offsetX.value = start.value.x + e.translationX;
      offsetY.value = start.value.y + e.translationY;
    })
    .onEnd(() => {
      start.value = { x: offsetX.value, y: offsetY.value };
    });

  // Gesture to handle pinch/zoom
  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Gesture to handle rotation
  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  // For testing, let's isolate the drag gesture first to make sure it works independently
  const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);

  return (
    <GestureDetector gesture={composed}>
      <StyledMotiView
        style={[animatedStyles, { position: "absolute" }]} // Added position: 'absolute' for proper placement
      >
        {isEditing ? (
          <StyledTextInput
            style={{ fontSize: item.fontSize, color: item.fontColor }}
            value={text}
            onChangeText={setText}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <StyledText onPress={() => setIsEditing(true)} style={{ fontSize: item.fontSize, color: item.fontColor }}>
            {text}
          </StyledText>
        )}
      </StyledMotiView>
    </GestureDetector>
  );
}
