import { getImageFromPath } from "@/src/assets/images/images";
import HomeScreen from "@/src/components/screens/HomeScreen";
import { ImageBackground } from "react-native";

export default function Home() {
  return (
    <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
      <HomeScreen />
    </ImageBackground>
  );
}
