import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Canvas, CanvasItem, Image } from "@/src/types/shared.types";
import { Image as ExpoImage } from "expo-image";

import CanvasFrameHolder from "./CanvasFrameHolder";
import { BG_04, getImageFromPath } from "@/src/assets/images/images";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import CanvasItemEditor from "./CanvasItemEditor";
import { useData } from "@/src/contexts/DataProvider";
import { Json } from "@/src/types/supabase.types";
import { jsonToCanvas } from "@/src/services/Canvas";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import CanvasImageHolder from "./CanvasImageHolder";
import { For, Show, observer } from "@legendapp/state/react";
import { getPageForUser, pageStore$, pages$ } from "@/src/stores/PagesStore";
import CanvasTextHolder from "./CanvasText";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);
export const CanvasHolder = observer(function CanvasHolder({ row, col }: { row: number; col: number }) {
  const date = pageStore$.dates[col].date.get();
  const user = pageStore$.members[row].get();
  const page = getPageForUser(user.user_id, date);
  let canvas = { ...defaultCanvas };
  const oldCanvas = jsonToCanvas(JSON.stringify(page?.canvas));
  if (oldCanvas) {
    canvas = oldCanvas;
  }

  // const canvas = pageStore$.pages[col]?.[date]?.get() || defaultCanvas;
  const tempCanvas = canvasStore$.curCanvas.get() || defaultCanvas;
  const editMode = pageStore$.editMode.get();

  return (
    <Show
      key={`${canvas.id}-${row}-${col}`}
      if={editMode}
      else={<CanvasElement items={canvas.items} backgroundImage={canvas.backgroundImage} />}>
      <CanvasElement items={tempCanvas?.items} backgroundImage={tempCanvas.backgroundImage} />
    </Show>
  );
});

const CanvasElement = memo(function CanvasElement({
  items,
  backgroundImage,
}: {
  items: CanvasItem[];
  backgroundImage: Image;
}) {
  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 overflow-hidden">
      {backgroundImage?.type === "Local" && (
        <ExpoImage
          key="backgroundImage"
          source={getImageFromPath(backgroundImage.path || "bg_04")}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
        />
      )}
      {items.map((item) => (
        <CanvasObject key={`item-${item.id}`} item={item} />
      ))}
    </StyledMotiView>
  );
});

const CanvasObject = observer(function CanvasObject({ item }: { item: CanvasItem }) {
  switch (item.type) {
    case "frame":
      return <CanvasFrameHolder key={`frame-${item.id}`} item={item} />;
    case "image":
      return <CanvasImageHolder key={`image-${item.id}`} item={item} />;
    case "text":
      return <CanvasTextHolder key={`text-${item.id}`} item={item} />;
    default:
      return null;
  }
});
