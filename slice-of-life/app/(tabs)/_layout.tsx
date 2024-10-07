import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Pressable } from "react-native";
import { Href, Redirect, Slot, useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useAuth } from "@/src/contexts/AuthProvider";

const { width } = Dimensions.get("window");
const buttonHeight = 50; // Height for each button
const spacing = 10; // Space between buttons

export default function Layout(): JSX.Element {
  const { session } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const translateY = useSharedValue<number>(0);
  const opacity = useSharedValue<number>(0); // Add opacity shared value

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      // Spread the buttons out when opening
      translateY.value = withTiming(-(buttonHeight * 3 + spacing * 2), { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 }); // Fade in buttons
    } else {
      // Close the buttons back to the main button
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }); // Fade out buttons
    }
  };

  const closeMenu = (): void => {
    setMenuOpen(false);
    translateY.value = withTiming(0);
    opacity.value = withTiming(0); // Ensure buttons are hidden when closing
  };

  const handleTabPress = (route: string): void => {
    if (route) {
      router.push(route as Href);
      closeMenu();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value, // Apply opacity animation
    };
  });

  if (session === null) {
    console.log("not authenticated", session);
    return <Redirect href="/login" />; // Placeholder for loading state
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />

        <View style={styles.fabContainer}>
          {/* Animated buttons for navigation */}
          <Animated.View style={[styles.animatedButtonContainer, animatedStyle]}>
            <AnimatedButton label="Journal" onPress={() => handleTabPress("/journal")} />
            <AnimatedButton label="Library" onPress={() => handleTabPress("/library")} />
            <AnimatedButton label="Settings" onPress={() => handleTabPress("/settings")} />
          </Animated.View>

          <TouchableOpacity style={styles.fabButton} onPress={toggleMenu}>
            <Text style={styles.fabIconText}>+</Text>
          </TouchableOpacity>
        </View>
      </>
    </View>
  );
}

const AnimatedButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.animatedButton} onPress={onPress}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    alignItems: "flex-end",
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6200EE",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  fabIconText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  animatedButtonContainer: {
    position: "absolute",
    bottom: 10, // Position above the FAB
    right: 0,
    alignItems: "center", // Center buttons horizontally
  },
  animatedButton: {
    width: buttonHeight, // Make the button circular
    height: buttonHeight, // Same as width for a circle
    backgroundColor: "#03DAC5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing, // Space between buttons
    borderRadius: buttonHeight / 2, // Make it circular
  },
  buttonLabel: {
    color: "white",
    fontWeight: "bold",
  },
});
