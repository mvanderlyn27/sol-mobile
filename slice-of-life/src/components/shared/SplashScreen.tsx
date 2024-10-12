import { Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { styled } from "nativewind";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
const StyledView = styled(MotiView);
const StyledText = styled(Text);
export default function SplashScreen() {
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0 justify-center items-center bg-darkPrimary">
      <StyledText className="font-xl text-white">Slice of Life</StyledText>
    </StyledView>
  );
}
