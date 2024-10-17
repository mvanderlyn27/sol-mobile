import ButtonNavigator from "@/src/components/navigation/ButtonNavigator";
import SettingsHeader from "@/src/components/settings/SettingsHeader";
import { useAuth } from "@/src/contexts/AuthProvider";
import { DataProvider } from "@/src/contexts/DataProvider";
import { NavigationProvider } from "@/src/contexts/NavigationProvider";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Stack } from "expo-router/stack";
import { Pressable, Text } from "react-native";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { AuthService } from "@/src/api/auth";

export default function Layout() {
  const { session } = useAuth();
  if (session === null) {
    //check if we have a URL
    console.log("not authenticated", session);
    return <Redirect href="/login" />; // Placeholder for loading state
  }
  return (
    <DataProvider>
      <NavigationProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          {/* <Stack.Screen name="index" options={{ animation: "fade" }} /> */}
          <Stack.Screen name="journal" options={{ animation: "fade" }} />
          <Stack.Screen name="profile" options={{ animation: "fade" }} />
          <Stack.Screen name="resetPassword" options={{ animation: "fade" }} />
          <Stack.Screen name="verifyEmail" options={{ animation: "fade" }} />
          <Stack.Screen
            name="settings"
            options={{
              animation: "fade",
            }}
          />
        </Stack>
        <ButtonNavigator />
      </NavigationProvider>
    </DataProvider>
  );
}
