import { ActivityIndicator, ImageBackground, SafeAreaView, Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { styled } from "nativewind";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
import { getImageFromPath } from "@/src/assets/images/images";
import PagerView from "react-native-pager-view";
const StyledView = styled(MotiView);
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledPagerView = styled(PagerView);
export default function TutorialScreen() {
  return (
    <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
      <StyledSafeAreaView className="absolute top-0 left-0 right-0 bottom-0">
        <StyledText
          className="text-white text-3xl tracking-widest text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-bold" }}>
          SLICE OF LIFE
        </StyledText>
        <StyledText
          className="text-white text-[10px]  text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended" }}>
          ORDINARY MUNDANE. BUT UNIQUELY YOURS
        </StyledText>

        <StyledMotiView className="flex-1">
          <StyledText
            className="mt-10 text-2xl tracking-widest text-secondary text-center"
            style={{ fontFamily: "PragmaticaExtended" }}>
            TUTORIAL
          </StyledText>
          <StyledPagerView className="flex-1" initialPage={0}>
            <StyledView className="flex-1 justify-center items-center" key="0">
              <StyledText className="text-white">First page</StyledText>
              <StyledText className="text-white">Swipe ➡️</StyledText>
            </StyledView>
            <StyledView className="flex-1 justify-center items-center" key="1">
              <StyledText className="text-white">Second page</StyledText>
              <StyledText className="text-white">Swipe ➡️</StyledText>
            </StyledView>
          </StyledPagerView>
        </StyledMotiView>
      </StyledSafeAreaView>
    </ImageBackground>
  );
}
