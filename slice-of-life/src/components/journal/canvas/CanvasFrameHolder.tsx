import React from "react";
import { Image, Pressable } from "react-native";
import { styled } from "nativewind";
import { AnimatePresence } from "moti";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { CanvasFrame } from "@/src/types/shared.types";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";

export const StyledMaskedView = styled(MaskedView);
export const StyledMotiView = styled(Animated.View);
export const StyledImage = styled(Animated.Image);
export const StyledPressable = styled(Pressable);

export default function CanvasFrameHolder({ item }: { item: CanvasFrame }) {
  const { editMode, setBottomBarVisible } = useJournal();
  const { editCanvasItem, tempCanvas, updateCanvasItem } = useCanvas();
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(0);

  const animatedFrameGroupStyles = useAnimatedStyle(() => {
    const scaledWidth = item.width * scale.value;
    const scaledHeight = item.height * scale.value;

    return {
      zIndex: item.z,
      width: scaledWidth,
      height: scaledHeight,
      transform: [
        { translateX: offset.value.x }, // Initial translation from dragging
        { translateY: offset.value.y }, // Initial translation from dragging
        // { scale: scale.value }, // Scale from the gesture's focal point
        { rotateZ: `${rotation.value}rad` }, // Rotate from the gesture's focal point
      ],
    };
  });

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
  const handleEdit = () => {
    //add something related to the canvasprovider here
    console.log("edit clicked");
    editCanvasItem(item.id);
    setBottomBarVisible(false);
  };
  return (
    <AnimatePresence>
      {/* Masked image with the slot */}
      <GestureDetector gesture={composed}>
        <StyledMotiView style={[animatedFrameGroupStyles, { position: "absolute" }]}>
          <StyledMaskedView
            className="w-full h-full"
            maskElement={
              <StyledImage
                //   className={`w-[${item.width}px] h-[${item.height}px]`}
                className="flex-1"
                source={{ uri: item.slots[0].maskPath }}
              />
            }>
            {item?.slots[0]?.image?.url && <StyledImage className="flex-1" source={{ uri: item.slots[0].image.url }} />}
          </StyledMaskedView>

          {/* Frame image that goes on top of the masked image */}
          <StyledMotiView className="absolute inset-0 w-full h-full">
            <StyledPressable className="flex-1" onPress={handleEdit}>
              <StyledMotiView className={`flex-1`}>
                <StyledImage className="flex-1" source={{ uri: item.path }} />
              </StyledMotiView>
            </StyledPressable>
          </StyledMotiView>
        </StyledMotiView>
      </GestureDetector>
    </AnimatePresence>
  );
}
