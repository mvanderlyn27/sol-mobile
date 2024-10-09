import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider, useCanvas } from "@/src/contexts/CanvasProvider";
import CanvasHolder from "@/src/components/journal/canvas/Canvas";
const StyledView = styled(View);

export default function JournalScreen() {
  return (
    <CanvasProvider>
      <StyledView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* canvas component here */}
        <CanvasHolder />
        {/* Page menu */}
      </StyledView>
    </CanvasProvider>
  );
}
