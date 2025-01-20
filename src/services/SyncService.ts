//service to ensure local store is up to date with remote DB
import { ApiService, SupabaseTable } from "./ApiService";
import { ErrorService } from "./ErrorService";
import { posthog } from "./Posthog";
import { StoreService } from "./StoreService";

export const SyncService = {
  syncData: async (table: SupabaseTable) => {
    console.log("syncing data", table);
    try {
      const remoteData = await ApiService.getAll(table);
      // const localData = await StoreService.getLocalData(table);

      // Merge or reconcile data
      // const mergedData = reconcile(localData, remoteData);
      StoreService.setStore(table, remoteData);
    } catch (error) {
      ErrorService.handleError("Error syncing data", error);
    }
    //implement this later when we have local first changes
    //   pushPendingChanges: async (table: SupabaseTable, pendingChanges: any[]) => {
    //     for (const change of pendingChanges) {
    //       await ApiService.upsert(table, change);
    //     }
  },
};
