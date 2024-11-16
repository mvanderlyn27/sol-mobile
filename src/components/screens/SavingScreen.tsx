import { ActivityIndicator, ImageBackground, SafeAreaView, Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { styled } from "nativewind";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
import { getImageFromPath } from "@/src/assets/images/images";
import { BackgroundImage } from "@rneui/themed/dist/config";
const StyledView = styled(MotiView);
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
export default function UploadingScreen() {
  return (
    <ImageBackground
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      source={getImageFromPath("bg_03")}>
      <StyledSafeAreaView className="flex-1">
        <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0  justify-center items-center">
          <StyledText
            className="text-xl p-4 tracking-widest text-secondary text-center"
            style={{ fontFamily: "PragmaticaExtended" }}>
            Saving
          </StyledText>
          <ActivityIndicator size="large" color="white" />
        </StyledMotiView>
      </StyledSafeAreaView>
    </ImageBackground>
  );
}
