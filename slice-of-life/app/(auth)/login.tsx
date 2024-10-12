import EmailForm from "@/src/components/auth/EmailForm";
import { View } from "react-native";

export default function Login() {
  console.log("login screen");
  return (
    <View>
      <EmailForm />
    </View>
  );
}
