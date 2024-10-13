import React from "react";
import { Image, Pressable, View } from "react-native";
import { styled } from "nativewind";
import { AnimatePresence } from "moti";
import { CanvasFrame } from "@/src/types/shared.types";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import Svg, { Mask, Rect, Image as SvgImage, Defs } from "react-native-svg";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";

export const StyledMotiView = styled(Animated.View);

export default function CanvasFrameHolder({ item }: { item: CanvasFrame }) {
  const { editMode, setBottomBarVisible } = useJournal();
  const { tempCanvas, updateCanvasItem, editCanvasItem } = useCanvas();

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
      console.log("Not in edit mode, gesture shouldn't be allowed.");
      return;
    }
    updateCanvasItem(item.id, { ...item });
  };

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      runOnJS(handleGestureStart)();
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

  const zoomGesture = Gesture.Pinch()
    .onBegin(() => {
      runOnJS(handleGestureStart)();
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(updateCanvasItem)(item.id, { ...item, scale: scale.value });
    });

  const rotateGesture = Gesture.Rotation()
    .onBegin(() => {
      runOnJS(handleGestureStart)();
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

  const composedGesture = Gesture.Simultaneous(dragGesture, Gesture.Simultaneous(zoomGesture, rotateGesture));

  const handleEdit = () => {
    editCanvasItem(item.id);
    setBottomBarVisible(false);
  };

  return (
    <AnimatePresence>
      <StyledMotiView key={`frame-${item.id}`} style={[animatedStyles, { position: "absolute" }]}>
        {editMode ? (
          <GestureDetector gesture={composedGesture}>
            <Pressable onPress={handleEdit}>
              <View style={{ width: 150, height: 150 }}>
                <Svg height="100%" width="100%">
                  <Defs>
                    <Mask id="frame-mask" x="0" y="0" width="100%" height="100%">
                      {/* Use the existing frame image as the mask */}
                      <SvgImage href={item.path} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                    </Mask>
                  </Defs>
                  {/* New image that will be masked by the existing frame */}
                  <SvgImage
                    href="https://t3.ftcdn.net/jpg/02/87/35/70/360_F_287357045_Ib0oYOxhotdjOEHi0vkggpZTQCsz0r19.jpg" // Replace with your new image URL
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid slice"
                    mask="url(#frame-mask)" // Apply the mask
                  />
                </Svg>
              </View>
            </Pressable>
          </GestureDetector>
        ) : (
          <View style={{ width: 150, height: 150 }}>
            <Svg height="100%" width="100%">
              <Defs>
                <Mask id="frame-mask" x="0" y="0" width="100%" height="100%">
                  <SvgImage href={item.path} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </Mask>
              </Defs>
              <SvgImage
                href="https://t3.ftcdn.net/jpg/02/87/35/70/360_F_287357045_Ib0oYOxhotdjOEHi0vkggpZTQCsz0r19.jpg" // Replace with your new image URL
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                mask="url(#frame-mask)"
              />
            </Svg>
          </View>
        )}
      </StyledMotiView>
    </AnimatePresence>
  );
}
