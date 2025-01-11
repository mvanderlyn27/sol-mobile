import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember, NotificationType, Profile } from "../types/shared.types";
import authStore$ from "./AuthStore";
import { posthog } from "../services/Posthog";
import { checkNotificationStatus, registerForPushNotificationsAsync } from "../services/PushNotification";
import { addNotification, notificationStore$ } from "./NotificationStore";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";
const name: string = "profiles-" + (process.env.APP_VARIANT || "");
export const profiles$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "profiles",
    select: (from) => from.select("*"),
  })
);
