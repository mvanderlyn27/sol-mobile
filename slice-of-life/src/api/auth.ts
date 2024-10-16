// src/services/AuthService.ts
import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Session, VerifyTokenHashParams } from "@supabase/supabase-js";
import * as Linking from "expo-linking";

export class AuthService {
  /**
   * Sign up a new user with email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns SupabaseResponse containing success status, data, or error.
   */
  static async signUp(email: string, password: string, name: string): Promise<SupabaseResponse<Session>> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name } },
    });

    if (error) {
      console.debug("Sign-up error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data.session };
  }

  /**
   * Sign in an existing user with email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns SupabaseResponse containing success status, data, or error.
   */
  static async signIn(email: string, password: string): Promise<SupabaseResponse<Session>> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.debug("Sign-in error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data.session };
  }
  static async signInWithToken(tokenHash: string): Promise<SupabaseResponse<Session>> {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
    if (error) {
      console.debug("Error signing in with token:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data.session };
  }

  /**
   * Sign out the current user.
   * @returns SupabaseResponse indicating whether the sign-out was successful.
   */
  static async signOut(): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.debug("Sign-out error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  static async updatePassword(password: string): Promise<SupabaseResponse<Session>> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.debug("Error updating password:", error);
      return { success: false, error: error.message };
    }
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.debug("Error refreshing", refreshError);
      return { success: false, error: refreshError.message };
    }
    return { success: true, data: data.session };
  }
  static async updateEmail(email: string): Promise<SupabaseResponse<Session>> {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      console.debug("Error updating email:", error);
      return { success: false, error: error.message };
    }
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.debug("Error refreshing", refreshError);
      return { success: false, error: refreshError.message };
    }
    return { success: true, data: data.session };
  }
  static async sendResetPasswordEmail(email: string): Promise<SupabaseResponse<null>> {
    // const resetPasswordURL = Linking.createURL("callback/resetPassword");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {});
    if (error) {
      console.debug("Error sending reset password email:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  static async deleteAccount(): Promise<SupabaseResponse<null>> {
    //need to implement server function that does all this
    // const { error } = await supabase.rpc("delete_account");
    // if (error) {
    //   console.error("Error deleting account:", error);
    //   return { success: false, error: error.message };
    // }
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
