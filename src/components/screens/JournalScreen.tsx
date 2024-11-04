import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
import { useEffect, useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { AnimatePresence } from "moti";
import { useJournal } from "@/src/contexts/JournalProvider";
import Toast from "react-native-root-toast";
import { runOnJS } from "react-native-reanimated";
import { useData } from "@/src/contexts/DataProvider";
// import { useBookStore } from "@/src/stores/BookStore";
import JournalOverlays from "../journal/JournalOverlays";
import JournalView from "../journal/JournalView";
import PagerTest from "../playground/pagetTest";

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
        {/* <PagerTest /> */}
      </StyledView>
      {/* need to fix the cursor to go through here, or adjust the size propery */}
      <StyledView className="absolute top-0 bottom-0 right-0 left-0 " pointerEvents="box-none">
        <JournalOverlays />
      </StyledView>
      {/* </GestureDetector> */}
    </GestureHandlerRootView>
  );
}
