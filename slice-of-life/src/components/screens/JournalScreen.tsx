import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
import JournalMenu from "../journal/JournalMenu";
import { useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const StyledView = styled(View);
import { Dimensions } from "react-native";

export default function JournalScreen() {
  const { toggleMenuVisible } = useNav();
  const [editMode, setEditMode] = useState<boolean>(false);

  const { width, height } = Dimensions.get("window");
  console.log("window", width, height);
  return (
    <CanvasProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* canvas component here */}
        {/* <CanvasHolder /> */}
        {/* Page menu */}
        <JournalMenu
          editMode={false}
          onEditClick={function (): void {
            throw new Error("Function not implemented.");
          }}
          onShareClick={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </GestureHandlerRootView>
    </CanvasProvider>
  );
}
