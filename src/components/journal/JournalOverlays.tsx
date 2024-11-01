import { AnimatePresence } from "moti";
import React from "react";
import QuickActionsOverlay from "./quickActionsOverlay/QuickActionsOverlay";
import { uiStore$ } from "@/src/stores/UIStore";
import JournalMenu from "./journalMenu/JournalMenu";
import { observer } from "@legendapp/state/react";
import CanvasMenu from "./canvasMenu/CanvasMenu";
import ImageOverlay from "./canvasMenu/imageOverlay/ImageOverlay";

const JournalOverlays = observer(function JournalOverlays() {
  return (
    <AnimatePresence exitBeforeEnter>
      {uiStore$.displayQuickActionsOverlay.get() && <QuickActionsOverlay key="quick-actions" />}
      {uiStore$.displayJournalMenu.get() && <JournalMenu key="bottom-bar" />}
      {uiStore$.displayCanvasMenu.get() && <CanvasMenu key="canvas-menu" />}
      {uiStore$.displayImageEditOverlay.get() && <ImageOverlay key="image-overlay" />}
    </AnimatePresence>
  );
});
export default JournalOverlays;
