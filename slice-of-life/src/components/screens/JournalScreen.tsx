import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
import JournalMenu from "../journal/JournalMenu";
import { useEffect, useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomBar from "../journal/bottomBar/BottomBar";
import { AnimatePresence } from "moti";
import { useJournal } from "@/src/contexts/JournalProvider";
import Toast from "react-native-root-toast";
import CanvasItemEditor from "../journal/canvas/CanvasItemEditor";
const StyledView = styled(View);

export default function JournalScreen() {
  const { menuOpen, setMenuOpen, setNavMenuVisible } = useNav();
  const { startEditCanvas, exitEditCanvas, saveCanvasEdits, curEditingCanvasItem } = useCanvas();
  const { journalMenuVisible, setJournalMenuVisible, bottomBarVisible, setBottomBarVisible, editMode, setEditMode } =
    useJournal();
  const startEditMode = () => {
    //update nav settings
    setMenuOpen(false);
    setNavMenuVisible(false);
    //update journal menus
    setEditMode(true);
    setJournalMenuVisible(false);
    setBottomBarVisible(true);
    startEditCanvas();
  };
  const handleShare = () => {
    console.log("sharing");
  };
  const handleSave = () => {
    console.log("saving");
    let toast = Toast.show("Saving", {
      duration: 1000,
      position: Toast.positions.TOP,
    });
    saveCanvasEdits();
  };
  const exitEditMode = () => {
    exitEditCanvas();
    setNavMenuVisible(true);
    //update journal menus
    setEditMode(false);
    setJournalMenuVisible(false);
    setBottomBarVisible(true);
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* canvas component here */}
      <CanvasHolder />
      {/* Page menu */}
      <BottomBar key="bottom-bar" onExit={() => exitEditMode()} onSave={() => handleSave()} />
      <JournalMenu key="journal-menu" onEditClick={() => startEditMode()} onShareClick={() => handleShare()} />
      <AnimatePresence>
        {/* <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 z-[1000]"> */}
        {curEditingCanvasItem && <CanvasItemEditor />}
        {/* </StyledMotiView> */}
      </AnimatePresence>
    </GestureHandlerRootView>
  );
}
