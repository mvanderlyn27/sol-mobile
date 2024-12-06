import { Href, Link, Slot, Stack, router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeIn, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { StyledView } from "../../_layout";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
const StyledMotiView = styled(MotiView);
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "profile",
};
const Modal = observer(function Modal() {
  const [animating, setAnimating] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const [shouldBack, setShouldBack] = useState(false);
  const path = usePathname();
  useEffect(() => {
    uiStore$.displaySideBar.set(true);
  }, []);
  const handleClose = () => {
    const firstRoute = path.split("/")[1];
    // router.push(firstRoute ? (firstRoute as Href) : "/");
    // router.push(("/" + firstRoute) as Href);
    router.replace("/home");
  };
  const handleBack = () => {
    router.back();
  };
  const startBack = () => {
    setShouldBack(true);
    closeModal();
  };
  const startExit = () => {
    setShouldExit(true);
    closeModal();
  };
  const closeModal = () => {
    setAnimating(true);
    uiStore$.displaySideBar.set(false);
  };
  useEffect(() => {
    if ((shouldExit || shouldBack) && !animating) {
      if (shouldBack) {
        handleBack();
      } else {
        handleClose();
      }
    }
  }, [shouldBack, shouldExit, animating]);

  return (
    <BlurView tint="dark" style={{ flex: 1, alignItems: "flex-start", justifyContent: "flex-start" }}>
      {/* Dismiss modal when pressing outside */}
      <Pressable onPress={startExit} style={StyleSheet.absoluteFill} />
      <AnimatePresence onExitComplete={() => setAnimating(false)}>
        {uiStore$.displaySideBar.get() && (
          <StyledMotiView
            from={{
              translateX: -300, // Start from below the screen
              opacity: 0,
            }}
            animate={{
              translateX: 0, // Animate to center
              opacity: 1,
            }}
            exit={{
              translateX: -300, // Exit by sliding back down
              opacity: 0,
            }}
            transition={{
              type: "timing",
              duration: 300,
            }}
            // style={{ width: "80%", height: "70%", backgroundColor: "#F5EEE5", borderRadius: 20, overflow: "hidden" }}
            className="w-[80%] h-[100%]  overflow-hidden bg-transparent">
            <Stack
              screenOptions={{
                // presentation: "transparentModal", // Use transparent modal presentation for all child screens
                animation: "fade", // Apply fade animation to modals
                headerShown: false, // Hide header for a cleaner look
              }}
            />
          </StyledMotiView>
        )}
      </AnimatePresence>
    </BlurView>
  );
});
export default Modal;
