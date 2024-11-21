import { ActivityIndicator, ImageBackground, SafeAreaView, Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { styled } from "nativewind";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
import { getImageFromPath } from "@/src/assets/images/images";
const StyledView = styled(MotiView);
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
export default function LoadingScreen() {
  return (
    <StyledSafeAreaView className="absolute top-0 left-0 right-0 bottom-0">
      <StyledText
        className="text-xl tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended-bold" }}>
        SLICE OF LIFE
      </StyledText>
      <StyledText
        className="text-[10px] tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended" }}>
        ORDINARY. MUNDANE. BUT UNIQUELY YOURS.
      </StyledText>
      <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0  justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </StyledMotiView>
    </StyledSafeAreaView>
  );
}
