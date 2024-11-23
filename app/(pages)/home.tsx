import { getImageFromPath } from "@/src/assets/images/images";
import HomeScreen from "@/src/components/screens/HomeScreen";
import { generateId } from "@/src/stores/AsyncStorage";
import { addNotification, notificationStore$ } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import { useMount } from "@legendapp/state/react";
import { Href, router } from "expo-router";
import { add } from "lodash";
import { useEffect } from "react";
import { ImageBackground } from "react-native";

export default function Home() {
  return (
    <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
      <HomeScreen />
    </ImageBackground>
  );
}
