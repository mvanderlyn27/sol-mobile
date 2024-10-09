import { ReactNode, createContext, useContext, useState } from "react";

//want to be able to show/hide the navigation menu from other routes, and keep teh selected route up to date
interface NavigationContextType {
  navMenuVisible: boolean;
  menuOpen: boolean;
  toggleMenuOpen: () => void;
  toggleMenuVisible: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navMenuVisible, setNavMenuVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleMenuVisible = () => {
    setNavMenuVisible(!navMenuVisible);
  };

  return (
    <NavigationContext.Provider
      value={{
        navMenuVisible,
        menuOpen,
        toggleMenuOpen,
        toggleMenuVisible,
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
