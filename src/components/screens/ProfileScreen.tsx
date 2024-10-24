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
import ProfilePic from "../profile/ProfilePic";
import ProfileName from "../profile/ProfileName";
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
          <StyledSafeAreaView className="absolute top-0 left-0 right-0 bottom-0">
            <StyledMotiView
              className="flex-1 flex-col items-center"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 1000 }}>
              <StyledText
                className="text-3xl tracking-widest text-secondary text-center"
                style={{ fontFamily: "PragmaticaExtended-bold" }}>
                SLICE OF LIFE
              </StyledText>
              <StyledText
                className="text-[10px]  text-secondary text-center"
                style={{ fontFamily: "PragmaticaExtended" }}>
                ORDINARY MUNDANE. BUT UNIQUELY YOURS.
              </StyledText>
              <StyledView className="w-full items-center invisible">
                <StyledText
                  className=" text-6xl text-center py-6 text-secondary "
                  style={{ fontFamily: "PragmaticaExtended-bold", color: "transparent" }}>
                  STARRING
                </StyledText>
              </StyledView>
              <ProfilePic />
              <ProfileName />
            </StyledMotiView>
          </StyledSafeAreaView>
        </StyledMotiView>
        <ProfileMenu />
      </ImageBackground>
    </StyledView>
  );
}
