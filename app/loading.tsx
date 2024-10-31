import { getImageFromPath } from "@/src/assets/images/images";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import authStore$ from "@/src/stores/AuthStore";
import { books$ } from "@/src/stores/BookStore";
import { when, whenReady } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Redirect, router } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { View, Text, ImageBackground } from "react-native";
const StyledView = styled(View);
const Loading = observer(function Loading() {
  const sessionLoading = authStore$.loading.get();
  const session = authStore$.session.get();
  const books = books$.get();
  if (!sessionLoading && !session) {
    router.push("/login");
  }
  if (session && books) {
    console.log(books);
    router.push("/journal");
  }
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0">
      <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
        <LoadingScreen />
      </ImageBackground>
    </StyledView>
  );
});

export default Loading;
