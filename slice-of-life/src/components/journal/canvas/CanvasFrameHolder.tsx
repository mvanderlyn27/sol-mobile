import React, { useEffect } from "react";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { AnimatePresence } from "moti";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { CanvasFrame } from "@/src/types/shared.types";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { useData } from "@/src/contexts/DataProvider";

export const StyledMaskedView = styled(MaskedView);
export const StyledMotiView = styled(Animated.View);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);

export default function CanvasFrameHolder({ item }: { item: CanvasFrame }) {
  // console.log("frame item", item);
  const { selectedDate } = useData();
  const { editMode, setBottomBarVisible } = useJournal();
  const { editCanvasItem, canvas, tempCanvas, updateCanvasItem } = useCanvas();
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
  useEffect(() => {
    offset.value = { x: item.x, y: item.y };
    start.value = { x: item.x, y: item.y };
    scale.value = item.scale;
    savedScale.value = item.scale;
    rotation.value = item.rotation;
    savedRotation.value = item.rotation;

    // Trigger a re-render to update the UI immediately
    runOnJS(() => {
      console.log("lol", item.x, item.y);
    })();
  }, [item, canvas]);

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
        scale: scale.value,
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

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
      runOnJS(updateCanvasItem)(item.id, {
        ...item,
        scale: scale.value,
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

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
        scale: scale.value,
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  const composed = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));
  const handleEdit = () => {
    //add something related to the canvasprovider here
    console.log("edit clicked");
    editCanvasItem(item.id);
    setBottomBarVisible(false);
  };
  return (
    <>
      {editMode && (
        <GestureDetector gesture={composed}>
          <StyledMotiView key={item.id} style={[animatedFrameGroupStyles, { position: "absolute" }]}>
            <StyledMaskedView
              className="w-full h-full"
              maskElement={
                <StyledImage
                  //   className={`w-[${item.width}px] h-[${item.height}px]`}
                  className="flex-1"
                  source={{ uri: item.slots[0].maskPath }}
                />
              }>
              {item?.slots[0]?.image?.url && <StyledImage className="flex-1" source={item.slots[0].image.url} />}
            </StyledMaskedView>
            <StyledMotiView className="absolute inset-0 w-full h-full">
              <StyledPressable className="flex-1" onPress={editMode ? handleEdit : null}>
                <StyledMotiView className={`flex-1`}>
                  <StyledImage className="flex-1" source={{ uri: item.path }} />
                </StyledMotiView>
              </StyledPressable>
            </StyledMotiView>
          </StyledMotiView>
        </GestureDetector>
      )}
      {!editMode && (
        <StyledMotiView
          style={{
            position: "absolute",
            zIndex: item.z,
            width: item.width * item.scale,
            height: item.height * item.scale,
            transform: [
              { translateX: item.x }, // Initial translation from dragging
              { translateY: item.y }, // Initial translation from dragging
              { rotateZ: `${item.rotation}rad` }, // Rotate from the gesture's focal point
            ],
          }}>
          <StyledMaskedView
            className="w-full h-full"
            maskElement={<StyledImage className="flex-1" source={{ uri: item.slots[0].maskPath }} />}>
            {item?.slots[0]?.image?.url && <StyledImage className="flex-1" source={item.slots[0].image.url} />}
          </StyledMaskedView>
          <StyledMotiView className="absolute inset-0 w-full h-full">
            <StyledPressable className="flex-1" onPress={editMode ? handleEdit : null}>
              <StyledMotiView className={`flex-1`}>
                <StyledImage className="flex-1" source={{ uri: item.path }} />
              </StyledMotiView>
            </StyledPressable>
          </StyledMotiView>
        </StyledMotiView>
      )}
    </>
  );
}
