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
import { useData } from "@/src/contexts/DataProvider";

export const StyledMotiView = styled(MotiView);
export const StyledView = styled(View);

export default function ButtonNavigator(): JSX.Element {
  const router = useRouter();
  const { isReady } = useData();
  const currentRoute = usePathname();
  const { navMenuVisible, menuOpen, setMenuOpen } = useNav();
  // const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleTabPress = (route: string): void => {
    if (route && route !== currentRoute) {
      router.push(route as Href);
    }
    setMenuOpen(false);
  };

  const getMenuItems = (): VerticalStackItem => {
    return {
      onClick: () => setMenuOpen(true),
      selected: true,
      buttonType: ButtonType.Menu,
    };
  };
  const getListItems = (): VerticalStackItem[] => {
    return [
      {
        onClick: () => setMenuOpen(false),
        buttonType: ButtonType.X,
      },
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
      // {
      //   onClick: () => handleTabPress("/library"),
      //   primary: false,
      //   selected: currentRoute === "/library",
      //   buttonType: ButtonType.Library,
      //   disabled: false,
      // },
    ];
  };
  return (
    <StyledView key="menu-container" pointerEvents="box-none" className={`absolute top-0 right-0 bottom-0 left-0 `}>
      {/* {menuOpen && (
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
      )} */}
      <StyledView className="absolute bottom-10 left-5">
        {/* Menu Items */}

        <AnimatePresence exitBeforeEnter>
          {menuOpen && navMenuVisible && isReady && <VerticalStack items={getListItems()} key="menu-list" />}
          {/* Menu Button */}
          {!menuOpen && navMenuVisible && isReady && <VerticalStack items={[getMenuItems()]} key="menu-button" />}
        </AnimatePresence>
      </StyledView>
    </StyledView>
  );
}
