import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Canvas, CanvasImage, CanvasText, CanvasItem, Image, Page, PageItem } from "@/src/types/shared.types";
import { Image as ExpoImage } from "expo-image";

import { getImageFromPath } from "@/src/assets/images/images";
import CanvasImageHolder from "./CanvasImageHolder";
import { For, Show, observer, useMount } from "@legendapp/state/react";
import { imagesItems$, pageItems$, pageStore$, pages$, textItems$ } from "@/src/stores/PagesStore";
import CanvasTextHolder from "./CanvasText";
import { Observable, observable, syncState } from "@legendapp/state";
import LoadingScreen from "../../screens/SplashScreen";
import { images$ } from "@/src/stores/ImageStore";
import { Skeleton } from "moti/skeleton";
import { posthog } from "@/src/services/Posthog";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);
export const CanvasHolder = observer(function CanvasHolder({
  pageId,
  editMode,
}: {
  pageId?: string;
  editMode: boolean;
}) {
  const page$ = pages$[pageId || ""];
  const items$ = Object.values(pageItems$).filter((item) => item.page_id.get() === pageId && !item.deleted.get());

  return (
    <StyledMotiView
      key={`${editMode ? "edit-" : ""}canvas-${pageId}`}
      className="absolute top-0 bottom-0 right-0 left-0 overflow-hidden">
      <ExpoImage
        key="backgroundImage"
        source={getImageFromPath(page$.background_image.get() || "bg_04")}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
      />
      {items$.map((item, index) => (
        <CanvasObject
          key={`item-${index}-${editMode ? "edit" : ""}-${item.id.get()}`}
          item$={item}
          editMode={editMode}
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
  editMode,
}: {
  pageId: string;
  item$: Observable<PageItem>;
  editMode: boolean;
}) {
  switch (item$.type.get()) {
    // case "frame":
    //   return <CanvasFrameHolder key={`frame-${item.id}`} observableItem={item} />;
    case "image": {
      const imageItem = imagesItems$[item$.id.get()];
      const image = imageItem && images$[imageItem.image_id.get()];
      if (!image || !imageItem) {
        posthog.capture("missing-image-items");
        return;
      }
      const canvasImage: CanvasImage = {
        ...item$.get(),
        type: "image",
        ...imageItem.get(),
        path: image.path.get(),
      };

      return (
        <CanvasImageHolder key={`${pageId}-${editMode ? "edit-" : ""}image-${item$.id.get()}`} item={canvasImage} />
      );
    }
    case "text": {
      const textItem = textItems$[item$.id.get()].get();
      if (!textItem) {
        posthog.capture("missing-text-item");
        return;
      }
      const canvasText: CanvasText = {
        ...item$.get(),
        type: "text",
        textContent: textItem.text,
        fontSize: textItem.font_size || 16,
        fontColor: textItem.color,
        fontType: textItem.font,
      };
      return <CanvasTextHolder key={`${pageId}-${editMode ? "edit-" : ""}text-${item$.id.get()}`} item={canvasText} />;
    }
    default:
      return null;
  }
});
