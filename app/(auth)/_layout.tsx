import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/src/contexts/AuthProvider";
import * as Linking from "expo-linking";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
import { ImageBackground, View } from "react-native";
import { styled } from "nativewind";
import { getImageFromPath } from "@/src/assets/images/images";
const StyledView = styled(View);
const Layout = observer(function Layout() {
  const session = authStore$.session.get();
  if (session !== null) {
    return <Redirect href="/home" />;
  }
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0">
      <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
        <Slot />
      </ImageBackground>
    </StyledView>
  );
});

export default Layout;
