import { useAuth } from "@/src/contexts/AuthProvider";
import { generateId } from "@/src/stores/AsyncStorage";
import authStore$ from "@/src/stores/AuthStore";
import { addNotification } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import * as AppleAuthentication from "expo-apple-authentication";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { Platform, View } from "react-native";

const StyledView = styled(View);
const StyledAppleButton = styled(AppleAuthentication.AppleAuthenticationButton);

const AppleAuthButton = observer(function AppleAuthButton({ type }: { type: string }) {
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
        await authStore$.signInApple(credential.identityToken, credential.fullName?.givenName || "");
      } else {
        posthog.capture("sign-in-with-apple-failed", { error: "missing identity token" });
        addNotification({
          id: generateId(),
          message: "Failed to sign in with Apple missing auth token",
          type: NotificationType.info,
        });
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        posthog.capture("sign-in-with-apple-failed", { error: e });
        addNotification({
          id: generateId(),
          message: "Failed to sign in with Apple " + e.message,
          type: NotificationType.info,
        });
      }
    }
  };
  if (Platform.OS !== "ios") return null;
  return (
    <StyledAppleButton
      className="w-full h-[50px] rounded-lg mb-2"
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
});

export default AppleAuthButton;
