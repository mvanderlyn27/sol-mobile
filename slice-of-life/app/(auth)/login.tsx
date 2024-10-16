import { getImageFromPath } from "@/src/assets/images/images";
import EmailForm from "@/src/components/auth/EmailForm";
import { ImageBackground } from "expo-image";
import { View } from "react-native";

export default function Login() {
  console.log("login screen");
  return (
    <View>
      <ImageBackground source={getImageFromPath("bg_03")}>
        <EmailForm />
      </ImageBackground>
    </View>
  );
}
