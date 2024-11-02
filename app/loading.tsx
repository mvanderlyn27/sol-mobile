import { getImageFromPath } from "@/src/assets/images/images";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import authStore$ from "@/src/stores/AuthStore";
import { addBook, bookStore$, books$, initBookStore } from "@/src/stores/BookStore";
import { addPage, journalStore$, pages$ } from "@/src/stores/JournalStore";
import { syncState, when, whenReady } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Redirect, router } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { View, Text, ImageBackground } from "react-native";
const StyledView = styled(View);
const Loading = observer(function Loading() {
  const [pagesReady, setPagesReady] = useState(false);
  const [bookReady, setBookReady] = useState(false);
  const session = authStore$.session.get();
  const books = books$.get();
  const pages = pages$.get();
  console.log("info", books, pages);
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0">
      {session && books && pages && <Redirect href="/home" />}
      <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
        <LoadingScreen />
      </ImageBackground>
    </StyledView>
  );
});

export default Loading;
