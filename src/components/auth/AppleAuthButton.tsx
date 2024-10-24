import { useAuth } from "@/src/contexts/AuthProvider";
import * as AppleAuthentication from "expo-apple-authentication";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { Platform, View } from "react-native";
import Toast from "react-native-root-toast";

const StyledView = styled(View);
const StyledAppleButton = styled(AppleAuthentication.AppleAuthenticationButton);

export default function AppleAuthButton({ type }: { type: string }) {
  const { signInWithApple } = useAuth();
  const posthog = usePostHog();
  const handleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // logged in
      if (credential.identityToken) {
        await signInWithApple(credential.identityToken);
      } else {
        posthog.capture("sign-in-with-apple-failed", { error: "missing identity token" });
        Toast.show("Failed to sign in with Apple missing auth token", {});
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        posthog.capture("sign-in-with-apple-failed", { error: e });
        Toast.show("Failed to sign in with Apple " + e.message, {});
      }
    }
  };
  if (Platform.OS !== "ios") return null;
  return (
    <StyledAppleButton
      className="w-full h-[50px] rounded-lg"
      cornerRadius={5}
      buttonType={
        type === "signin"
          ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
          : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
      }
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      onPress={handleLogin}
    />
  );
}
