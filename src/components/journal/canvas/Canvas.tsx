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
import { Json } from "@/src/types/supabase.types";
import { jsonToCanvas } from "@/src/services/Canvas";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import CanvasImageHolder from "./CanvasImageHolder";
import { Show, observer } from "@legendapp/state/react";
import { journalStore$, pages$ } from "@/src/stores/PagesStore";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

const CanvasHolder = observer(function CanvasHolder({ pageId }: { pageId: string | null }) {
  let canvas = defaultCanvas;
  const editMode = journalStore$.editMode.get();
  if (editMode) {
    canvas = canvasStore$.curCanvas.get() || defaultCanvas;
  } else if (pageId && pageId != "") {
    let canvasStr = pages$[pageId].get()?.canvas;
    const canvasObj = jsonToCanvas(JSON.stringify(canvasStr));
    if (canvasObj) {
      canvas = canvasObj;
    }
  }
  return (
    <StyledMotiView
      key={`${editMode && "edit-"}canvas-${canvas.curId}`}
      className=" absolute top-0 bottom-0 right-0 left-0 overflow-hidden">
      {/*  <StyledMotiView className="flex-1 "> */}
      {canvas.backgroundImage?.type === "Local" && (
        <Image
          // maybe check if its a URL, or an enum, if its an enum we load locally, otherwise load from backend
          key="backgroundImage"
          source={getImageFromPath(canvas.backgroundImage.path || "bg_04")}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
        />
      )}

      {canvas.items.map((item) => {
        if (item.type === "frame") {
          // return <CanvasFrameOld key={`frame-${tempCanvas ? "temp-" : ""}-${item.id}`} item={item} />;
          return <CanvasFrameHolder key={`${editMode && "edit"}-${item.id}-}`} item={item} />;
        }
        if (item.type === "image") {
          return <CanvasImageHolder key={`${editMode && "edit"}-${item.id}`} item={item} />;
        }

        if (item.type === "text") {
          return <CanvasTextHolder key={`${editMode && "edit"}-${item.id}-`} item={item} />;
        }
        return null; // Return null if the type is unrecognized
      })}
    </StyledMotiView>
  );
});
export default CanvasHolder;
