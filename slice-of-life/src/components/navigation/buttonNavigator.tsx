import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleTabPress = (route: string): void => {
    if (route) {
      router.push(route as Href);
      setMenuOpen(false);
    }
  };

  return (
    <Pressable
      style={{ position: "absolute", right: 0, top: 0, left: 0, bottom: 0 }}
      onPress={() => {
        if (menuOpen) setMenuOpen(false);
      }}>
      <View style={{ position: "absolute", left: 10, bottom: 20 }}>
        <AnimatePresence exitBeforeEnter>
          {/* Menu Button */}

          {/* Menu Items */}
          {menuOpen && (
            <StyledMotiView
              key="menu"
              className="flex flex-col-reverse gap-24"
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              exitTransition={{ type: "timing", duration: 100 }}
              transition={{ type: "timing", duration: 200 }}>
              <StyledMotiView
                key="library-button"
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 20 }}
                transition={{ type: "timing", duration: 200, delay: 100 }}>
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
                transition={{ type: "timing", duration: 200, delay: 150 }}>
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
                transition={{ type: "timing", duration: 200, delay: 200 }}>
                <CircleButton
                  onClick={() => handleTabPress("/profile")}
                  buttonType={ButtonType.Profile}
                  selected={currentRoute === "/profile"}
                />
              </StyledMotiView>
            </StyledMotiView>
          )}
          {!menuOpen && (
            <StyledMotiView
              key="menu-button"
              exit={{ opacity: 0 }}
              exitTransition={{ type: "timing", duration: 100 }}
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 200 }}>
              <CircleButton onClick={toggleMenu} buttonType={ButtonType.Menu} selected />
            </StyledMotiView>
          )}
        </AnimatePresence>
      </View>
    </Pressable>
  );
}
