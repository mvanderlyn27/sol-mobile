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
import { appState$ } from "@/src/services/AppStore";

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
  const { adjustedWidth, adjustedHeight } = appState$.get(); // Get adjusted width and height

  const editMode = pageStore$.editMode.get() && userItem;

  // Convert percentage values to absolute values
  const offset = useSharedValue({
    x: item.x * adjustedWidth,
    y: item.y * adjustedHeight,
  });

  const start = useSharedValue({
    x: item.x * adjustedWidth,
    y: item.y * adjustedHeight,
  });

  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(item.rotation);

  // Font size calculation based on adjustedHeight
  const fontSize = useSharedValue(item.fontSize * adjustedHeight);
  const savedFontSize = useSharedValue(item.fontSize * adjustedHeight);

  useEffect(() => {
    offset.value = {
      x: item.x * adjustedWidth,
      y: item.y * adjustedHeight,
    };
    start.value = {
      x: item.x * adjustedWidth,
      y: item.y * adjustedHeight,
    };
    fontSize.value = item.fontSize * adjustedHeight;
    savedFontSize.value = item.fontSize * adjustedHeight;
    savedRotation.value = item.rotation;
    rotation.value = item.rotation;
  }, [item, adjustedWidth, adjustedHeight]);

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: item.z,
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
  }));

  const animatedText = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
    lineHeight: fontSize.value * 1.1,
  }));

  const handleGestureStart = () => {
    if (!pageStore$.editMode) return; // Disable gestures if not in edit mode
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
        x: start.value.x / adjustedWidth, // Convert back to percentage
        y: start.value.y / adjustedHeight, // Convert back to percentage
        fontSize: fontSize.value / adjustedHeight, // Convert back to percentage
        rotation: rotation.value,
      });
    })
    .enabled(editMode);

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      fontSize.value = Math.min(savedFontSize.value * event.scale, 0.2 * adjustedHeight);
    })
    .onEnd(() => {
      savedFontSize.value = fontSize.value;
      runOnJS(updateCanvasItem)({
        ...item,
        fontSize: fontSize.value / adjustedHeight, // Convert back to percentage
        rotation: rotation.value,
        x: start.value.x / adjustedWidth, // Convert back to percentage
        y: start.value.y / adjustedHeight, // Convert back to percentage
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
        fontSize: fontSize.value / adjustedHeight, // Convert back to percentage
        x: start.value.x / adjustedWidth, // Convert back to percentage
        y: start.value.y / adjustedHeight, // Convert back to percentage
      });
    })
    .enabled(editMode);

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

  console.log("item", item, animatedStyles.transform);
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
              },
            ]}>
            {Array.from(item.textContent).map((char, index) => {
              const isSpace = char === "\n";
              return (
                <StyledText
                  key={index}
                  style={[
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
                      paddingVertical: 0,
                      marginVertical: 0,
                    },
                  ]}>
                  {char}
                </StyledText>
              );
            })}
          </StyledText>
          {/* <StyledText className="absolute bottom-0 left-0 text-xs text-red-500">
            {fontSize.value} {item.fontSize} {adjustedHeight}
          </StyledText> */}
        </StyledPressable>
      </GestureDetector>
    </StyledMotiView>
  );
});

export default CanvasTextHolder;
