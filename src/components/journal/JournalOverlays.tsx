import { AnimatePresence } from "moti";
import React from "react";
import QuickActionsOverlay from "./quickActionsOverlay/QuickActionsOverlay";
import { uiStore$ } from "@/src/stores/UIStore";
import JournalMenu from "./journalMenu/JournalMenu";
import { observer } from "@legendapp/state/react";
import CanvasMenu from "./canvasMenu/CanvasMenu";
import ImageOverlay from "./canvasMenu/imageOverlay/ImageOverlay";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { View } from "react-native";
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const JournalOverlays = observer(function JournalOverlays() {
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0 z-10" pointerEvents="box-none">
      <StyledSafeAreaView className="flex-1" pointerEvents="box-none">
        <AnimatePresence exitBeforeEnter>
          {uiStore$.displayQuickActionsOverlay.get() && <QuickActionsOverlay key="quick-actions" />}
          {uiStore$.displayJournalMenu.get() && <JournalMenu key="bottom-bar" />}
          {uiStore$.displayCanvasMenu.get() && <CanvasMenu key="canvas-menu" />}
          {uiStore$.displayImageEditOverlay.get() && <ImageOverlay key="image-overlay" />}
        </AnimatePresence>
      </StyledSafeAreaView>
    </StyledView>
  );
});
export default JournalOverlays;
