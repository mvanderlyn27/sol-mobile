import { Show, observer } from "@legendapp/state/react";
import React from "react";
import { Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { bringToFront, canvasStore$, updateCanvasItem } from "@/src/stores/CanvasStore";
import { journalStore$ } from "@/src/stores/PagesStore";
import { CanvasImage } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);

const CanvasImageHolder = observer(function CanvasImageHolder({ item }: { item: CanvasImage }) {
  const editMode = journalStore$.editMode.get();
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(item.rotation);

  const animatedFrameGroupStyles = useAnimatedStyle(() => ({
    width: item.width, // Render to item width
    height: item.height, // Render to item height
    zIndex: item.z,
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  const handleGestureStart = () => {
    if (!journalStore$.editMode) return; // Disable gestures if not in edit mode
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
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        scale: scale.value,
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
  return (
    <GestureDetector gesture={composed}>
      <AnimatePresence>
        <StyledMotiView
          style={[
            {
              position: "absolute",
              width: item.width * item.scale,
              height: item.height * item.scale,
              transform: [{ translateX: item.x }, { translateY: item.y }, { rotateZ: `${item.rotation}rad` }],
            },
            animatedFrameGroupStyles,
          ]}>
          <StyledImage source={{ uri: item.path }} style={{ width: "100%", height: "100%" }} contentFit="contain" />
        </StyledMotiView>
      </AnimatePresence>
    </GestureDetector>
  );
});

export default CanvasImageHolder;
