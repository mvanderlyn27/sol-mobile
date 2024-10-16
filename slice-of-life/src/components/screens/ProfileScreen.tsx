import { View, Text, Button, Pressable, ImageBackground } from "react-native";
import LogoutButton from "../auth/LogoutButton";
import { Link } from "expo-router";
import ProfileMenu from "../profile/ProfileMenu";
import { getImageFromPath } from "@/src/assets/images/images";
import { styled } from "nativewind";
import { MotiView, SafeAreaView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
import { useEffect } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
const StyledView = styled(View);
const StyledMotiView = styled(MotiView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledText = styled(Text);
export default function ProfileScreen() {
  const { session } = useAuth();
  const { navMenuVisible, setNavMenuVisible } = useNav();

  return (
    <StyledView className="flex-1">
      <ImageBackground source={getImageFromPath("bg_03")} resizeMode="cover" style={{ flex: 1 }}>
        <StyledMotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 1000 }}
          className="flex-1">
          <StyledSafeAreaView className="absolute top-0 left-0 right-0 p-4">
            <StyledText className="text-white text-xl font-bold text-center">Profile Screen</StyledText>
          </StyledSafeAreaView>
        </StyledMotiView>
        <ProfileMenu />
      </ImageBackground>
    </StyledView>
  );
}
