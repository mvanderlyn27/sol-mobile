import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useJournal } from "./JournalProvider";

//want to be able to show/hide the Profile menu from other routes, and keep teh selected route up to date
interface ProfileContextType {
  profileMenuVisible: boolean;
  setProfileMenuVisible: (val: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileMenuVisible, setProfileMenuVisible] = useState(true);
  return (
    <ProfileContext.Provider
      value={{
        profileMenuVisible,
        setProfileMenuVisible,
      }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const useProfile = useContext(ProfileContext);
  if (!useProfile) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return useProfile;
};
