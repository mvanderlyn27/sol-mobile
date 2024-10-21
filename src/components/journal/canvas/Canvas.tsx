import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Canvas } from "@/src/types/shared.types";
import { Image } from "expo-image";

import CanvasFrameHolder from "./CanvasFrameHolder";
import CanvasTextHolder from "./CanvasText";
import { BG_04, getImageFromPath } from "@/src/assets/images/images";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import CanvasItemEditor from "./CanvasItemEditor";
import { useData } from "@/src/contexts/DataProvider";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

export default function CanvasHolder() {
  const { selectedDate } = useData();
  const {
    canvas,
    tempCanvas,
    editingCanvas,
    startEditCanvas,
    exitEditCanvas,
    saveCanvasEdits,
    canvasLoading,
    addCanvasItem,
  } = useCanvas();
  const { editMode } = useJournal();
  //if editmode is trye, the tempcanvas is not null
  const curCanvas = editingCanvas && tempCanvas ? tempCanvas : { ...canvas };
  // console.debug(curCanvas.items.map((item) => item.type + ":" + item.id + ", (" + item.x + "," + item.y + ")"));
  return (
    <StyledMotiView key={`canvas-${selectedDate}`} className=" absolute top-0 bottom-0 right-0 left-0">
      {/*  <StyledMotiView className="flex-1 "> */}
      {(canvasLoading || !curCanvas?.backgroundImage) && (
        <StyledMotiView className="flex-1 justify-center items-center">
          <Image
            // maybe check if its a URL, or an enum, if its an enum we load locally, otherwise load from backend
            key="backgroundImage"
            source={getImageFromPath("bg_04")}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
          />
          {/* <ActivityIndicator size="large" /> */}
        </StyledMotiView>
      )}
      {!canvasLoading && curCanvas && curCanvas.backgroundImage?.type === "Local" && (
        <Image
          // maybe check if its a URL, or an enum, if its an enum we load locally, otherwise load from backend
          key="backgroundImage"
          source={getImageFromPath(curCanvas.backgroundImage.path)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
        />
      )}

      {/* Render canvas items */}
      <AnimatePresence>
        <StyledMotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -10 }}
          transition={{
            type: "timing",
            duration: 400,
          }}>
          {!canvasLoading &&
            curCanvas &&
            { ...curCanvas }.items?.map((item) => {
              if (item.type === "frame") {
                // return <CanvasFrameOld key={`frame-${tempCanvas ? "temp-" : ""}-${item.id}`} item={item} />;
                return (
                  <CanvasFrameHolder
                    key={`frame-${tempCanvas ? "temp-" : "-"}${item.id}-${selectedDate}`}
                    item={{ ...item }}
                  />
                );
              }

              if (item.type === "text") {
                return (
                  <CanvasTextHolder
                    key={`text-${tempCanvas ? "temp-" : "-"}${item.id}-${selectedDate}`}
                    item={{ ...item }}
                  />
                );
              }
              return null; // Return null if the type is unrecognized
            })}
        </StyledMotiView>
      </AnimatePresence>
    </StyledMotiView>
  );
}
