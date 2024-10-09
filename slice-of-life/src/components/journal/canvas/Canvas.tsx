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
  const { canvas, canvasLoading, addCanvasItem } = useCanvas();
  return (
    <StyledMotiView className="w-full h-full absolute inset-0 bg-slate-200 z-[-1]">
      {canvas.backgroundImage.type === "Local" && (
        <Image
          // maybe check if its a URL, or an enum, if its an enum we load locally, otherwise load from backend
          key="backgroundImage"
          source={getImageFromPath(canvas.backgroundImage.path)}
          style={{ position: "absolute", width: "100%", height: "100%", zIndex: -1 }}
          resizeMode="cover" // Use 'cover' to ensure it covers the whole area
        />
      )}
      {/* Render canvas items */}
      {canvas.items.map((item, index) => {
        // console.log(item, index);
        if (item.type === "frame") {
          console.log("frame found");
          return <CanvasFrameHolder key={index + ""} item={item} />;
        }

        if (item.type === "text") {
          console.log("text found");
          return <CanvasTextHolder key={index + ""} item={item} />;
        }

        return null; // Return null if the type is unrecognized
      })}
    </StyledMotiView>
  );
}
