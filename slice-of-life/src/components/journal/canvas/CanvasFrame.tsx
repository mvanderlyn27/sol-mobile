import React, { useState } from "react";
import { Text, TextInput, Image, Pressable } from "react-native";
import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import { CanvasFrame, CanvasText } from "@/src/types/shared.types";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { runOnJS } from "react-native-reanimated";
import EditCanvasFrame from "./EditCanvasFrame";
import { useJournal } from "@/src/contexts/JournalProvider";

export const StyledMotiView = styled(MotiView); // Changed to Animated.View for proper reanimated styling
export const StyledTextInput = styled(TextInput);
export const StyledText = styled(Text);

export default function CanvasFrameHolder({ item }: { item: CanvasFrame }) {
  const { editMode, setBottomBarVisible } = useJournal();
  const { tempCanvas, updateCanvasItem, editCanvasItem } = useCanvas();
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      zIndex: item.z,
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  //   Gesture to handle dragging
  const handleGestureStart = () => {
    if (!tempCanvas) {
      console.log("not editing shouldn't allow gestures ");
      return;
    }
    updateCanvasItem(item.id, { ...item });
  };

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      runOnJS(handleGestureStart)(); // Call function to set zIndex
    })
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
    .onBegin(() => {
      runOnJS(handleGestureStart)(); // Call function to set zIndex
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(updateCanvasItem)(item.id, { ...item, scale: scale.value });
    });

  // Gesture to handle rotation
  const rotateGesture = Gesture.Rotation()
    .onBegin(() => {
      runOnJS(handleGestureStart)(); // Call function to set zIndex
    })
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

  const composed = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));
  const handleCancel = () => {
    setBottomBarVisible(true);
  };
  const handleExit = () => {
    setBottomBarVisible(true);
  };
  const handleEdit = () => {
    //add something related to the canvasprovider here
    // updateCanvasItem(item.id, item);
    editCanvasItem(item.id);
    setBottomBarVisible(false);
  };
  return (
    <AnimatePresence>
      (
      <StyledMotiView
        // exit={{ opacity: 0 }}
        // from={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // transition={{ type: "timing", duration: 300 }}
        key={"frame-" + item.id}
        style={[animatedStyles, { position: "absolute" }]} // Added position: 'absolute' for proper placement
      >
        {editMode && (
          <GestureDetector gesture={composed}>
            <Pressable onPress={handleEdit}>
              <Image
                source={{ uri: item.path }} // Replace with your image URL or source
                style={{ width: 150, height: 150, borderRadius: 10 }}
              />
            </Pressable>
          </GestureDetector>
        )}
        {!editMode && (
          <Image
            source={{ uri: item.path }} // Replace with your image URL or source
            style={{ width: 150, height: 150, borderRadius: 10 }}
          />
        )}
      </StyledMotiView>
      )
    </AnimatePresence>
  );
}
