import React from "react";
import { Image } from "react-native";
import { styled } from "nativewind";
import { AnimatePresence } from "moti";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { CanvasFrame } from "@/src/types/shared.types";

export const StyledMaskView = styled(MaskedView);
export const StyledMotiView = styled(Animated.View);
export const StyledImage = styled(Animated.Image);

export default function TestFrame({ item }: { item: CanvasFrame }) {
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(0);
  const imageOffset = useSharedValue({ x: item.slots[0].image.x, y: item.slots[0].image.y });
  const imageStart = useSharedValue({ x: item.slots[0].image.x, y: item.slots[0].image.y });
  const imageScale = useSharedValue(item.slots[0].image.scale);
  const imageSavedScale = useSharedValue(1);
  const imageRotation = useSharedValue(item.slots[0].image.rotation);
  const imageSavedRotation = useSharedValue(0);
  const centerX = item.width / 2;
  const centerY = item.height / 2;

  const focalPoint = useSharedValue({ x: 0, y: 0 });

  const animatedFrameGroupStyles = useAnimatedStyle(() => {
    const centerX = focalPoint.value.x;
    const centerY = focalPoint.value.y;

    return {
      zIndex: item.z,
      transform: [
        { translateX: offset.value.x }, // Initial translation from dragging
        { translateY: offset.value.y }, // Initial translation from dragging
        { translateX: centerX }, // Move to the gesture's focal point
        { translateY: centerY }, // Move to the gesture's focal point
        { scale: scale.value }, // Scale from the gesture's focal point
        { rotateZ: `${rotation.value}rad` }, // Rotate from the gesture's focal point
        { translateX: -centerX }, // Move back to the original position
        { translateY: -centerY }, // Move back to the original position
      ],
    };
  });

  const animatedImageStyles = useAnimatedStyle(() => ({
    width: item.slots[0].image.width,
    height: item.slots[0].image.height,
    top: item.slots[0].image.y,
    left: item.slots[0].image.x,
    transform: [
      //   { translateX: imageOffset.value.x },
      //   { translateY: imageOffset.value.y },
      { scale: imageScale.value },
      { rotateZ: `${imageRotation.value}rad` },
    ],
  }));

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin((event) => {
      //   focalPoint.value = { x: 0, y:  };
      //   focalPoint.value = { x: event.x, y: event.y }; // { x: item.width / 2, y: item.height / 2 };
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

      //   focalPoint.value = { x: item.width / 2, y: item.height / 2 };
    });
  // Gesture to handle pinch/zoom
  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      focalPoint.value = { x: event.focalX, y: event.focalY };
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      //   focalPoint.value = { x: item.width / 2, y: item.height / 2 };
      //   runOnJS(updateCanvasItem)(item.id, { ...item, scale: scale.value });
    });

  // Gesture to handle rotation
  const rotateGesture = Gesture.Rotation()
    .onBegin((event) => {
      focalPoint.value = { x: event.anchorX, y: event.anchorY };
    })
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      //   focalPoint.value = { x: item.width / 2, y: item.height / 2 };
      savedRotation.value = rotation.value;
      //   runOnJS(updateCanvasItem)(item.id, {
      // ...item,
      // rotation: rotation.value,
      //   });
    });

  const composed = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));

  return (
    <AnimatePresence>
      {/* Masked image with the slot */}
      <StyledMotiView style={[animatedFrameGroupStyles, { position: "absolute" }]}>
        <StyledMotiView className="absolute inset-0">
          <MaskedView
            maskElement={
              <StyledImage
                className={`w-[${item.width}px] h-[${item.height}px]`}
                source={{ uri: item.slots[0].maskPath }}
              />
            }>
            <StyledMotiView style={[[animatedImageStyles], { overflow: "hidden" }]}>
              <StyledImage className="flex-1" source={{ uri: item.slots[0].image.url }} />
            </StyledMotiView>
          </MaskedView>
        </StyledMotiView>

        {/* Frame image that goes on top of the masked image */}
        <GestureDetector gesture={composed}>
          <StyledMotiView className="absolute inset-0">
            <StyledMotiView className={`w-[${item.width}px] h-[${item.height}px]`}>
              <StyledImage className="flex-1" source={{ uri: item.path }} />
            </StyledMotiView>
          </StyledMotiView>
        </GestureDetector>
      </StyledMotiView>
    </AnimatePresence>
  );
}
