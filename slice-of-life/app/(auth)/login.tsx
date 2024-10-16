import { getImageFromPath } from "@/src/assets/images/images";
import LoginScreen from "@/src/components/screens/LoginScreen";
import { styled } from "nativewind";
import { View } from "react-native";
const StyledView = styled(View);

export default function Login() {
  return <LoginScreen />;
}
