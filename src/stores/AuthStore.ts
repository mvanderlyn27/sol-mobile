import { observable } from "@legendapp/state";
import { AuthService } from "../api/auth";
import { Session } from "@supabase/supabase-js";
import { posthog } from "../services/Posthog";
interface AuthStore {
  session: Session | null;
  error: string | null;
  loading: boolean;
  init: () => void;
  joinEmailList: (email: string, name: string) => void;
  signUp: (email: string, password: string, name: string) => void;
  signIn: (email: string, password: string) => void;
  signInApple: (token: string, name: string) => void;
  signInGoogle: (token: string, name: string) => void;
  signOut: () => void;
  updateEmail: (email: string) => void;
  updatePassword: (password: string) => void;
}
const authStore$ = observable<AuthStore>({
  session: null,
  error: null,
  loading: true,
  init: () => {
    authStore$.loading.set(true);
    AuthService.getSession()
      .then((session: Session | null) => {
        authStore$.session.set(session);
        authStore$.loading.set(false);
      })
      .catch((error) => {
        console.debug("Error getting session:", error);
        authStore$.session.set(null);
        authStore$.loading.set(false);
      });
    AuthService.setupSessionListener(authStore$.session.set);
  },
  joinEmailList: (email: string, name: string) => {
    if (process.env.EXPO_PUBLIC_ENV !== "production") return;
    const formBody = `userGroup=newUsers&mailingLists=cm2ccf528010n0ll77ael39hn&email=${encodeURIComponent(
      email
    )}&firstName=${encodeURIComponent(name)}`;

    fetch("https://app.loops.so/api/newsletter-form/cm2canqzn00eo12mp68bgy30l", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },
  signUp: async (email: string, password: string, name: string) => {
    authStore$.loading.set(true);
    authStore$.error.set(null);
    const response = await AuthService.signUp(email, password, name);
    authStore$.joinEmailList(email, name);
    if (response.success) {
      authStore$.session.set(response.data || null);
      posthog.identify(response.data?.user?.id, { name: name, email, user: response.data?.user });
      posthog.capture("user-signup", { email });
      authStore$.error.set(null);
      //   Toast for success
    } else {
      authStore$.error.set(response.error || "Error signing up");
      posthog.capture("user-signup-error", { email, error: response.error });
      console.debug("Error signing up:", response.error);
      //TOAST HERE for error
    }
    authStore$.loading.set(false);
    return;
  },
  signIn: async (email: string, password: string) => {
    authStore$.loading.set(true);
    authStore$.error.set(null);
    const response = await AuthService.signIn(email, password);

    if (response.success) {
      console.log("logged in");
      if (response?.data?.user) {
        posthog.identify(response.data.user.id, { email, user: response.data.user });
        posthog.capture("user-logged-in", { email });
        authStore$.session.set(response.data);
        authStore$.error.set(null);
      } else {
        posthog.capture("user-failed-login", { email, error: "no user session returned" });
        authStore$.session.set(null);
        authStore$.error.set("no user session returned");
      }
    } else {
      posthog.capture("user-failed-login", { email, error: response.error });
      authStore$.error.set(response.error || "Error signing in");
      console.debug("Error signing in:", response.error);
      //   Toast.show("Error logging in", { duration: 3000 });
    }
    authStore$.loading.set(false);
  },
  signInApple: async (token: string, name: string) => {
    const response = await AuthService.signInWithIdToken(token, "apple");
    if (response.success && response?.data?.user) {
      posthog.identify(response.data.user.id, {
        name: name,
        email: response.data.user.email,
        user: response.data.user,
      });
      posthog.capture("sign-in-with-apple-success", { email: response.data.user.email });
      authStore$.session.set(response.data);
    } else {
      posthog.capture("sign-in-with-apple-failed", { error: response.error || "missing user" });
      //   Toast.show("Error logging in, " + response.error, { duration: 3000 });
      authStore$.error.set(response.error || "Error signing in");
    }
    authStore$.loading.set(false);
  },
  signInGoogle: async (token: string, name: string) => {
    const response = await AuthService.signInWithIdToken(token, "google");
    if (response.success && response?.data?.user) {
      posthog.identify(response.data.user.id, {
        name: name,
        email: response.data.user.email,
        user: response.data.user,
      });
      posthog.capture("sign-in-with-google-success", { email: response.data.user.email });
      authStore$.session.set(response.data);
    } else {
      posthog.capture("sign-in-with-google-failed", { error: response.error || "missing user" });
      //   Toast.show("Error logging in, " + response.error, { duration: 3000 });
      authStore$.error.set(response.error || "Error signing in");
    }
    authStore$.loading.set(false);
  },
  signOut: async () => {
    authStore$.loading.set(true);
    const email = authStore$.session?.user?.email;
    const response = await AuthService.signOut();
    if (response.success) {
      posthog.capture("user-logout", { email: email });
      posthog.reset();
      authStore$.session.set(null);
      authStore$.error.set(null);
    } else {
      posthog.capture("user-logout-error", { email: email, error: response.error });
      authStore$.error.set(response.error || "Error signing out");
    }
    authStore$.loading.set(false);
  },
  updateEmail: async (email: string) => {
    const response = await AuthService.updateEmail(email);

    if (response.success) {
      posthog.capture("user-update-email", { email });
      authStore$.session.set(response.data || null);
      authStore$.error.set(null);
      authStore$.loading.set(false);
    } else {
      posthog.capture("user-update-email-error", { email, error: response.error });
      authStore$.error.set(response.error + "");
      authStore$.loading.set(false);
    }
  },
  updatePassword: async (password: string) => {
    const response = await AuthService.updatePassword(password);

    if (response.success) {
      posthog.capture("user-update-password", { password: password });
      authStore$.session.set(response.data || null);
      authStore$.error.set(null);
      authStore$.loading.set(false);
    } else {
      posthog.capture("user-update-password-error", {
        email: authStore$.session.get()?.user.email,
        error: response.error,
      });
      authStore$.error.set(response.error + "");
      authStore$.loading.set(false);
    }
  },
});
export default authStore$;
