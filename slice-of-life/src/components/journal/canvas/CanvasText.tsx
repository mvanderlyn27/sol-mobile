import React, { useState } from "react";
import { Text, TextInput, GestureResponderEvent, Dimensions } from "react-native";
import { styled } from "nativewind";
import { MotiView } from "moti";
import {
  PanGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { CanvasText } from "@/src/types/shared.types";

export const StyledMotiView = styled(MotiView);
export const StyledTextInput = styled(TextInput);
export const StyledText = styled(Text);
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
console.log("height/width", screenWidth, screenHeight);
export default function CanvasTextHolder({ item }: { item: CanvasText }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.textContent);
  const [position, setPosition] = useState({ x: item.xPercent * screenWidth, y: item.yPercent * screenHeight });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(item.rotation);
  console.log(item.xPercent, item.yPercent, item, position);

  const handleDrag = (event: PanGestureHandlerGestureEvent) => {
    setPosition({
      x: event.nativeEvent.translationX + item.xPercent * screenWidth,
      y: event.nativeEvent.translationY + item.yPercent * screenHeight,
    });
  };

  return (
    <GestureHandlerRootView>
      <RotationGestureHandler onGestureEvent={(event) => setRotation(event.nativeEvent.rotation)}>
        <PinchGestureHandler onGestureEvent={(event) => setScale(event.nativeEvent.scale)}>
          <PanGestureHandler onGestureEvent={handleDrag}>
            <StyledMotiView
              className="absolute"
              from={{ opacity: 0, scale: 0.8, rotate: `${item.rotation}deg` }}
              animate={{
                opacity: 1,
                scale: scale,
                rotate: `${rotation}deg`,
                translateX: position.x,
                translateY: position.y,
              }}
              transition={{ type: "timing", duration: 300 }}
              style={{ transform: [{ translateX: position.x }, { translateY: position.y }] }}>
              {isEditing ? (
                <StyledTextInput
                  className={`text-[${item.fontSize}px] text-[${item.fontColor}]`}
                  value={text}
                  onChangeText={setText}
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                />
              ) : (
                <StyledText
                  onPress={() => setIsEditing(true)}
                  className={`text-[${item.fontSize}px] text-[${item.fontColor}]`}>
                  {/* {text} */}
                  TEST HELLO TEST
                </StyledText>
              )}
            </StyledMotiView>
          </PanGestureHandler>
        </PinchGestureHandler>
      </RotationGestureHandler>
    </GestureHandlerRootView>
  );
}
