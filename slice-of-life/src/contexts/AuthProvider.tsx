// src/contexts/AuthProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { AuthService } from "@/src/api/auth";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator } from "react-native";
import { SupabaseResponse } from "../lib/supabase";

// Define the context type
interface AuthContextType {
  session: Session | null;
  signIn: (email: string, password: string) => void;
  signUp: (email: string, password: string) => void;
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
    AuthService.getSession().then((session) => {
      setSession(session);
      setIsReady(true);
    });
    AuthService.setupSessionListener(setSession);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await AuthService.signIn(email, password);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(false);
    } else {
      setError(response.error || "Error signing in");
    }
  };

  const signUp = async (email: string, password: string) => {
    const response = await AuthService.signUp(email, password);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(false);
    } else {
      setError(response.error || "Error signing up");
    }
  };

  const signOut = async () => {
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
      setIsReady(false);
    } else {
      setError(response.error || "Error updating email");
    }
  };
  const updatePassword = async (password: string) => {
    const response = await AuthService.updatePassword(password);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(false);
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
    return <ActivityIndicator />;
  }
  return (
    <AuthContext.Provider
      value={{ session, signIn, signUp, signOut, updateEmail, updatePassword, sendResetPasswordEmail, isReady, error }}>
      {children}
    </AuthContext.Provider>
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
