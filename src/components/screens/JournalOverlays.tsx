import { AnimatePresence } from "moti";
import React from "react";
import CanvasMenu from "../journal/canvas/canvasMenu/canvasMenu";
import QuickActionsOverlay from "../journal/quickActionsOverlay/QuickActionsOverlay";
import { uiStore$ } from "@/src/stores/UIStore";
import JournalMenu from "../journal/journalMenu/JournalMenu";
import { observer } from "@legendapp/state/react";

const JournalOverlays = observer(function JournalOverlays() {
  return (
    <AnimatePresence exitBeforeEnter>
      {uiStore$.displayQuickActionsOverlay.get() && <QuickActionsOverlay key="quick-actions" />}
      {uiStore$.displayJournalMenu.get() && <JournalMenu key="bottom-bar" />}
      {uiStore$.displayCanvasMenu.get() && <CanvasMenu key="canvas-menu" />}
    </AnimatePresence>
  );
});
export default JournalOverlays;
