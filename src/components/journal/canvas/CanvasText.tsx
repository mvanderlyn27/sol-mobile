import { Show, observer } from "@legendapp/state/react";
import React, { memo, useEffect } from "react";
import { Dimensions, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { pageStore$ } from "@/src/stores/PagesStore";
import { CanvasText } from "@/src/types/shared.types";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { textStore$ } from "@/src/stores/EditTextStore";
import { bringToFront, updateCanvasItem } from "@/src/services/Page";
import tinycolor from "tinycolor2"; // Use tinycolor2 for color manipulation

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);
export const StyledText = styled(MotiText);

const CanvasTextHolder = observer(function CanvasTextHolder({
  item,
  userItem,
  active,
}: {
  item: CanvasText;
  userItem: boolean;
  active: boolean;
}) {
  // console.log("text item", item);
  const editMode = pageStore$.editMode.get() && userItem;
  const offset = useSharedValue({ x: item.x, y: item.y });
  const start = useSharedValue({ x: item.x, y: item.y });
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(item.rotation);

  // Initialize shared value for font size instead of scale
  const fontSize = useSharedValue(item.fontSize);
  const savedFontSize = useSharedValue(item.fontSize);
  useEffect(() => {
    offset.value = { x: item.x, y: item.y };
    start.value = { x: item.x, y: item.y };
    fontSize.value = item.fontSize;
    savedFontSize.value = item.fontSize;
    savedRotation.value = item.rotation;
    rotation.value = item.rotation;
    // updatePageItem(item);
  }, [item]);

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: item.z,
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
  }));
  const animatedText = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
    lineHeight: fontSize.value * 1.2,
  }));
  const handleGestureStart = () => {
    if (!pageStore$.editMode) return; // Disable gestures if not in edit mode
    //we want to bring the item to front
    bringToFront(item.id);
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
      runOnJS(updateCanvasItem)({
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
      fontSize.value = Math.min(savedFontSize.value * event.scale, 100);
    })
    .onEnd(() => {
      savedFontSize.value = fontSize.value;
      runOnJS(updateCanvasItem)({
        ...item,
        fontSize: fontSize.value, // Save the new font size to the store
        rotation: rotation.value,
        x: start.value.x,
        y: start.value.y,
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
        fontSize: fontSize.value, // Save the new font size to the store
        x: start.value.x,
        y: start.value.y,
      });
    })
    .enabled(editMode);

  // Combine gestures
  const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);

  const handleEdit = () => {
    textStore$.editText(item.id);
  };
  const getBackgroundColor = (isSpace: boolean): string => {
    if (item.fontBackground === null || isSpace) {
      return "transparent";
    }
    if (item.fontBackground === "inversed") {
      return item.fontColor;
    }
    return item.fontBackgroundColor ? item.fontBackgroundColor : "transparent";
  };
  return (
    <StyledMotiView key={"text-" + item.id} style={[animatedStyles, { position: "absolute", paddingHorizontal: 10 }]}>
      <GestureDetector gesture={composed}>
        <StyledPressable onPress={editMode ? handleEdit : null}>
          <StyledText
            style={[
              animatedText,
              {
                fontFamily: item.fontType || "Calibri",
                textAlign: item.fontAlign || "left",
                color: item.fontColor,
                // backgroundColor: "transparent", // Ensure no global background
              },
            ]}>
            {item.textContent.split("").map((char, index) => {
              const isSpace = char === "\n";
              return (
                <StyledText
                  key={index}
                  style={[
                    // animatedText,
                    {
                      alignSelf: "flex-start",
                      textAlign: item.fontAlign || "left",
                      fontFamily: item.fontType || "Calibri",
                      color:
                        item.fontBackground !== "inversed"
                          ? item.fontColor
                          : item.fontBackgroundColor
                          ? item.fontBackgroundColor
                          : "#000",
                      backgroundColor: getBackgroundColor(isSpace),
                      paddingVertical: 0, // Prevent excessive padding that could cause space between lines
                      marginVertical: 0, // Remove margins that could push the background out of place
                    },
                  ]}>
                  {char}
                </StyledText>
              );
            })}
          </StyledText>
        </StyledPressable>
      </GestureDetector>
    </StyledMotiView>
  );
});

export default CanvasTextHolder;
