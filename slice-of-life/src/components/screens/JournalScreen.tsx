import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
import JournalMenu from "../journal/JournalMenu";
import { useEffect, useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import BottomBar from "../journal/bottomBar/BottomBar";
import { AnimatePresence } from "moti";
import { useJournal } from "@/src/contexts/JournalProvider";
import Toast from "react-native-root-toast";
import CanvasItemEditor from "../journal/canvas/CanvasItemEditor";
import DateSelector from "../journal/DateSelector";
import { StyledMotiView } from "../shared/CircleButton";
import { runOnJS } from "react-native-reanimated";
import { useData } from "@/src/contexts/DataProvider";

const StyledView = styled(View);

export default function JournalScreen() {
  const { selectedDate } = useData();
  const { menuOpen, setMenuOpen, navMenuVisible, setNavMenuVisible } = useNav();
  const { startEditCanvas, exitEditCanvas, saveCanvasEdits, curEditingCanvasItem } = useCanvas();
  const {
    setDateSelectorVisible,
    viewMode,
    setViewMode,
    journalMenuVisible,
    setJournalMenuVisible,
    bottomBarVisible,
    setBottomBarVisible,
    editMode,
    setEditMode,
  } = useJournal();

  const startEditMode = () => {
    setMenuOpen(false);
    setNavMenuVisible(false);
    setEditMode(true);
    setJournalMenuVisible(false);
    setDateSelectorVisible(false);
    setBottomBarVisible(true);
    startEditCanvas();
  };

  const handleShare = () => {
    console.log("sharing");
  };

  const handleSave = () => {
    console.log("saving");
    let toast = Toast.show("Saving Changes", {
      duration: 1000,
      position: Toast.positions.CENTER,
    });
    saveCanvasEdits();
  };

  const exitEditMode = () => {
    exitEditCanvas();
    setNavMenuVisible(true);
    setDateSelectorVisible(true);
    setEditMode(false);
    setJournalMenuVisible(false);
    setBottomBarVisible(true);
  };

  const handleBackgroundTap = () => {
    if (!editMode) {
      setViewMode(!viewMode);
      setNavMenuVisible(!navMenuVisible);
    }
  };

  // Create the tap gesture using the modern Gesture API
  const tapGesture = Gesture.Tap()
    .numberOfTaps(viewMode ? 1 : 2)
    .onStart(() => {
      runOnJS(handleBackgroundTap)();
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={tapGesture}>
        <StyledView className="absolute top-0 bottom-0 right-0 left-0 ">
          <CanvasHolder key={selectedDate} />
          <AnimatePresence>
            {!viewMode && (
              <StyledMotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "timing", duration: 200 }}
                className="absolute top-0 bottom-0 right-0 left-0 " // Allow pointer events to pass through
                style={{
                  pointerEvents: "box-none",
                }}
                // className="flex-1" // Allow pointer events to pass through
              >
                <BottomBar key="bottom-bar" onExit={() => exitEditMode()} onSave={() => handleSave()} />
                <JournalMenu
                  key="journal-menu"
                  onEditClick={() => startEditMode()}
                  onShareClick={() => handleShare()}
                />
                <DateSelector />
              </StyledMotiView>
            )}
          </AnimatePresence>

          <AnimatePresence>{curEditingCanvasItem && <CanvasItemEditor />}</AnimatePresence>
        </StyledView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
