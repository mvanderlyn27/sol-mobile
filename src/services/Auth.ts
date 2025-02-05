import { AuthService } from "../api/auth";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { addNotification } from "../stores/NotificationStore";
import { NotificationType } from "../types/shared.types";
import { ErrorService } from "./ErrorService";
import { posthog } from "./Posthog";
import { handleSignup } from "./Profile";

export const joinEmailList = (email: string) => {
  if (process.env.EXPO_PUBLIC_ENV !== "production") return;
  const formBody = `userGroup=newUsers&mailingLists=cm2ccf528010n0ll77ael39hn&email=${encodeURIComponent(email)}`;

  fetch("https://app.loops.so/api/newsletter-form/cm2canqzn00eo12mp68bgy30l", {
    method: "POST",
    body: formBody,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};
export const signUp = async (email: string, password: string) => {
  authStore$.loading.set(true);
  authStore$.error.set(null);
  const response = await AuthService.signUp(email, password);
  joinEmailList(email);
  if (response.success) {
    posthog.identify(response.data?.user?.id, { email, user: response.data?.user });
    posthog.capture("user-signup", { email });
    authStore$.error.set(null);
    authStore$.session.set(response.data || null);
    const id = response.data?.user.id;
    if (!id) {
      console.log("error signing up no id");
      addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing up, try again" });
      return;
    }
    handleSignup(id);
    //   Toast for success
  } else {
    authStore$.error.set(response.error || "Error signing up");
    posthog.capture("user-signup-error", { email, error: response.error });
    addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing in, try again" });
    console.debug("Error signing up:", response.error);
    //TOAST HERE for error
  }
  authStore$.loading.set(false);
  return;
};
export const signIn = async (email: string, password: string) => {
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
      addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing in, try again" });
      authStore$.error.set("no user session returned");
    }
  } else {
    posthog.capture("user-failed-login", { email, error: response.error });
    authStore$.error.set(response.error || "Error signing in");
    addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing in, try again" });
    console.debug("Error signing in:", response.error);
    //   Toast.show("Error logging in", { duration: 3000 });
  }
  authStore$.loading.set(false);
};
export const signInApple = async (token: string, name: string) => {
  const response = await AuthService.signInWithIdToken(token, "apple");
  if (response.success && response?.data?.user) {
    posthog.identify(response.data.user.id, {
      name: name,
      email: response.data.user.email,
      user: response.data.user,
    });
    posthog.capture("sign-in-with-apple-success", { email: response.data.user.email });
    authStore$.session.set(response.data);
    const id = response.data.user.id;
    if (!id) {
      console.log("error signing in no id");
      addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing up, try again" });
      return;
    }
    handleSignup(id);
  } else {
    posthog.capture("sign-in-with-apple-failed", { error: response.error || "missing user" });
    //   Toast.show("Error logging in, " + response.error, { duration: 3000 });
    addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing up, try again" });
    authStore$.error.set(response.error || "Error signing in");
  }
  authStore$.loading.set(false);
};
export const signInGoogle = async (token: string, name: string) => {
  const response = await AuthService.signInWithIdToken(token, "google");
  if (response.success && response?.data?.user) {
    posthog.identify(response.data.user.id, {
      name: name,
      email: response.data.user.email,
      user: response.data.user,
    });
    posthog.capture("sign-in-with-google-success", { email: response.data.user.email });
    authStore$.session.set(response.data);
    const id = response.data.user.id;
    if (!id) {
      console.log("error signing in no id");
      addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing up, try again" });
      return;
    }
    handleSignup(id);
  } else {
    posthog.capture("sign-in-with-google-failed", { error: response.error || "missing user" });
    //   Toast.show("Error logging in, " + response.error, { duration: 3000 });
    authStore$.error.set(response.error || "Error signing in");
    addNotification({ id: generateId(), type: NotificationType.error, message: "Error signing up, try again" });
  }
  authStore$.loading.set(false);
};
export const signOut = async () => {
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
};
export const updateEmail = async (email: string) => {
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
};
export const updatePassword = async (password: string) => {
  const response = await AuthService.updatePassword(password);

  if (response.success) {
    posthog.capture("user-update-password", { password: password });
    authStore$.session.set(response.data || null);
    authStore$.error.set(null);
    authStore$.loading.set(false);
    return true;
  } else {
    posthog.capture("user-update-password-error", {
      email: authStore$.session.get()?.user.email,
      error: response.error,
    });
    authStore$.error.set(response.error + "");
    authStore$.loading.set(false);
    return false;
  }
};
export const forgotPassword = async (email: string) => {
  console.log("resetting email: " + email);
  const response = await AuthService.sendResetPasswordEmail(email);
  if (response.success) {
    posthog.capture("user-reset-password", { email: email });
    authStore$.session.set(response.data || null);
    authStore$.error.set(null);
    authStore$.loading.set(false);
    return true;
  } else {
    authStore$.error.set(response.error + "");
    ErrorService.handleError("reset-password-error", JSON.stringify(response.error));
    authStore$.error.set(response.error + "");
    authStore$.loading.set(false);
    return false;
  }
};
export const loginWithOtp = async (email: string, otp: string) => {
  console.log("logging in with otp: " + email + "otp: " + otp);
  const response = await AuthService.signInWithOtp(otp, email);
  if (response.success) {
    posthog.capture("login-otp-success", { email: email });
    authStore$.session.set(response.data || null);
    authStore$.error.set(null);
    authStore$.loading.set(false);
    return true;
  } else {
    authStore$.error.set(response.error + "");
    ErrorService.handleError("login-otp-failed", JSON.stringify(response.error));
    authStore$.error.set(response.error + "");
    authStore$.loading.set(false);
    return false;
  }
};
