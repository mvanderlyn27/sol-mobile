import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
import JournalMenu from "../journal/JournalMenu";
import { useEffect, useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import BottomBar from "../journal/journalMenu/JournalMenu";
import { AnimatePresence } from "moti";
import { useJournal } from "@/src/contexts/JournalProvider";
import Toast from "react-native-root-toast";
import CanvasItemEditor from "../journal/canvas/CanvasItemEditor";
import DateSelector from "../journal/DateSelector";
import { StyledMotiView } from "../shared/CircleButton";
import { runOnJS } from "react-native-reanimated";
import { useData } from "@/src/contexts/DataProvider";
import JournalView from "../journal/JournalView";
// import { useBookStore } from "@/src/stores/BookStore";
import QuickActionsOverlay from "../journal/quickActionsOverlay/QuickActionsOverlay";
import CanvasMenu from "../journal/canvas/canvasMenu/canvasMenu";
import JournalOverlays from "./JournalOverlays";

const StyledView = styled(View);

export default function JournalScreen() {
  // const { initializeBookStore } = useBookStore();
  // const curBook = useBookStore((state) => state.currentBook);

  useEffect(() => {
    // initializeBookStore();
  }, []);

  const startEditMode = () => {
    // setMenuOpen(false);
    // setNavMenuVisible(false);
    // setEditMode(true);
    // setJournalMenuVisible(false);
    // setDateSelectorVisible(false);
    // setBottomBarVisible(true);
    // startEditCanvas();
  };

  const handleShare = () => {
    console.log("sharing");
  };

  const handleSave = () => {
    // console.log("saving");
    // let toast = Toast.show("Saving Changes", {
    //   duration: 1000,
    //   position: Toast.positions.CENTER,
    // });
    // saveCanvasEdits();
  };

  const exitEditMode = () => {
    // exitEditCanvas();
    // setNavMenuVisible(true);
    // setDateSelectorVisible(true);
    // setEditMode(false);
    // setJournalMenuVisible(false);
    // setBottomBarVisible(true);
  };

  const handleBackgroundTap = () => {
    // if (!editMode) {
    //   setViewMode(!viewMode);
    //   setNavMenuVisible(!navMenuVisible);
    // }
  };

  // Create the tap gesture using the modern Gesture API
  // const tapGesture = Gesture.Tap()
  // .numberOfTaps(viewMode ? 1 : 2)
  // .onStart(() => {
  //   runOnJS(handleBackgroundTap)();
  // });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <GestureDetector gesture={tapGesture}> */}
      <StyledView className="absolute top-0 bottom-0 right-0 left-0 ">
        <JournalView />
        <JournalOverlays />
      </StyledView>
      {/* </GestureDetector> */}
    </GestureHandlerRootView>
  );
}
