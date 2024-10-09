import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Pressable } from "react-native";
import { Href, Redirect, Slot, useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useAuth } from "@/src/contexts/AuthProvider";
import ButtonNavigator from "@/src/components/navigation/ButtonNavigator";
import { DataProvider } from "@/src/contexts/DataProvider";
import { NavigationProvider } from "@/src/contexts/NavigationProvider";

const buttonHeight = 50; // Height for each button
const spacing = 10; // Space between buttons

export default function Layout(): JSX.Element {
  const { session } = useAuth();
  if (session === null) {
    console.log("not authenticated", session);
    return <Redirect href="/login" />; // Placeholder for loading state
  }

  return (
    <DataProvider>
      <NavigationProvider>
        <View style={{ flex: 1 }}>
          <Slot />
          <ButtonNavigator />
        </View>
      </NavigationProvider>
    </DataProvider>
  );
}
