import { mergeIntoObservable } from "@legendapp/state";
import { pages$ } from "../stores/PagesStore";
import { reactions$ } from "../stores/ReactStore";
import { SupabaseTable } from "./ApiService";
import { undoRedo } from "@legendapp/state/helpers/undoRedo";
import { groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
import { profiles$ } from "../stores/ProfileStore";

export const StoreService = {
  //     initializeStore(tableName) {
  //         //switch on what table to init
  //     //   const store = observable([]);
  //     //   return store;
  //     },
  //     resetStore(tableName) {
  //     //   const store = observable([]);
  //     //   return store;
  //     },
  //   };
  setStore: (tableName: SupabaseTable, data: any) => {
    //switch on what table to update
    switch (tableName) {
      case "pages":
        console.log("setting pages");
        pages$.set(data);
        return;
      case "reactions":
        reactions$.set(data);
        return;
      case "groups":
        groups$.set(data);
        return;
      case "group_members":
        groupMembers$.set(data);
        return;
      case "profiles":
        profiles$.set(data);
        return;
      default:
        throw new Error("Table not found");
    }
  },
  getStoreValue: (tableName: SupabaseTable, id: string) => {
    switch (tableName) {
      case "pages":
        return pages$[id].get();
      case "reactions":
        return reactions$[id].get();
      case "groups":
        return groups$[id].get();
      case "group_members":
        return groupMembers$[id].get();
      case "profiles":
        return profiles$[id].get();
      default:
        throw new Error("Table not found");
    }
  },
  updateStore: (tableName: SupabaseTable, data: any) => {
    //UPDATE THE STORE, UPDATE DB, IF FAILED, ROLLBACK
    console.log("udpate store", tableName);
    switch (tableName) {
      case "pages":
        console.log("date", data);
        pages$[data.id].set(data);
        return;
      case "reactions":
        console.log("reactions", data);
        reactions$[data.id].set(data);
        return;
      case "groups":
        groups$[data.id].set(data);
        return;
      case "group_members":
        groupMembers$[data.id].set(data);
        return;
      case "profiles":
        profiles$[data.id].set(data);
        return;
      default:
        throw new Error("Table not found");
    }
  },
  removeStore: (tableName: SupabaseTable, id: string) => {
    console.log("removing store", tableName, id);
    switch (tableName) {
      case "pages":
        pages$[id].delete();
        return;
      case "reactions":
        reactions$[id].delete();
        return;
      case "groups":
        groups$[id].delete();
        return;
      case "group_members":
        groupMembers$[id].delete();
        return;
      case "profiles":
        profiles$[id].delete();
        return;
      default:
        throw new Error("Table not found");
    }
  },

  // NEED SOMETHING FOR DELETING VALUES
};

//journal store
//  all info to render current journal

//profile store
//  profiles info

//appstate store
