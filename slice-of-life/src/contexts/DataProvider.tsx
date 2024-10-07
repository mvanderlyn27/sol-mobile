//provider for sharing out all data related to the backend
//should have loading and error states for each data type needed
//

/*

// src/context/DataProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/src/services/supabaseClient";
import { useAuth } from "./AuthProvider";

interface DataContextType {
  journalEntries: any[];
  libraryItems: any[];
  journalLoading: boolean;
  libraryLoading: boolean;
  journalError: string | null;
  libraryError: string | null;
  fetchJournalEntries: () => void;
  fetchLibraryItems: () => void;
  updateSettings: (newSettings: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [journalLoading, setJournalLoading] = useState<boolean>(false);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
      fetchLibraryItems();
    }
  }, [user]);

  const fetchJournalEntries = async () => {
    if (!user) return;

    setJournalLoading(true);
    setJournalError(null);

    const { data, error } = await supabase
      .from("journalEntries")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      setJournalError("Error fetching journal entries.");
      console.error("Error fetching journal entries:", error);
    } else {
      setJournalEntries(data || []);
    }

    setJournalLoading(false);
  };

  const fetchLibraryItems = async () => {
    if (!user) return;

    setLibraryLoading(true);
    setLibraryError(null);

    const { data, error } = await supabase
      .from("libraryItems")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      setLibraryError("Error fetching library items.");
      console.error("Error fetching library items:", error);
    } else {
      setLibraryItems(data || []);
    }

    setLibraryLoading(false);
  };

  const updateSettings = async (newSettings: any) => {
    if (!user) return;

    const { error } = await supabase
      .from("settings")
      .update(newSettings)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating settings:", error);
    } else {
      console.log("Settings updated successfully.");
    }
  };

  return (
    <DataContext.Provider
      value={{
        journalEntries,
        libraryItems,
        journalLoading,
        libraryLoading,
        journalError,
        libraryError,
        fetchJournalEntries,
        fetchLibraryItems,
        updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

*/
