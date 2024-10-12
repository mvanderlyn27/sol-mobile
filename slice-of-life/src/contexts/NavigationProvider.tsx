import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useJournal } from "./JournalProvider";

//want to be able to show/hide the navigation menu from other routes, and keep teh selected route up to date
interface NavigationContextType {
  navMenuVisible: boolean;
  menuOpen: boolean;
  setNavMenuVisible: (val: boolean) => void;
  setMenuOpen: (val: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navMenuVisible, setNavMenuVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <NavigationContext.Provider
      value={{
        navMenuVisible,
        menuOpen,
        setMenuOpen,
        setNavMenuVisible,
      }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNav = (): NavigationContextType => {
  const useNavigation = useContext(NavigationContext);
  if (!useNavigation) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return useNavigation;
};
