import BottomBar from "@/src/components/journal/bottomBar/BottomBar";
import NavigationBar from "@/src/components/navigation/NavigationBar";
import { Slot } from "expo-router";

export default function Layout() {
  return (
    <>
      <Slot />
      <NavigationBar />
    </>
  );
}
