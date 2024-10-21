import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Page, CreatePageInput } from "@/src/types/shared.types";
export default class PageService {
  static async getPages(): Promise<SupabaseResponse<Page[]>> {
    const { data, error } = await supabase.from("pages").select("*").order("id", { ascending: false });
    if (error) {
      console.error("Error fetching pages:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async getPage(id: number): Promise<SupabaseResponse<Page>> {
    const { data, error } = await supabase.from("pages").select("*").eq("id", id).single();
    if (error) {
      console.error("Error fetching page:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async updatePage(id: number, content: Page): Promise<SupabaseResponse<Page>> {
    const { data, error } = await supabase.from("pages").update(content).eq("id", id).select("*").single();
    if (error) {
      console.error("Error updating page:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }

  static async deletePage(id: number): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      console.error("Error deleting page:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  }
  static async createPage(content: CreatePageInput): Promise<SupabaseResponse<Page>> {
    const { data, error } = await supabase.from("pages").insert(content).select("*").single();
    if (error) {
      console.error("Error creating page:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
}
