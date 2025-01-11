import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import { Canvas, CanvasImage, CanvasText, CanvasItem, Image, Page } from "@/src/types/shared.types";
import { Image as ExpoImage } from "expo-image";

import { getImageFromPath } from "@/src/assets/images/images";
import CanvasImageHolder from "./CanvasImageHolder";
import { For, Show, observer, useMount, useObservable } from "@legendapp/state/react";
import { canvasStore$, pageStore$, pages$ } from "@/src/stores/PagesStore";
import CanvasTextHolder from "./CanvasText";
import { Observable, observable, syncState } from "@legendapp/state";
import LoadingScreen from "../../screens/SplashScreen";
import { Skeleton } from "moti/skeleton";
import { posthog } from "@/src/services/Posthog";
import authStore$ from "@/src/stores/AuthStore";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);
export const DEFAULT_ASPECT_RATIO = 18 / 9;
const { width, height } = Dimensions.get("window");
export const CanvasHolder = observer(function CanvasHolder({
  pageId,
  editMode,
  active,
}: {
  pageId?: string;
  editMode: boolean;
  active: boolean;
}) {
  const page$ = pages$[pageId || ""];
  const canvas: Observable<Canvas | null> = !editMode ? observable(page$.canvas.get() as Canvas) : canvasStore$.canvas;
  // if (active) {
  //   console.log("canvas items", editMode, active, canvas.items.get());
  // }
  return (
    <StyledMotiView key={`${editMode ? "edit-" : ""}canvas-${pageId}`} className="flex-1">
      <ExpoImage
        priority={active ? "high" : "low"}
        key="backgroundImage"
        source={getImageFromPath(canvas?.backgroundImage.path.get() || "bg_04")}
        style={{ flex: 1, zIndex: -1 }}
      />
      {canvas.items.map((item, index) => (
        <CanvasObject
          active={active}
          key={`item-${index}-${editMode ? "edit" : ""}-${item.id.get()}`}
          item$={item}
          editable={editMode}
          pageId={pageId || ""}
        />
      ))}
      {/* <Text style={{ position: "absolute", left: 30, bottom: 100 }}>{pageId}</Text> */}
    </StyledMotiView>
  );
});

const CanvasObject = observer(function CanvasObject({
  pageId,
  item$,
  editable,
  active,
}: {
  pageId: string;
  item$: Observable<CanvasItem>;
  editable: boolean;
  active: boolean;
}) {
  switch (item$.type.get()) {
    // case "frame":
    //   return <CanvasFrameHolder key={`frame-${item.id}`} observableItem={item} />;
    case "image": {
      const imageItem = item$.get() as CanvasImage;
      if (!imageItem) {
        posthog.capture("missing-image-items");
        return;
      }

      return (
        <CanvasImageHolder
          key={`${pageId}-${editable ? "edit-" : ""}image-${item$.id.get()}`}
          item={imageItem}
          userItem={editable}
          active={active}
        />
      );
    }
    case "text": {
      const textItem = item$.get() as CanvasText;
      if (!textItem) {
        posthog.capture("missing-text-item");
        return;
      }
      return (
        <CanvasTextHolder
          key={`${pageId}-${editable ? "edit-" : ""}text-${item$.id.get()}`}
          item={textItem}
          userItem={editable}
          active={active}
        />
      );
    }
    default:
      return null;
  }
});
