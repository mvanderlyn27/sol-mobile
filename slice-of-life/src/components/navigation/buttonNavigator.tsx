import { useAuth } from "@/src/contexts/AuthProvider";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { MotiView, MotiText } from "moti";
import CircleButton from "../CircleButton";
import { ButtonType } from "@/src/types/shared.types";

const buttonHeight = 50; // Height for each button
const spacing = 10; // Space between buttons
export default function ButtonNavigator(): JSX.Element {
  const { session } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const openMenu = (): void => {};
  const closeMenu = (): void => {};
  const handleTabPress = (route: string): void => {
    //passed to each button
    if (route) {
      router.push(route as Href);
      closeMenu();
    }
  };
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "timing",
        duration: 350,
      }}>
      <CircleButton onClick={openMenu} buttonType={ButtonType.Menu} />
    </MotiView>
  );
}
