import { mergeIntoObservable } from "@legendapp/state";
import { pages$ } from "../stores/PagesStore";
import { reactions$ } from "../stores/ReactStore";
import { SupabaseTable } from "./ApiService";
import { undoRedo } from "@legendapp/state/helpers/undoRedo";

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
      default:
        throw new Error("Table not found");
    }
  },
  removeStore: (tableName: SupabaseTable, id: string) => {
    switch (tableName) {
      case "pages":
        const { undo: undoPages } = undoRedo(pages$[id], { limit: 5 });
        pages$[id].delete();
        return undoPages;
      case "reactions":
        const { undo: undoReactions } = undoRedo(reactions$[id], { limit: 5 });
        reactions$[id].delete();
        return undoReactions;
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
