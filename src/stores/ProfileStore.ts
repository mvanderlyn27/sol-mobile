import { observable } from "@legendapp/state";
// import { customSupabaseSynced, generateId } from "./AsyncStorage";
import { GroupMember, NotificationType, Profile } from "../types/shared.types";
// import authStore$ from "./AuthStore";
// import { posthog } from "../services/Posthog";
// import { checkNotificationStatus, registerForPushNotificationsAsync } from "../services/PushNotification";
// import { addNotification, notificationStore$ } from "./NotificationStore";
// import Constants from "expo-constants";
// import { supabase } from "../lib/supabase";
// const name: string = "profiles-" + (process.env.APP_VARIANT || "");
// export const profiles$ = observable(
//   customSupabaseSynced({
//     supabase,
//     collection: "profiles",
//     realtime: true,
//     persist: {
//       name: `profiles-${process.env.APP_VARIANT}`,
//       retrySync: true, // Persist pending changes and retry
//     },
//     retry: {
//       infinite: true, // Retry changes with exponential backoff
//     },
//     select: (from) => from.select("*"),
//   })
// );

export const profiles$ = observable<Record<string, Profile>>();
