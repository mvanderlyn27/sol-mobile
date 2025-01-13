import { Show, observer } from "@legendapp/state/react";
import React, { memo, useEffect, useState } from "react";
import { Dimensions, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { CanvasTextReaction } from "@/src/types/shared.types";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { textStore$ } from "@/src/stores/EditTextStore";
import { reactStore$ } from "@/src/stores/ReactStore";
import { bringReactionToFront, updateReactionItem } from "@/src/services/Reaction";
import { appState$ } from "@/src/services/AppStore";

export const StyledMotiView = styled(MotiView);
export const StyledImage = styled(Image);
export const StyledPressable = styled(Pressable);
export const StyledText = styled(MotiText);

const ReactItem = observer(function ReactItem({
  item,
  usersReaction,
}: {
  item: CanvasTextReaction;
  usersReaction?: boolean;
}) {
  const [gestureDone, setGestureDone] = useState(true);
  const editMode = (reactStore$.reactEditMode.get() && usersReaction) || false;

  const adjustedWidth = appState$.adjustedWidth.get();
  const adjustedHeight = appState$.adjustedHeight.get();

  const offset = useSharedValue({ x: item.x * adjustedWidth, y: item.y * adjustedHeight });
  const start = useSharedValue({ x: item.x * adjustedWidth, y: item.y * adjustedHeight });
  const rotation = useSharedValue(item.rotation || 0);
  const savedRotation = useSharedValue(item.rotation || 0);

  const fontSize = useSharedValue(item.fontSize * adjustedHeight);
  const savedFontSize = useSharedValue(item.fontSize * adjustedHeight);

  useEffect(() => {
    offset.value = { x: item.x * adjustedWidth, y: item.y * adjustedHeight };
    start.value = { x: item.x * adjustedWidth, y: item.y * adjustedHeight };
    fontSize.value = item.fontSize * adjustedHeight;
    savedFontSize.value = item.fontSize * adjustedHeight;
    savedRotation.value = item.rotation;
    rotation.value = item.rotation;
  }, [item, adjustedWidth, adjustedHeight]);

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: item.z || 0,
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { rotateZ: `${rotation.value}rad` }],
  }));

  const animatedText = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  const handleGestureStart = () => {
    if (editMode) bringReactionToFront(item.id);
  };

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
      runOnJS(updateReactionItem)({
        ...item,
        fontSize: fontSize.value / adjustedHeight,
        rotation: rotation.value,
        x: start.value.x / adjustedWidth,
        y: start.value.y / adjustedHeight,
      });
    })
    .enabled(editMode);

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      fontSize.value = Math.min(savedFontSize.value * event.scale, 0.2 * adjustedHeight);
    })
    .onEnd(() => {
      savedFontSize.value = fontSize.value;
      runOnJS(updateReactionItem)({
        ...item,
        fontSize: fontSize.value / adjustedHeight,
        rotation: rotation.value,
        x: start.value.x / adjustedWidth,
        y: start.value.y / adjustedHeight,
      });
      runOnJS(setGestureDone)(true);
    })
    .enabled(editMode);

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(updateReactionItem)({
        ...item,
        rotation: rotation.value,
        fontSize: fontSize.value / adjustedHeight,
        x: start.value.x / adjustedWidth,
        y: start.value.y / adjustedHeight,
      });
    })
    .enabled(editMode);

  const composed = Gesture.Simultaneous(dragGesture, zoomGesture, rotateGesture);

  const handleEdit = () => {
    textStore$.editTextReact(item.id);
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
  const alignContent = () => {
    switch (item.fontAlign) {
      case "center":
        return "center";
      case "right":
        return "flex-end";
      default:
        return "flex-start";
    }
  };
  return (
    <StyledMotiView
      key={"text-" + item.id}
      style={[animatedStyles, { position: "absolute", paddingHorizontal: 10 }]}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "timing", duration: 100 }}>
      <GestureDetector gesture={composed}>
        <StyledPressable onPress={editMode ? handleEdit : null}>
          {/* <StyledMotiView>
            {Array.from(item.textContent.split("\n")).map((line, index) => {
              return (
                <StyledText
                  key={index}
                  style={[
                    animatedText,
                    {
                      textAlign: item.fontAlign || "left",
                      fontFamily: item.fontType || "Calibri",
                      color:
                        item.fontBackground !== "inversed"
                          ? item.fontColor
                          : item.fontBackgroundColor
                          ? item.fontBackgroundColor
                          : "#000",
                      backgroundColor: getBackgroundColor(false),
                      alignSelf: alignContent(),
                    },
                  ]}>
                  {line}
                </StyledText>
              );
            })}
          </StyledMotiView> */}
          <StyledText
            className="p-2"
            style={[
              animatedText,
              {
                textAlign: item.fontAlign || "left",
                fontFamily: item.fontType || "Calibri",
                color:
                  item.fontBackground !== "inversed"
                    ? item.fontColor
                    : item.fontBackgroundColor
                    ? item.fontBackgroundColor
                    : "#000",
                backgroundColor: getBackgroundColor(false),
              },
            ]}>
            {item.textContent}
          </StyledText>
          {/* <StyledText className="absolute bottom-0 left-0 text-xs text-red-500">
          {fontSize.value} {item.fontSize} {adjustedHeight}
        </StyledText> */}
        </StyledPressable>
      </GestureDetector>
    </StyledMotiView>
  );
});

export default ReactItem;
