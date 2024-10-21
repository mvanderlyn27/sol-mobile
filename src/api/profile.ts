import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Profile, CreateProfileInput } from "@/src/types/shared.types";
export default class ProfileService {
  static async getProfile(id: string): Promise<SupabaseResponse<Profile>> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (error) {
      console.error("Error fetching Profiles:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async updateProfile(id: string, content: Profile): Promise<SupabaseResponse<Profile>> {
    const { data, error } = await supabase.from("profiles").update(content).eq("id", id).select("*").single();
    if (error) {
      console.error("Error updating Profile:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }

  static async deleteProfile(id: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      console.error("Error deleting Profile:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  }
  static async createProfile(content: CreateProfileInput): Promise<SupabaseResponse<Profile>> {
    const { data, error } = await supabase.from("profiles").insert(content).select("*").single();
    if (error) {
      console.error("Error creating Profile:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
}
