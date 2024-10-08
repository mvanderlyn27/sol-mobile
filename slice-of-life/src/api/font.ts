import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Font, CreateFontInput } from "@/src/types/shared.types";
export default class FontService {
  static async getFonts(): Promise<SupabaseResponse<Font[]>> {
    const { data, error } = await supabase.from("fonts").select("*").order("id", { ascending: false });
    if (error) {
      console.error("Error fetching Fonts:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async updateFont(id: number, content: Font): Promise<SupabaseResponse<Font>> {
    const { data, error } = await supabase.from("fonts").update(content).eq("id", id).select("*").single();
    if (error) {
      console.error("Error updating Font:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }

  static async deleteFont(id: number): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from("fonts").delete().eq("id", id);
    if (error) {
      console.error("Error deleting Font:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  }
  static async createFont(content: CreateFontInput): Promise<SupabaseResponse<Font>> {
    const { data, error } = await supabase.from("fonts").insert(content).select("*").single();
    if (error) {
      console.error("Error creating Font:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
}
