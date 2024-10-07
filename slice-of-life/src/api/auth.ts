// src/services/AuthService.ts
import { supabase } from "@/src/lib/supabase";
import { Session } from "@supabase/supabase-js";

export interface AuthResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string;
}

export class AuthService {
  /**
   * Sign up a new user with email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns AuthResponse containing success status, data, or error.
   */
  static async signUp(email: string, password: string): Promise<AuthResponse<Session>> {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Sign-up error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data.session };
  }

  /**
   * Sign in an existing user with email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns AuthResponse containing success status, data, or error.
   */
  static async signIn(email: string, password: string): Promise<AuthResponse<Session>> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Sign-in error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data.session };
  }

  /**
   * Sign out the current user.
   * @returns AuthResponse indicating whether the sign-out was successful.
   */
  static async signOut(): Promise<AuthResponse<null>> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  static async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data?.session;
  }
  static setupSessionListener(onChange: (session: Session | null) => void) {
    supabase.auth.onAuthStateChange((_event, session) => {
      onChange(session);
    });
  }
}
