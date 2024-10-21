import { SupabaseResponse, supabase } from "@/src/lib/supabase";
import { FileUploadInput } from "../types/shared.types";
import { decode } from "base64-arraybuffer";

// Define a standard response type for the service

export default class StorageService {
  /**
   * Uploads a file to the specified bucket in Supabase storage.
   * @param bucketName - The name of the bucket.
   * @param filePath - The file path within the bucket.
   * @param file - The file object to upload.
   * @returns A standardized response object indicating success or error.
   */
  static async uploadFile(info: FileUploadInput): Promise<SupabaseResponse<string>> {
    const { data, error } = await supabase.storage
      .from(info.bucket)
      .upload(info.filePath, decode(info.base64), { contentType: info.mimeType, upsert: true });

    if (error) {
      return { success: false, data: null, error: error.message };
    }
    return { success: true, data: data?.path || null };
  }

  /**
   * Downloads a file from the specified bucket in Supabase storage.
   * @param bucketName - The name of the bucket.
   * @param filePath - The file path within the bucket.
   * @returns A standardized response object containing the file Blob or error.
   */
  static async downloadFile(bucketName: string, filePath: string): Promise<SupabaseResponse<Blob>> {
    const { data, error } = await supabase.storage.from(bucketName).download(filePath);

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * Deletes a file from the specified bucket in Supabase storage.
   * @param bucketName - The name of the bucket.
   * @param filePath - The file path within the bucket.
   * @returns A standardized response object indicating success or error.
   */
  static async deleteFile(bucketName: string, filePath: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: null };
  }

  /**
   * Lists all files in a specified bucket or folder in Supabase storage.
   * @param bucketName - The name of the bucket.
   * @param folderPath - The folder path within the bucket (optional).
   * @returns A standardized response object containing the list of files or error.
   */
  static async listFiles(bucketName: string, folderPath: string = ""): Promise<SupabaseResponse<any[]>> {
    const { data, error } = await supabase.storage.from(bucketName).list(folderPath);

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  /**
   * Generates a public URL for a file in the specified bucket.
   * @param bucketName - The name of the bucket.
   * @param filePath - The file path within the bucket.
   * @returns A standardized response object containing the public URL or error.
   */
  static getPublicUrl(bucketName: string, filePath: string): SupabaseResponse<string> {
    const {
      data: { publicUrl: publicURL },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return { success: true, data: publicURL || null };
  }
}
