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
const StyledView = styled(View);

export default function JournalScreen() {
  const { menuOpen, setMenuOpen, setNavMenuVisible } = useNav();
  const { startEdit, exitEdit, saveCanvas } = useCanvas();
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
    startEdit();
  };
  const handleShare = () => {
    console.log("sharing");
  };
  const handleSave = () => {
    console.log("saving");
    saveCanvas();
  };
  const exitEditMode = () => {
    //update nav settings
    setNavMenuVisible(true);
    //update journal menus
    setEditMode(!editMode);
    setJournalMenuVisible(false);
    setBottomBarVisible(true);
    exitEdit();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* canvas component here */}
      <CanvasHolder />
      {/* Page menu */}
      <BottomBar key="bottom-bar" onExit={() => exitEditMode()} onSave={() => handleSave()} />
      <JournalMenu key="journal-menu" onEditClick={() => startEditMode()} onShareClick={() => handleShare()} />
    </GestureHandlerRootView>
  );
}
