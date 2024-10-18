import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, SafeAreaView, Text, TouchableOpacity } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { getImageFromPath } from "@/src/assets/images/images";
import PagerView from "react-native-pager-view";
import { Image } from "expo-image";
import { useData } from "@/src/contexts/DataProvider";
import { router } from "expo-router";

const StyledView = styled(MotiView);
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledPagerView = styled(PagerView);
const StyledPressable = styled(Pressable);

export default function TutorialScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const { profile, updateProfile } = useData();
  const totalPages = 10; // Number of pages in the tutorial
  useEffect(() => {
    if (profile?.new) {
      updateProfile({ new: false });
    }
  }, []);
  const handleContinue = () => {
    router.push("/journal");
  };
  return (
    <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
      <StyledSafeAreaView className="absolute top-0 left-0 right-0 bottom-0">
        <StyledText
          className="text-white text-3xl tracking-widest text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-bold" }}>
          SLICE OF LIFE
        </StyledText>
        <StyledText
          className="text-white text-[10px] text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended" }}>
          ORDINARY MUNDANE. BUT UNIQUELY YOURS
        </StyledText>

        <StyledMotiView className="flex-1">
          <StyledText
            className="mt-10 text-2xl tracking-widest text-secondary text-center"
            style={{ fontFamily: "PragmaticaExtended" }}>
            TUTORIAL
          </StyledText>
          <StyledPagerView
            className="flex-1"
            initialPage={0}
            onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <StyledView className="flex-1 justify-center items-center" key={index}>
                <Image
                  source={getImageFromPath(`tutorial_${String(index + 1).padStart(2, "0")}`)}
                  style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                />
              </StyledView>
            ))}
          </StyledPagerView>

          {/* Continue Button */}
          {currentPage === totalPages - 1 && (
            <AnimatePresence>
              <StyledMotiView
                className="absolute bottom-10 left-1/2"
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 20 }}
                transition={{ type: "timing", duration: 300 }}>
                <StyledPressable
                  className=" bg-secondary py-3 px-10 rounded-full"
                  onPress={() => {
                    // Handle the continue action here, like navigating to the next screen
                    handleContinue();
                  }}>
                  <StyledText
                    className="text-white text-lg tracking-wider"
                    style={{ fontFamily: "PragmaticaExtended-bold" }}>
                    CONTINUE
                  </StyledText>
                </StyledPressable>
              </StyledMotiView>
            </AnimatePresence>
          )}
        </StyledMotiView>
      </StyledSafeAreaView>
    </ImageBackground>
  );
}
