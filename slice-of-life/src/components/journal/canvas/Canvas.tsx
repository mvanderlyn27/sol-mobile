import { styled } from "nativewind";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Canvas } from "@/src/types/shared.types";
import { Image } from "react-native";
import CanvasFrameHolder from "./CanvasFrame";
import CanvasTextHolder from "./CanvasText";
import { BG_04, getImageFromPath } from "@/src/assets/images/images";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

export default function CanvasHolder() {
  const { canvas, canvasLoading, addCanvasItem } = useCanvas();
  if (canvas.items.length === 0) {
    canvas.items.push({
      type: "text",
      xPercent: 0.5,
      yPercent: 0.5,
      rotation: 0,
      widthPercent: 0.5,
      aspectRatio: 1,
      textContent: "Hello World",
      fontSize: 20,
      fontColor: "#000000",
      id: "1",
    });
  }
  return (
    <StyledMotiView className="w-full h-full absolute top-0 bottom-0 right-0 left-0">
      <GestureHandlerRootView style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2 }}>
        {canvas.backgroundImage.type === "Local" && (
          <Image
            // maybe check if its a URL, or an enum, if its an enum we load locally, otherwise load from backend
            key="backgroundImage"
            source={getImageFromPath(canvas.backgroundImage.path)}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
            resizeMode="cover" // Use 'cover' to ensure it covers the whole area
          />
        )}

        {/* Render canvas items */}
        {canvas.items.map((item, index) => {
          if (item.type === "frame") {
            return <CanvasFrameHolder key={"frame-" + index} item={item} />;
          }

          if (item.type === "text") {
            return <CanvasTextHolder key={"text-" + index} item={item} />;
          }

          return null; // Return null if the type is unrecognized
        })}
      </GestureHandlerRootView>
    </StyledMotiView>
  );
}
