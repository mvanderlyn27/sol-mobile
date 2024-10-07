// src/contexts/AuthProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { AuthService, AuthResponse } from "@/src/api/auth";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator } from "react-native";

// Define the context type
interface AuthContextType {
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthResponse<Session>>;
  signUp: (email: string, password: string) => Promise<AuthResponse<Session>>;
  signOut: () => Promise<AuthResponse<null>>;
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

  const signIn = async (email: string, password: string): Promise<AuthResponse<Session>> => {
    const response = await AuthService.signIn(email, password);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(false);
    } else {
      setError(response.error || "Error signing in");
    }

    return response;
  };

  const signUp = async (email: string, password: string): Promise<AuthResponse<Session>> => {
    const response = await AuthService.signUp(email, password);

    if (response.success) {
      setSession(response.data || null);
      setError(null);
      setIsReady(false);
    } else {
      setError(response.error || "Error signing up");
    }

    return response;
  };

  const signOut = async (): Promise<AuthResponse<null>> => {
    const response = await AuthService.signOut();

    if (response.success) {
      setSession(null);
      setError(null);
      setIsReady(true);
    } else {
      setError(response.error || "Error signing out");
    }

    return response;
  };

  if (!isReady) {
    return <ActivityIndicator />;
  }
  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut, isReady, error }}>{children}</AuthContext.Provider>
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
