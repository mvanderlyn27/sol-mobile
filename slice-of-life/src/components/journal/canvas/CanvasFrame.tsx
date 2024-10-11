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

export const StyledMotiView = styled(Animated.View); // Changed to Animated.View for proper reanimated styling
export const StyledTextInput = styled(TextInput);
export const StyledText = styled(Text);

export default function CanvasFrameHolder({ item }: { item: CanvasFrame }) {
  const { setBottomBarVisible } = useJournal();
  const { updateCanvasItem } = useCanvas();
  const [isEditing, setIsEditing] = useState(false);
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

  const composed = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));
  const handleCancel = () => {
    setIsEditing(false);
    setBottomBarVisible(true);
  };
  const handleExit = () => {
    setIsEditing(false);
    setBottomBarVisible(true);
  };
  const handleEdit = () => {
    updateCanvasItem(item.id, item);
    setBottomBarVisible(false);
    setIsEditing(true);
  };
  return (
    <AnimatePresence>
      <StyledMotiView
        key="edit"
        style={{ flex: 1, display: isEditing ? "flex" : "none" }} // Added position: 'absolute' for proper placement
      >
        <EditCanvasFrame item={item} onCancel={handleCancel} onExit={handleExit} />
      </StyledMotiView>
      <StyledMotiView
        key={"frame-" + item.id}
        style={[animatedStyles, { position: "absolute", display: isEditing ? "none" : "flex" }]} // Added position: 'absolute' for proper placement
      >
        <GestureDetector gesture={composed}>
          <Pressable onPress={handleEdit}>
            <Image
              source={{ uri: item.path }} // Replace with your image URL or source
              style={{ width: 150, height: 150, borderRadius: 10 }}
            />
          </Pressable>
        </GestureDetector>
      </StyledMotiView>
    </AnimatePresence>
  );
}
