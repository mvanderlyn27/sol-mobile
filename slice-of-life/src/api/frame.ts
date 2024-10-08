import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Frame, CreateFrameInput } from "@/src/types/shared.types";
export default class FrameService {
  static async getFrames(): Promise<SupabaseResponse<Frame[]>> {
    const { data, error } = await supabase.from("frames").select("*").order("id", { ascending: false });
    if (error) {
      console.error("Error fetching Frames:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async updateFrame(id: number, content: Frame): Promise<SupabaseResponse<Frame>> {
    const { data, error } = await supabase.from("frames").update(content).eq("id", id).select("*").single();
    if (error) {
      console.error("Error updating Frame:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }

  static async deleteFrame(id: number): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from("frames").delete().eq("id", id);
    if (error) {
      console.error("Error deleting Frame:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  }
  static async createFrame(content: CreateFrameInput): Promise<SupabaseResponse<Frame>> {
    const { data, error } = await supabase.from("frames").insert(content).select("*").single();
    if (error) {
      console.error("Error creating Frame:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
}
