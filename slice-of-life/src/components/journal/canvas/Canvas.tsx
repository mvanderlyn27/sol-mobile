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

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

export default function CanvasHolder() {
  const { canvas, startEdit, exitEdit, saveCanvas, canvasLoading, addCanvasItem } = useCanvas();

  return (
    <StyledMotiView className=" absolute top-0 bottom-0 right-0 left-0">
      {/*  <StyledMotiView className="flex-1 "> */}
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
    </StyledMotiView>
  );
}
