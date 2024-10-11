import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
import JournalMenu from "../journal/JournalMenu";
import { useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomBar from "../journal/bottomBar/BottomBar";
import { AnimatePresence } from "moti";
const StyledView = styled(View);

export default function JournalScreen() {
  const { menuOpen, toggleMenuOpen, toggleMenuVisible } = useNav();
  const [editMode, setEditMode] = useState<boolean>(false);
  const startEditMode = () => {
    setEditMode(!editMode);
    if (menuOpen) {
      toggleMenuOpen();
    }
    toggleMenuVisible();
  };
  const handleShare = () => {
    console.log("sharing");
  };
  const handleSave = () => {
    console.log("saving");
  };
  const exitEditMode = () => {
    setEditMode(!editMode);
    toggleMenuVisible();
  };

  return (
    <CanvasProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* canvas component here */}
        <CanvasHolder />
        {/* Page menu */}
        <BottomBar key="bottom-bar" editMode={editMode} onExit={() => exitEditMode()} onSave={() => handleSave()} />
        <JournalMenu
          key="journal-menu"
          editMode={editMode}
          onEditClick={() => startEditMode()}
          onShareClick={() => handleShare()}
        />
      </GestureHandlerRootView>
    </CanvasProvider>
  );
}
