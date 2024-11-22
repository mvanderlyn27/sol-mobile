import { getImageFromPath } from "@/src/assets/images/images";
import LoadingScreen from "@/src/components/screens/SplashScreen";
import authStore$ from "@/src/stores/AuthStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { when, whenReady } from "@legendapp/state";
import { observer, useMount } from "@legendapp/state/react";
import { Redirect, router } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { View, ImageBackground } from "react-native";

const StyledView = styled(View);

const Loading = observer(function Loading() {
  const session = authStore$.session.get();
  const userId = session?.user?.id;

  const [polling, setPolling] = useState(true);
  const [profileReady, setProfileReady] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useMount(async () => {
    const userId = await when(authStore$.session.user.id.get());
    if (!userId) return;
    whenReady(profiles$[userId], (profile) => {
      if (profile.new) {
        router.navigate("/(ftux)/username");
      } else {
        router.navigate("/home");
      }
    });
  });
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0">
      <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
        <LoadingScreen />
      </ImageBackground>
    </StyledView>
  );
});

export default Loading;
