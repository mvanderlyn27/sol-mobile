import { supabase } from "../lib/supabase";
import { Page, Font, Frame, Group, GroupMember, Profile, Reaction, Sticker, Template } from "../types/shared.types";

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
    const { data, error } = await supabase.from(table).upsert(payload);
    if (error) throw error;
    return toMap(data);
  },
  delete: async (table: SupabaseTable, payload: any) => {
    const { data, error } = await supabase.from(table).delete().eq("id", payload);
    if (error) throw error;
    return toMap(data);
  },
};
const toMap = (data: any) => {
  const record: Record<string, SupabaseTypes> = {};
  data.forEach((item: SupabaseTypes) => {
    record[item.id] = item;
  });
  return record;
};
