import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
import { usePostHog } from "posthog-react-native";
import { styled } from "nativewind";
import { Platform } from "react-native";
import { useAuth } from "@/src/contexts/AuthProvider";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
import { addNotification } from "@/src/stores/NotificationStore";
import { generateId } from "@/src/stores/AsyncStorage";
import { NotificationType } from "@/src/types/shared.types";
import { signInGoogle } from "@/src/services/Auth";
const StyledGoogleButton = styled(GoogleSigninButton);
const GoogleAuthButton = observer(function GoogleAuthButton() {
  // const { signInWithGoogle } = useAuth();
  //temporarily disable for android lol
  if (Platform.OS !== "ios") return null;
  const posthog = usePostHog();
  if (!process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID) {
    //if not oauth client don't render, won't show up for dev
    posthog.capture("missing-google-oauth-ios-client-id");
    console.log("missing-google-oauth-ios-client-id");
    addNotification({
      id: generateId(),
      message: "missing google auth client id",
      type: NotificationType.info,
    });
    return null;
  }

  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID,
  });

  return (
    <StyledGoogleButton
      className="w-full rounded-lg"
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Light}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          if (userInfo?.data?.idToken) {
            await signInGoogle(userInfo.data.idToken, userInfo?.data?.user?.name || "");
          } else {
            console.error("no id token/canelled login");
            posthog.capture("google-signin-error", { error: "no id token, or canceled login" });
            addNotification({
              id: generateId(),
              message: "Didn't log in please try again",
              type: NotificationType.error,
            });
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            addNotification({
              id: generateId(),
              message: "Error signing in, Google play unavailable",
              type: NotificationType.error,
            });
            // play services not available or outdated
          } else {
            // some other error happened
            console.error(error);
            posthog.capture("google-signin-error", { error: error.message });
            addNotification({
              id: generateId(),
              message: "Error signing in, please try again",
              type: NotificationType.error,
            });
          }
        }
      }}
    />
  );
});

export default GoogleAuthButton;
