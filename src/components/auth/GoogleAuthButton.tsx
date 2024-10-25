import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
import { supabase } from "@/src/lib/supabase";
import { usePostHog } from "posthog-react-native";
import Toast from "react-native-root-toast";
import { styled } from "nativewind";
import { Platform } from "react-native";
const StyledGoogleButton = styled(GoogleSigninButton);
export default function GoogleAuthButton() {
  //temporarily disable for android lol
  if (Platform.OS !== "ios") return null;
  const posthog = usePostHog();
  if (!process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID) {
    //if not oauth client don't render, won't show up for dev
    posthog.capture("missing-google-oauth-ios-client-id");
    console.log("missing-google-oauth-ios-client-id");
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
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: userInfo.data.idToken,
            });
            if (error) {
              console.error(error);
              posthog.capture("google-signin-error", { error: error.message });
              Toast.show("Error signing in, please try again soon", { duration: 3000 });
            }
          } else {
            console.error("no id token");
            posthog.capture("google-signin-error", { error: "no id token" });
            Toast.show("Error signing in", { duration: 3000 });
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            Toast.show("Error signing in, Google Play not available", { duration: 3000 });
            // play services not available or outdated
          } else {
            // some other error happened
            console.error(error);
            posthog.capture("google-signin-error", { error: error.message });
            Toast.show("Error signing in, please try again soon", { duration: 3000 });
          }
        }
      }}
    />
  );
}
