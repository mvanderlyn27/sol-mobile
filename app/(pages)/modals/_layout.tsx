import { Href, Link, Slot, Stack, router, usePathname } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { StyledView } from "../../_layout";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import NotificationHolder from "@/src/components/notifications/NotificationHolder";
const StyledMotiView = styled(MotiView);
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "profile",
};

export default function Modal() {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const [shouldBack, setShouldBack] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();

  const handleClose = () => {
    // router.dismissAll();
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
    setVisible(false);
  };

  // Listen for keyboard events
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if ((shouldExit || shouldBack) && !animating) {
      if (shouldBack) {
        handleBack();
      } else {
        handleClose();
      }
    }
  }, [shouldBack, shouldExit, animating]);

  // Calculate height dynamically based on keyboard visibility
  const modalHeight = keyboardVisible
    ? windowHeight - keyboardHeight - 100 // Adjust as needed for padding
    : windowHeight * 0.6;

  return (
    <BlurView tint="dark" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>
      <NotificationHolder />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {/* Dismiss modal when pressing outside */}
        <Pressable onPress={startExit} style={StyleSheet.absoluteFill} />
        <AnimatePresence onExitComplete={() => setAnimating(false)}>
          {visible && (
            <StyledMotiView
              from={{
                translateY: 500, // Start from below the screen
                opacity: 0,
              }}
              animate={{
                translateY: 0, // Animate to center
                opacity: 1,
              }}
              exit={{
                translateY: 500, // Exit by sliding back down
                opacity: 0,
              }}
              transition={{
                type: "timing",
                duration: 300,
              }}
              exitTransition={{
                type: "timing",
                duration: 400,
              }}
              style={{
                height: modalHeight,
                width: "90%",
                borderRadius: 20,
                overflow: "hidden",
              }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            </StyledMotiView>
          )}
        </AnimatePresence>
      </KeyboardAvoidingView>
    </BlurView>
  );
}
