// src/contexts/AuthProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { AuthService } from "@/src/api/auth";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator, View } from "react-native";
import { SupabaseResponse } from "../lib/supabase";
import LoadingScreen from "../components/screens/LoadingScreen";
import Toast from "react-native-root-toast";
import { Redirect } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { usePostHog } from "posthog-react-native";

// Define the context type
interface AuthContextType {
  session: Session | null;
  signIn: (email: string, password: string) => void;
  signInWithToken: (tokenHash: string, method?: string) => void;
  signUp: (email: string, password: string, name: string) => void;
  signOut: () => void;
  updateEmail: (email: string) => void;
  updatePassword: (password: string) => void;
  sendResetPasswordEmail: (email: string) => void;
  isReady: boolean;
  error: string | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();

  useEffect(() => {
    AuthService.getSession()
      .then((session) => {
        setSession(session);
        setIsReady(true);
      })
      .catch((error) => {
        console.debug("Error getting session:", error);
        setSession(null);
        setIsReady(true);
      });
    AuthService.setupSessionListener(setSession);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsReady(false);
    setError(null);
    const response = await AuthService.signIn(email, password);

    if (response.success) {
      console.log("logged in");
      if (response?.data?.user) {
        posthog.identify(response.data.user.id, { email, user: response.data.user });
        posthog.capture("user-logged-in", { email });
        setSession(response.data);
        setError(null);
      } else {
        posthog.capture("user-failed-login", { email, error: "no user session returned" });
        setSession(null);
        setError("no user session returned");
      }
    } else {
      posthog.capture("user-failed-login", { email, error: response.error });
      setError(response.error || "Error signing in");
      console.debug("Error signing in:", response.error);
      Toast.show("Error logging in", { duration: 3000 });
    }
    setIsReady(true);
    return;
  };
  const joinEmailList = async (email: string, name: string) => {
    if (process.env.NODE_ENV !== "production") return;
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
  };
  const signUp = async (email: string, password: string, name: string) => {
    setIsReady(false);
    setError(null);
    const response = await AuthService.signUp(email, password, name);
    joinEmailList(email, name);
    if (response.success) {
      setSession(response.data || null);
      posthog.capture("user-signup", { email });
      Toast.show("Check email for verification", {
        duration: 3000,
        position: Toast.positions.BOTTOM,
        backgroundColor: "#E7DBCB",
        opacity: 1,
        shadow: false,
        textColor: "#262326",
      });
      setError(null);
    } else {
      setError(response.error || "Error signing up");
      posthog.capture("user-signup-error", { email, error: response.error });
      console.debug("Error signing up:", response.error);
      Toast.show("Error signing up, please try again", {
        duration: 3000,
        position: Toast.positions.BOTTOM,
        backgroundColor: "red",
        textColor: "white",
      });
    }
    setIsReady(true);
    return;
  };

  const signOut = async () => {
    setIsReady(false);
    const email = session?.user?.email;
    const response = await AuthService.signOut();
    if (response.success) {
      posthog.capture("user-logout", { email: email });
      posthog.reset();
      setSession(null);
      setError(null);
      setIsReady(true);
    } else {
      posthog.capture("user-logout-error", { email: email, error: response.error });
      setError(response.error || "Error signing out");
    }
  };
  const updateEmail = async (email: string) => {
    const response = await AuthService.updateEmail(email);

    if (response.success) {
      posthog.capture("user-update-email", { email });
      setSession(response.data || null);
      setError(null);
      setIsReady(true);
    } else {
      posthog.capture("user-update-email-error", { email, error: response.error });
      setError(response.error || "Error updating email");
    }
  };
  const updatePassword = async (password: string) => {
    const response = await AuthService.updatePassword(password);

    if (response.success) {
      posthog.capture("user-update-password", { email: session?.user?.email });
      setSession(response.data || null);
      setError(null);
      setIsReady(true);
    } else {
      posthog.capture("user-update-password-error", { email: session?.user?.email, error: response.error });
      setError(response.error || "Error updating password");
    }
  };
  const sendResetPasswordEmail = async (email: string) => {
    const resetPasswordURL = Linking.createURL("/resetPassword");
    const response = await AuthService.sendResetPasswordEmail(email);
    if (response.success) {
      setSession(null);
      setError(null);
      posthog.capture("user-reset-password", { email });
      Toast.show("Check your email to reset your password", {});
      setIsReady(true);
    } else {
      posthog.capture("user-reset-password-error", { email, error: response.error });
      setError(response.error || "Error resetting password");
      setIsReady(true);
    }
  };

  const signInWithToken = async (tokenHash: string, method?: string) => {
    const response = await AuthService.signInWithToken(tokenHash);
    if (response.success) {
      const session = response.data;
      if (session === null || session === undefined) {
        setIsReady(true);
        setError("Error logging in");
        posthog.capture("user-logged-in-with-token-error", { method: method, token: tokenHash, error: response.error });
        router.push("/login");
        return;
      }
      setSession(session);
      posthog.identify(session.user.id, { email: session.user.email, user: session.user });
      posthog.capture("user-logged-in-with-token", {
        method: method,
        tokenHash: tokenHash,
        email: response?.data?.user?.email,
      });
      setError(null);
      setIsReady(true);
      if (method === "verifyEmail") {
        router.push("/resetPassword");
      } else if (method === "resetPassword") {
        router.push("/resetPassword");
      }
    } else {
      setIsReady(true);
      posthog.capture("user-logged-in-with-token-error", { method: method, token: tokenHash, error: response.error });
      setError(response.error || "Error logging in");
      router.push("/login");
    }
  };

  return (
    <AnimatePresence>
      {!isReady && (
        <MotiView
          style={{ flex: 1, backgroundColor: "transparent" }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 500 }}>
          <LoadingScreen />
        </MotiView>
      )}
      {isReady && (
        <MotiView
          style={{ flex: 1, backgroundColor: "transparent" }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 500 }}>
          <AuthContext.Provider
            value={{
              session,
              signIn,
              signInWithToken,
              signUp,
              signOut,
              updateEmail,
              updatePassword,
              sendResetPasswordEmail,
              isReady,
              error,
            }}>
            {children}
          </AuthContext.Provider>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
