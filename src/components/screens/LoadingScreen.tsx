import { ActivityIndicator, ImageBackground, SafeAreaView, Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { styled } from "nativewind";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
import { getImageFromPath } from "@/src/assets/images/images";
import { BackgroundImage } from "@rneui/themed/dist/config";
import { pageStore$ } from "@/src/stores/PagesStore";
import { observer } from "@legendapp/state/react";
import { BlurView } from "expo-blur";
const StyledView = styled(MotiView);
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const LoadingScreen = observer(function LoadingScreen() {
  return (
    <BlurView intensity={100} tint="dark" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <StyledSafeAreaView className="flex-1">
        <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0  justify-center items-center">
          <StyledText
            className="text-xl p-4 tracking-widest text-secondary text-center"
            style={{ fontFamily: "PragmaticaExtended" }}>
            Loading...
          </StyledText>
          <ActivityIndicator size="large" color="white" />
        </StyledMotiView>
      </StyledSafeAreaView>
    </BlurView>
  );
});

export default LoadingScreen;
