import { getImageFromPath } from "@/src/assets/images/images";
import HomeScreen from "@/src/components/screens/HomeScreen";
import { useEffect } from "react";
import { ImageBackground } from "react-native";
import { addNotification } from "@/src/stores/NotificationStore";
import { LocalNotification, NotificationType } from "@/src/types/shared.types";

export default function Home() {
  return (
    <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
      <HomeScreen />
    </ImageBackground>
  );
}
