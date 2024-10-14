import React from "react";
import { Image } from "react-native";
import { styled } from "nativewind";
import { AnimatePresence } from "moti";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { CanvasFrame } from "@/src/types/shared.types";

export const StyledMaskedView = styled(MaskedView);
export const StyledMotiView = styled(Animated.View);
export const StyledImage = styled(Animated.Image);

export default function TestFrame({ item }: { item: CanvasFrame }) {
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(0);
  //   const imageOffset = useSharedValue({ x: item.slots[0].image.x, y: item.slots[0].image.y });
  //   const imageStart = useSharedValue({ x: item.slots[0].image.x, y: item.slots[0].image.y });
  //   const imageScale = useSharedValue(item.slots[0].image.scale);
  //   const imageSavedScale = useSharedValue(1);
  //   const imageRotation = useSharedValue(item.slots[0].image.rotation);
  //   const imageSavedRotation = useSharedValue(0);

  const animatedFrameGroupStyles = useAnimatedStyle(() => {
    return {
      zIndex: item.z,
      width: item.width,
      height: item.height,
      transform: [
        { translateX: offset.value.x }, // Initial translation from dragging
        { translateY: offset.value.y }, // Initial translation from dragging
        { scale: scale.value }, // Scale from the gesture's focal point
        { rotateZ: `${rotation.value}rad` }, // Rotate from the gesture's focal point
      ],
    };
  });

  //   const animatedImageStyles = useAnimatedStyle(() => ({
  //     width: item.width,
  //     // width: item.slots[0].image.width,
  //     height: item.height,
  //     // height: item.slots[0].image.height,
  //     top: item.slots[0].image.y,
  //     left: item.slots[0].image.x,
  //     transform: [
  //       //   { translateX: imageOffset.value.x },
  //       //   { translateY: imageOffset.value.y },
  //       { scale: imageScale.value },
  //       { rotateZ: `${imageRotation.value}rad` },
  //     ],
  //   }));

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
    });
  // Gesture to handle pinch/zoom
  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {})
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Gesture to handle rotation
  const rotateGesture = Gesture.Rotation()
    .onBegin((event) => {})
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));

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
            <StyledImage className="flex-1" source={{ uri: item.slots[0].image.url }} />
          </StyledMaskedView>

          {/* Frame image that goes on top of the masked image */}
          <StyledMotiView className="absolute inset-0 w-full h-full">
            <StyledMotiView className={`flex-1`}>
              <StyledImage className="flex-1" source={{ uri: item.path }} />
            </StyledMotiView>
          </StyledMotiView>
        </StyledMotiView>
      </GestureDetector>
    </AnimatePresence>
  );
}
/*
  let item: CanvasFrame = {
    id: 1,
    type: "frame",
    dbId: 1,
    path: "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Film_01.png",
    width: 200,
    height: 200,
    rotation: 0,
    scale: 1,
    x: 0,
    y: 0,
    z: 0,
    slots: [
      {
        maskPath:
          "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Film_01_Mask.png",
        image: {
          url: "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/sign/book_photos/1/33/party.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJib29rX3Bob3Rvcy8xLzMzL3BhcnR5LmpwZyIsImlhdCI6MTcyODg1MjUyNCwiZXhwIjoxNzI5NDU3MzI0fQ.xOCp9MKQGYGd2uf90ApS6jc9E7xNI2p4FEj_AFov_Qw&t=2024-10-13T20%3A48%3A44.611Z",
          width: 100,
          height: 100,
          scale: 1,
          rotation: 0,
          x: 0,
          y: 0,
        },
      },
    ],
  };
  */
