import { RealtimeChannel, createClient } from "@supabase/supabase-js";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import { supabase } from "../lib/supabase";
import { SupabaseTable } from "./ApiService";

export const RealtimeService = {
  subscriptions: [] as RealtimeChannel[],

  /**
   * Subscribe to a table's changes.
   * @param {string} table - The table to subscribe to.
   * @param {(payload: any) => void} callback - The function to call on table change.
   */
  subscribeToTable: (table: SupabaseTable, callback: (payload: any) => void) => {
    const channel = supabase
      .channel(`table-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        // console.log(`Change in table "${table}":`, payload);
        // console.log("\n");
        callback(payload);
      })
      .subscribe();

    // Add to subscription list for cleanup
    RealtimeService.subscriptions.push(channel);

    return channel;
  },

  /**
   * Unsubscribe from all active subscriptions.
   */
  unsubscribeAll: () => {
    RealtimeService.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    RealtimeService.subscriptions = [];
  },

  /**
   * Initialize subscriptions with automatic reconnection when app is active and online.
   * @param {() => void} setupCallback - Function to reinitialize subscriptions.
   */
  initWithReconnection: (setupCallback: () => void) => {
    // Reconnect on network status change
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log("Network reconnected, reinitializing subscriptions...");
        setupCallback();
      }
    });

    // Reconnect when app comes to the foreground
    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        console.log("App is active, reinitializing subscriptions...");
        setupCallback();
      }
    });

    // Cleanup listeners when no longer needed
    return () => {
      unsubscribeNetInfo();
      appStateListener.remove();
    };
  },
};
