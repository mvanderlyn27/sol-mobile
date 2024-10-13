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
  const { tempCanvas, updateCanvasItem, editCanvasItem } = useCanvas();
  const { editMode, setBottomBarVisible } = useJournal();
  // const zIndex = useSharedValue(item.z);
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
  const handleGestureStart = () => {
    if (!tempCanvas) {
      console.log("not editing shouldn't allow gestures ");
      return;
    }
    // console.log("text:", item.id, "canvas max z", tempCanvas.maxZIndex, "item z: ", item.z, "val: ", zIndex.value);
    updateCanvasItem(item.id, { ...item });
    // zIndex.value = tempCanvas.maxZIndex + 1; // Bring the current item to the top
  };

  //   Gesture to handle dragging
  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      runOnJS(handleGestureStart)(); // Call function to set zIndex
    })
    //need some way to keep track of z index lol
    // .onStart(() => {})
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
      scale.value = Math.max(savedScale.value * event.scale, 0.75);
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
    // updateCanvasItem(item.id, item);
    editCanvasItem(item.id);
    setBottomBarVisible(false);
  };

  return (
    <AnimatePresence>
      {/* {isEditing && (
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
      )} */}
      (
      <StyledMotiView
        // exit={{ opacity: 0 }}
        // from={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // transition={{ type: "timing", duration: 100 }}
        key={"frame-" + item.id}
        style={[animatedStyles, { position: "absolute" }]} // Added position: 'absolute' for proper placement
      >
        {editMode && (
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
        )}
        {!editMode && (
          <StyledText
            style={{
              fontFamily: item.fontType || "System",
              fontSize: item.fontSize,
              color: item.fontColor,
            }}>
            {item.textContent}
          </StyledText>
        )}
      </StyledMotiView>
      )
    </AnimatePresence>
  );
}
