import { Show, observer } from "@legendapp/state/react";
import React, { memo, useEffect } from "react";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { pageStore$ } from "@/src/stores/PagesStore";
import { CanvasImage } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";
import { uiStore$ } from "@/src/stores/UIStore";
import { imageEditStore$ } from "@/src/stores/ImageEditStore";
import { bringToFront, updateCanvasItem } from "@/src/services/Page";
import { appState$ } from "@/src/stores/AppStore";

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);

const CanvasImageHolder = observer(function CanvasImageHolder({
  item,
  userItem,
  active,
}: {
  item: CanvasImage;
  userItem: boolean;
  active: boolean;
}) {
  const adjustedWidth = appState$.adjustedWidth.get();
  const adjustedHeight = appState$.adjustedHeight.get();
  const editMode = pageStore$.editMode.get() && userItem;

  // Convert percentage values to absolute positions and dimensions
  const offset = useSharedValue({
    x: item.x * adjustedWidth,
    y: item.y * adjustedHeight,
  });
  const start = useSharedValue({
    x: item.x * adjustedWidth,
    y: item.y * adjustedHeight,
  });
  const width = useSharedValue(item.width * adjustedWidth);
  const height = useSharedValue(item.height * adjustedHeight);
  const savedRotation = useSharedValue(item.rotation);
  const rotation = useSharedValue(item.rotation);

  useEffect(() => {
    offset.value = { x: item.x * adjustedWidth, y: item.y * adjustedHeight };
    start.value = { x: item.x * adjustedWidth, y: item.y * adjustedHeight };
    width.value = item.width * adjustedWidth;
    height.value = item.height * adjustedHeight;
    savedRotation.value = item.rotation;
    rotation.value = item.rotation;
  }, [item, adjustedWidth, adjustedHeight]);

  const animatedFrameGroupStyles = useAnimatedStyle(() => {
    return {
      width: width.value,
      height: height.value,
      transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
    };
  });

  const handleGestureStart = () => {
    if (!pageStore$.editMode) return;
    bringToFront(item.id);
  };

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
      runOnJS(updateCanvasItem)({
        ...item,
        width: width.value / adjustedWidth,
        height: height.value / adjustedHeight,
        rotation: rotation.value,
        x: start.value.x / adjustedWidth,
        y: start.value.y / adjustedHeight,
      });
    })
    .enabled(editMode);

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      width.value = item.width * adjustedWidth * event.scale;
      height.value = item.height * adjustedHeight * event.scale;
    })
    .onEnd(() => {
      runOnJS(updateCanvasItem)({
        ...item,
        width: width.value / adjustedWidth,
        height: height.value / adjustedHeight,
        rotation: rotation.value,
        x: start.value.x / adjustedWidth,
        y: start.value.y / adjustedHeight,
      });
    })
    .enabled(editMode);

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(updateCanvasItem)({
        ...item,
        rotation: rotation.value,
        width: width.value / adjustedWidth,
        height: height.value / adjustedHeight,
        x: start.value.x / adjustedWidth,
        y: start.value.y / adjustedHeight,
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
      <StyledMotiView
        style={[
          {
            position: "absolute",
            zIndex: item.z,
          },
          animatedFrameGroupStyles,
        ]}>
        <StyledPressable onPress={editMode ? handleEdit : null}>
          <StyledImage
            priority={active ? "high" : "low"}
            source={{ uri: item.path }}
            placeholder={{ blurhash: item.placeholder }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </StyledPressable>
      </StyledMotiView>
    </GestureDetector>
  );
});

export default CanvasImageHolder;
