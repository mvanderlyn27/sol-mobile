import { styled } from "nativewind";
import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import { Canvas } from "@/src/types/shared.types";
import { Image } from "react-native";
import CanvasFrameHolder from "./CanvasFrame";
import CanvasTextHolder from "./CanvasText";
import { getImageFromPath } from "@/src/assets/images/images";
import { useCanvas } from "@/src/contexts/CanvasProvider";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

export default function CanvasHolder() {
  const { canvas } = useCanvas();
  console.log(canvas);
  return (
    <StyledMotiView className="w-full h-full absolute inset-0 bg-slate-200 z-[-1]">
      {/* Render background image if available */}
      {canvas.backgroundImagePath && (
        <Image
          // maybe check if its a URL, or an enum, if its an enum we load locally, otherwise load from backend
          source={getImageFromPath(canvas.backgroundImagePath)}
          style={{ position: "absolute", width: "100%", height: "100%", zIndex: -1 }}
          resizeMode="cover" // Use 'cover' to ensure it covers the whole area
        />
      )}

      {/* Render canvas items */}
      {canvas.items.map((item) => {
        if (item.type === "frame") {
          return <CanvasFrameHolder key={item.id} item={item} />;
        }

        if (item.type === "text") {
          return <CanvasTextHolder key={item.id} item={item} />;
        }

        return null; // Return null if the type is unrecognized
      })}
    </StyledMotiView>
  );
}
