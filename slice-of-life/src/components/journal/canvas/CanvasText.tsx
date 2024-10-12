import React, { useState } from "react";
import { Text, TextInput, Dimensions, Pressable } from "react-native";
import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import { CanvasText } from "@/src/types/shared.types";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { runOnJS } from "react-native-reanimated";
import { useJournal } from "@/src/contexts/JournalProvider";
import EditCanvasText from "./EditCanvasText";
import EditCanvasFrame from "./EditCanvasFrame";

export const StyledMotiView = styled(MotiView);
export const StyledTextInput = styled(TextInput);
export const StyledText = styled(Text);

export default function CanvasTextHolder({ item }: { item: CanvasText }) {
  const { updateCanvasItem } = useCanvas();
  const { setBottomBarVisible } = useJournal();
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
    setIsEditing(true);
    updateCanvasItem(item.id, item);
    setBottomBarVisible(false);
  };

  return (
    <AnimatePresence>
      {isEditing && (
        <StyledMotiView
          exit={{ opacity: 0 }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
          key="edit"
          style={{ flex: 1 }} // Added position: 'absolute' for proper placement
        >
          <EditCanvasText item={item} onCancel={handleCancel} onExit={handleExit} />
        </StyledMotiView>
      )}
      {!isEditing && (
        <StyledMotiView
          exit={{ opacity: 0 }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
          key={"frame-" + item.id}
          style={[animatedStyles, { position: "absolute" }]} // Added position: 'absolute' for proper placement
        >
          <GestureDetector gesture={composed}>
            <Pressable onPress={handleEdit}>
              <StyledText
                style={{
                  fontFamily: item.fontType || "System",
                  fontSize: item.fontSize,
                  color: item.fontColor,
                }}>
                {item.textContent}
              </StyledText>
            </Pressable>
          </GestureDetector>
        </StyledMotiView>
      )}
    </AnimatePresence>
  );
}
