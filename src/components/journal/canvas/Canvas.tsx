import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Canvas, CanvasItem, Image, Page } from "@/src/types/shared.types";
import { Image as ExpoImage } from "expo-image";

import CanvasFrameHolder from "./CanvasFrameHolder";
import { getImageFromPath } from "@/src/assets/images/images";
import { jsonToCanvas } from "@/src/services/Canvas";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import CanvasImageHolder from "./CanvasImageHolder";
import { Show, observer } from "@legendapp/state/react";
import { getPageForUser, pageStore$ } from "@/src/stores/PagesStore";
import CanvasTextHolder from "./CanvasText";
import { Observable } from "@legendapp/state";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);
export const CanvasHolder = observer(function CanvasHolder({ canvas }: { canvas: Canvas }) {
  //doesn't re-render on curcanvas update
  console.log("re-rendering holder");
  return (
    <View style={{ flex: 1 }}>
      <CanvasElement items={canvas.items} backgroundImage={canvas.backgroundImage} />
    </View>
  );
});

const CanvasElement = observer(function CanvasElement({
  items,
  backgroundImage,
}: {
  items: CanvasItem[];
  backgroundImage: Image;
}) {
  console.log("re-rendering items");
  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 overflow-hidden">
      {backgroundImage.type === "Local" && (
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
  const editMode = pageStore$.editMode.get();
  switch (item.type) {
    // case "frame":
    //   return <CanvasFrameHolder key={`frame-${item.id}`} observableItem={item} />;
    case "image":
      return <CanvasImageHolder key={`${editMode ? "edit-" : ""}image-${item.id}-${item.version}`} item={item} />;
    case "text":
      return <CanvasTextHolder key={`${editMode ? "edit-" : ""}text-${item.id}-${item.version}`} item={item} />;
    default:
      return null;
  }
});
