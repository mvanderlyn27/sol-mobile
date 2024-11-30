import { styled } from "nativewind";
import { AnimatePresence, MotiView } from "moti";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Canvas, CanvasImage, CanvasText, CanvasItem, Image, Page, PageItem } from "@/src/types/shared.types";
import { Image as ExpoImage } from "expo-image";

import { getImageFromPath } from "@/src/assets/images/images";
import CanvasImageHolder from "./CanvasImageHolder";
import { For, Show, observer, useMount } from "@legendapp/state/react";
import { getPageForUser, imagesItems$, pageItems$, pageStore$, pages$, textItems$ } from "@/src/stores/PagesStore";
import CanvasTextHolder from "./CanvasText";
import { Observable, observable, syncState } from "@legendapp/state";
import LoadingScreen from "../../screens/SplashScreen";
import { images$ } from "@/src/stores/ImageStore";
import { Skeleton } from "moti/skeleton";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);
export const CanvasHolder = observer(function CanvasHolder({
  pageId,
  editMode,
}: {
  pageId?: string;
  editMode?: boolean;
}) {
  const page$ = pages$[pageId || ""];
  const backgroundImage = images$[page$.background_image_id.get()].get() || { type: "background", path: "bg_04" };
  const items$ = Object.values(pageItems$).filter((item) => item.page_id.get() === pageId);
  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 overflow-hidden">
      {(backgroundImage?.type === "background" || backgroundImage?.type === "local") && (
        <ExpoImage
          key="backgroundImage"
          source={getImageFromPath(backgroundImage.path || "bg_04")}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
        />
      )}
      {items$.map((item, index) => (
        <CanvasObject key={`item-${index}`} item$={item} />
      ))}
    </StyledMotiView>
  );
});

const CanvasObject = observer(function CanvasObject({ item$ }: { item$: Observable<PageItem> }) {
  const editMode = pageStore$.editMode.get();
  const item = item$.get();
  switch (item.type) {
    // case "frame":
    //   return <CanvasFrameHolder key={`frame-${item.id}`} observableItem={item} />;
    case "image": {
      const imageItem = imagesItems$[item.id].get();
      const image = imageItem && images$[imageItem.image_id].get();
      if (!imageItem || !image) {
        return <Skeleton width={100} height={100} />;
      }
      const canvasImage: CanvasImage = {
        ...item,
        type: "image",
        ...imageItem,
        path: image.path,
      };

      return <CanvasImageHolder key={`${editMode ? "edit-" : ""}image-${item.id}`} item={canvasImage} />;
    }
    case "text": {
      const textItem = textItems$[item.id].get();
      const canvasText: CanvasText = {
        ...item,
        type: "text",
        ...textItem,
        textContent: textItem.text || "",
        fontSize: textItem.font_size || 16,
        fontColor: textItem.color || "#000000",
        fontType: textItem.font || "Pragmatica",
      };
      return <CanvasTextHolder key={`${editMode ? "edit-" : ""}text-${item.id}`} item={canvasText} />;
    }
    default:
      return null;
  }
});
