import { useState } from "react";
import { Pressable, View } from "react-native";
import { styled } from "nativewind";
import { MotiView, AnimatePresence } from "moti";
import CircleButton from "../shared/CircleButton"; // Assuming this is your button component
import { ButtonType, VerticalStackItem } from "@/src/types/shared.types";
import { Href, usePathname, useRouter } from "expo-router";
import { useNav } from "@/src/contexts/NavigationProvider";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { Button } from "@rneui/themed";
import VerticalStack from "../shared/VerticleStack";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

export default function ButtonNavigator(): JSX.Element {
  const router = useRouter();
  const currentRoute = usePathname();
  const { navMenuVisible, toggleMenuVisible, menuOpen, toggleMenuOpen } = useNav();
  // const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleTabPress = (route: string): void => {
    if (route) {
      router.push(route as Href);
      toggleMenuOpen();
    }
  };
  const getMenuItems = (): VerticalStackItem => {
    return {
      onClick: () => toggleMenuOpen(),
      selected: true,
      buttonType: ButtonType.Menu,
    };
  };
  const getListItems = (): VerticalStackItem[] => {
    return [
      {
        onClick: () => handleTabPress("/profile"),
        primary: false,
        selected: currentRoute === "/profile",
        buttonType: ButtonType.Profile,
        disabled: false,
      },
      {
        onClick: () => handleTabPress("/journal"),
        primary: false,
        selected: currentRoute === "/journal",
        buttonType: ButtonType.JournalCheck,
        disabled: false,
      },
      {
        onClick: () => handleTabPress("/library"),
        primary: true,
        selected: currentRoute === "/library",
        buttonType: ButtonType.Library,
        disabled: false,
      },
    ];
  };
  return (
    <StyledView
      pointerEvents="box-none"
      className={`${!navMenuVisible && "hidden"} absolute left-0 right-0 top-0 bottom-0`}>
      {menuOpen && (
        <Pressable
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            left: 0,
            bottom: 0,
          }}
          onPress={() => {
            if (menuOpen) toggleMenuOpen();
          }}
        />
      )}
      <View style={{ position: "absolute", left: 10, bottom: 0 }}>
        <AnimatePresence exitBeforeEnter>
          {/* Menu Items */}
          {menuOpen && <VerticalStack items={getListItems()} key="menu-list" />}
          {/* Menu Button */}
          {!menuOpen && <VerticalStack items={[getMenuItems()]} key="menu-button" />}
        </AnimatePresence>
      </View>
    </StyledView>
  );
}
