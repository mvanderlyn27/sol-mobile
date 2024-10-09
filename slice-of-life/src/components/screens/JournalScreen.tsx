import { View, Text } from "react-native";
import { styled } from "nativewind";
import { CanvasProvider } from "@/src/contexts/CanvasProvider";
const StyledView = styled(View);

export default function JournalScreen() {
  return (
    <CanvasProvider>
      <StyledView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>test</Text>
      </StyledView>
    </CanvasProvider>
  );
}
