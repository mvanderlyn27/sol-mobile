import React, { useState } from "react";
import { Text, TextInput, Dimensions } from "react-native";
import { styled } from "nativewind";
import { MotiView } from "moti";
import { CanvasText } from "@/src/types/shared.types";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { runOnJS } from "react-native-reanimated";
import { useJournal } from "@/src/contexts/JournalProvider";

export const StyledMotiView = styled(Animated.View); // Changed to Animated.View for proper reanimated styling
export const StyledTextInput = styled(TextInput);
export const StyledText = styled(Text);

export default function CanvasTextHolder({ item }: { item: CanvasText }) {
  const { updateCanvasItem } = useCanvas();
  const { setBottomBarVisible } = useJournal();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.textContent);
  const [fontSize, setFontSize] = useState(item.fontSize);
  const [fontColor, setFontColor] = useState(item.fontColor);
  const [fontFamily, setFontFamily] = useState(item.fontType);
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  //   Gesture to handle dragging
  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        x: start.value.x,
        y: start.value.y,
      });
    });

  // Gesture to handle pinch/zoom
  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(updateCanvasItem)(item.id, { ...item, scale: scale.value });
    });

  // Gesture to handle rotation
  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        rotation: rotation.value,
      });
    });

  // For testing, let's isolate the drag gesture first to make sure it works independently
  //   const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);
  const composed = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));
  // console.log(
  //   "width/height",
  //   width.value,
  //   height.value,
  //   "rotation",
  //   rotation.value,
  //   "scale",
  //   scale.value,
  //   "offset",
  //   offsetX.value,
  //   offsetY.value
  // );
  const handleEdit = () => {
    updateCanvasItem(item.id, item);
    setBottomBarVisible(false);
    setIsEditing(true);
  };
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
