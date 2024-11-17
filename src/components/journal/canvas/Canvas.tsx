import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Canvas, CanvasItem, Image, Page } from "@/src/types/shared.types";
import { Image as ExpoImage } from "expo-image";

import CanvasFrameHolder from "./CanvasFrameHolder";
import { getImageFromPath } from "@/src/assets/images/images";
import { jsonToCanvas } from "@/src/services/Canvas";
import { defaultCanvas } from "@/src/stores/CanvasStore";
import CanvasImageHolder from "./CanvasImageHolder";
import { Show, observer } from "@legendapp/state/react";
import { getPageForUser, pageStore$ } from "@/src/stores/PagesStore";
import CanvasTextHolder from "./CanvasText";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);
export const CanvasHolder = observer(function CanvasHolder({ canvas }: { canvas: Canvas }) {
  console.log("canvas items", canvas.items);
  return (
    <View style={{ flex: 1 }}>
      <CanvasElement items={canvas.items} backgroundImage={canvas.backgroundImage} />
    </View>
  );
});

const CanvasElement = function CanvasElement({
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
};

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
