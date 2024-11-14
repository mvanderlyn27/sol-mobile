import { Show, observer } from "@legendapp/state/react";
import React from "react";
import { Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { canvasStore$, updateCanvasItem } from "@/src/stores/CanvasStore";
import { pageStore$ } from "@/src/stores/PagesStore";
import { CanvasImage } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";
import { uiStore$ } from "@/src/stores/UIStore";
import { imageEditStore$ } from "@/src/stores/ImageEditStore";

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);

const CanvasImageHolder = observer(function CanvasImageHolder({ item }: { item: CanvasImage }) {
  const editMode = pageStore$.editMode.get();

  // Initialize offset, start position, and rotation based on item properties
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const width = useSharedValue(item.width);
  const height = useSharedValue(item.height);
  const savedRotation = useSharedValue(item.rotation);
  const rotation = useSharedValue(item.rotation);

  const animatedFrameGroupStyles = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
    zIndex: item.z,
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
  }));
  const handleGestureStart = () => {
    if (!pageStore$.editMode) return; // Disable gestures if not in edit mode
    updateCanvasItem(item.id, { ...item });
  };
  // Define drag gesture for moving the item
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

  // Define zoom gesture for adjusting width and height
  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      width.value = item.width * event.scale;
      height.value = item.height * event.scale;
    })
    .onEnd(() => {
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        width: width.value,
        height: height.value,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  // Define rotation gesture for rotating the item
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

  const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);
  const handleEdit = () => {
    imageEditStore$.editImage(item.id);
    uiStore$.displayImageEditOverlay.set(true);
    uiStore$.displayCanvasMenu.set(false);
  };
  return (
    <GestureDetector gesture={composed}>
      <AnimatePresence>
        <StyledMotiView
          style={[
            {
              position: "absolute",
              transform: [{ translateX: item.x }, { translateY: item.y }, { rotateZ: `${item.rotation}rad` }],
            },
            animatedFrameGroupStyles,
          ]}>
          <StyledPressable onPress={editMode ? handleEdit : null}>
            <StyledImage source={{ uri: item.path }} style={{ width: "100%", height: "100%" }} contentFit="contain" />
          </StyledPressable>
        </StyledMotiView>
      </AnimatePresence>
    </GestureDetector>
  );
});

export default CanvasImageHolder;
