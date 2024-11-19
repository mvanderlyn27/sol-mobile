import { Show, observer } from "@legendapp/state/react";
import React, { memo, useEffect, useState } from "react";
import { Dimensions, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { pageStore$ } from "@/src/stores/PagesStore";
import { CanvasReaction } from "@/src/types/shared.types";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { textStore$ } from "@/src/stores/EditTextStore";
import { reactStore$, updateReactItem } from "@/src/stores/ReactStore";

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);
export const StyledText = styled(MotiText);

const ReactItem = observer(function ReactItem({
  item,
  usersReaction,
}: {
  item: CanvasReaction;
  usersReaction?: boolean;
}) {
  console.log("react item updated", item, item.fontColor, item.x, item.y, item.rotation, item.z);
  const [gestureDone, setGestureDone] = useState(true);
  const editMode = (reactStore$.reactEditMode.get() && usersReaction) || false;
  const offset = useSharedValue({ x: item.x || 0, y: item.y || 0 });
  const start = useSharedValue({ x: item.x || 0, y: item.y || 0 });
  const rotation = useSharedValue(item.rotation || 0);
  const savedRotation = useSharedValue(item.rotation || 0);

  // Initialize shared value for font size instead of scale
  const fontSize = useSharedValue(item.fontSize || 16);
  const savedFontSize = useSharedValue(item.fontSize || 16);

  const { height, width } = Dimensions.get("screen");

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: item.z || 0,
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
  }));
  const animatedText = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));
  useEffect(() => {
    fontSize.value = item.fontSize;
    savedFontSize.value = item.fontSize;
  }, [item.fontSize]);
  const handleGestureStart = () => {
    if (editMode) updateReactItem(item.id, { ...item });
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
      runOnJS(updateReactItem)(item.id, {
        ...item,
        fontSize: fontSize.value, // Save the new font size to the store
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Adjust font size instead of scale
      fontSize.value = Math.min(savedFontSize.value * event.scale, 150);
    })
    .onEnd(() => {
      savedFontSize.value = fontSize.value;
      console.log("font size: ", fontSize.value);
      runOnJS(updateReactItem)(item.id, {
        ...item,
        fontSize: fontSize.value, // Save the new font size to the store
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
      });
      runOnJS(setGestureDone)(true);
    })
    .enabled(editMode);

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(updateReactItem)(item.id, {
        ...item,
        rotation: rotation.value,
        fontSize: fontSize.value, // Save the new font size to the store
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  // Combine gestures
  const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);

  const handleEdit = () => {
    console.log("test");
    textStore$.editReact(item.id);
  };

  return (
    <StyledMotiView
      key={"reaction-" + item.id}
      style={[animatedStyles, { position: "absolute" }]}
      pointerEvents={editMode ? "box-none" : "none"}>
      <GestureDetector gesture={composed}>
        <Pressable onPress={handleEdit}>
          <StyledText
            style={[
              animatedText,
              {
                fontFamily: item.fontType || "Inkfree",
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

export default ReactItem;
