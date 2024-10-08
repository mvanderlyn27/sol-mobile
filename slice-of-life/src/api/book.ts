import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { Book, CreateBookInput } from "@/src/types/shared.types";
export default class BookService {
  static async getBooks(): Promise<SupabaseResponse<Book[]>> {
    const { data, error } = await supabase.from("books").select("*").order("id", { ascending: false });
    if (error) {
      console.error("Error fetching Books:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
  static async updateBook(id: number, content: Book): Promise<SupabaseResponse<Book>> {
    const { data, error } = await supabase.from("books").update(content).eq("id", id).select("*").single();
    if (error) {
      console.error("Error updating Book:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }

  static async deleteBook(id: number): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      console.error("Error deleting Book:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  }
  static async createBook(content: CreateBookInput): Promise<SupabaseResponse<Book>> {
    const { data, error } = await supabase.from("books").insert(content).select("*").single();
    if (error) {
      console.error("Error creating Book:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  }
}
