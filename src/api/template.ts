import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Template, CreateTemplateInput } from "@/src/types/shared.types";
export default class TemplateService {
  static async getTemplates(): Promise<SupabaseResponse<Template[]>> {
    const { data, error } = await supabase.from("templates").select("*").order("id", { ascending: false });
    if (error) {
      console.error("Error fetching Templates:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async updateTemplate(id: number, content: Template): Promise<SupabaseResponse<Template>> {
    const { data, error } = await supabase.from("templates").update(content).eq("id", id).select("*").single();
    if (error) {
      console.error("Error updating Template:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }

  static async deleteTemplate(id: number): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) {
      console.error("Error deleting Template:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  }
  static async createTemplate(content: CreateTemplateInput): Promise<SupabaseResponse<Template>> {
    const { data, error } = await supabase.from("templates").insert(content).select("*").single();
    if (error) {
      console.error("Error creating Template:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
}
