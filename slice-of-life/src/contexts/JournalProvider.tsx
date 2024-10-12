import { ReactNode, createContext, useContext, useState } from "react";

//want to be able to show/hide the navigation menu from other routes, and keep teh selected route up to date
interface JournalContextType {
  viewMode: boolean;
  journalMenuVisible: boolean;
  bottomBarVisible: boolean;
  editMode: boolean;
  setViewMode: (val: boolean) => void;
  setJournalMenuVisible: (val: boolean) => void;
  setBottomBarVisible: (val: boolean) => void;
  setEditMode: (val: boolean) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [journalMenuVisible, setJournalMenuVisible] = useState(true);
  const [bottomBarVisible, setBottomBarVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  return (
    <JournalContext.Provider
      value={{
        viewMode,
        journalMenuVisible,
        bottomBarVisible,
        editMode,
        setViewMode,
        setJournalMenuVisible,
        setBottomBarVisible,
        setEditMode,
      }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = (): JournalContextType => {
  const useJournal = useContext(JournalContext);
  if (!useJournal) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return useJournal;
};
