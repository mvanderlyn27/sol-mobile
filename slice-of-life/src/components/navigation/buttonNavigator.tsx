import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { styled } from "nativewind";
import { MotiView, AnimatePresence } from "moti";
import CircleButton from "../CircleButton"; // Assuming this is your button component
import { ButtonType } from "@/src/types/shared.types";
import { Href, usePathname, useRouter } from "expo-router";

export const StyledMotiView = styled(MotiView);

export default function ButtonNavigator(): JSX.Element {
  const router = useRouter();
  const currentRoute = usePathname();
  console.log("current route", currentRoute);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const openMenu = (): void => setMenuOpen(true);
  const closeMenu = (): void => setMenuOpen(false);

  /**
   * Handles a tab press event by closing the menu and navigating to the given route, if specified.
   * @param route The route to navigate to, if specified.
   */
  /*************  ✨ Codeium Command ⭐  *************/
  /******  22fc6ae6-8262-4501-9e4c-c60db9ea2fe4  *******/
  const handleTabPress = (route: string): void => {
    console.log("route", route);

    if (route) {
      // Handle tab press and routing logic
      router.push(route as Href);
      closeMenu();
    }
  };

  return (
    <Pressable
      style={{ position: "absolute", right: 0, top: 0, left: 0, bottom: 0 }}
      onPress={() => {
        if (menuOpen) closeMenu();
      }}>
      <View style={{ position: "absolute", left: 10, bottom: 20 }}>
        {/* Menu Button */}
        {!menuOpen && (
          <StyledMotiView
            key="menu-button"
            exit={{ opacity: 0 }}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 300 }}>
            <CircleButton onClick={openMenu} buttonType={ButtonType.Menu} selected />
          </StyledMotiView>
        )}

        {/* Menu Items */}
        {menuOpen && (
          <StyledMotiView
            key="menu"
            className="flex flex-col-reverse gap-24"
            // exit={{ opacity: 0, translateY: 20 }}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}>
            <StyledMotiView
              key="library-button"
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              transition={{ type: "timing", duration: 300, delay: 100 }}>
              <CircleButton
                onClick={() => handleTabPress("/library")}
                buttonType={ButtonType.Library}
                selected={currentRoute === "/library"}
              />
            </StyledMotiView>

            <StyledMotiView
              key="journal-button"
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              transition={{ type: "timing", duration: 300, delay: 200 }}>
              <CircleButton
                onClick={() => handleTabPress("/journal")}
                buttonType={ButtonType.JournalCheck}
                selected={currentRoute === "/journal"}
              />
            </StyledMotiView>

            <StyledMotiView
              key="profile-button"
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              transition={{ type: "timing", duration: 300, delay: 300 }}>
              <CircleButton
                onClick={() => handleTabPress("/profile")}
                buttonType={ButtonType.Profile}
                selected={currentRoute === "/profile"}
              />
            </StyledMotiView>
          </StyledMotiView>
        )}
      </View>
    </Pressable>
  );
}
