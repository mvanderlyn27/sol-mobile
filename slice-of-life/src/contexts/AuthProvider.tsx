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

// Define the context type
interface AuthContextType {
  session: Session | null;
  signIn: (email: string, password: string) => void;
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
      setSession(response.data || null);
      setError(null);
    } else {
      setError(response.error || "Error signing in");
      console.debug("Error signing in:", response.error);
      Toast.show("Error logging in", { duration: 3000 });
    }
    setIsReady(true);
    return;
  };
  const joinEmailList = async (email: string, name: string) => {
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
      setError(null);
    } else {
      setError(response.error || "Error signing up");
      console.debug("Error signing up:", response.error);
      Toast.show("Error signing up, please try again", { duration: 3000 });
    }
    setIsReady(true);
    return;
  };

  const signOut = async () => {
    setIsReady(false);
    const response = await AuthService.signOut();
    if (response.success) {
      setSession(null);
      setError(null);
      setIsReady(true);
    } else {
      setError(response.error || "Error signing out");
    }
  };
  const updateEmail = async (email: string) => {
    const response = await AuthService.updateEmail(email);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(true);
    } else {
      setError(response.error || "Error updating email");
    }
  };
  const updatePassword = async (password: string) => {
    const response = await AuthService.updatePassword(password);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(true);
    } else {
      setError(response.error || "Error updating password");
    }
  };
  const sendResetPasswordEmail = async (email: string) => {
    const response = await AuthService.sendResetPasswordEmail(email);
    if (response.success) {
      setSession(null);
      setError(null);
      setIsReady(true);
    } else {
      setError(response.error || "Error resetting password");
    }
  };
  if (!isReady) {
    return;
  }

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
