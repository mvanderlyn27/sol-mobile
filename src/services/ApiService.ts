import { supabase } from "../lib/supabase";
import { Page, Font, Frame, Group, GroupMember, Profile, Reaction, Sticker, Template } from "../types/shared.types";
import { ErrorService } from "./ErrorService";
import { StoreService } from "./StoreService";

export type SupabaseTable =
  | "fonts"
  | "frames"
  | "group_members"
  | "groups"
  | "profiles"
  | "notifications"
  | "pages"
  | "reactions"
  | "stickers"
  | "templates"
  | "waitlist";
export type SupabaseTypes = Page | Font | Frame | Group | GroupMember | Profile | Reaction | Sticker | Template;

export const ApiService = {
  getAll: async (table: SupabaseTable) => {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return toMap(data);
  },
  insert: async (table: SupabaseTable, payload: any) => {
    const { data, error } = await supabase.from(table).insert(payload);
    if (error) throw error;
    return toMap(data);
  },
  update: async (table: SupabaseTable, payload: any) => {
    const { data, error } = await supabase.from(table).update(payload);
    if (error) throw error;
    return toMap(data);
  },
  upsert: async (table: SupabaseTable, payload: any) => {
    //no return
    const { error } = await supabase.from(table).upsert(payload);
    if (error) throw error;
    return;
  },
  delete: async (table: SupabaseTable, payload: any) => {
    const { data, error } = await supabase.from(table).delete().eq("id", payload);
    if (error) throw error;
    return toMap(data);
  },
  optimisticSave: async (table: SupabaseTable, payload: any) => {
    //sets local store, then saves data to save
    const curValue = StoreService.getStoreValue(table, payload.id);
    StoreService.updateStore(table, payload);
    try {
      await ApiService.upsert(table, payload);
      return { error: null };
    } catch (error) {
      StoreService.updateStore(table, curValue);
      ErrorService.handleError("Error syncing data", JSON.stringify(error));
      return { error };
    }
  },
  optimisticDelete: async (table: SupabaseTable, id: string) => {
    const curValue = StoreService.getStoreValue(table, id);
    try {
      StoreService.removeStore(table, id);
      await ApiService.delete(table, id);
      return { error: null };
    } catch (error) {
      StoreService.updateStore(table, curValue);
      ErrorService.handleError("Error syncing data", JSON.stringify(error));
      return { error };
    }
  },
};
const toMap = (data: any) => {
  const record: Record<string, SupabaseTypes> = {};
  data.forEach((item: SupabaseTypes) => {
    record[item.id] = item;
  });
  return record;
};
