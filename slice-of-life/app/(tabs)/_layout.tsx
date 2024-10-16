import ButtonNavigator from "@/src/components/navigation/ButtonNavigator";
import { useAuth } from "@/src/contexts/AuthProvider";
import { DataProvider } from "@/src/contexts/DataProvider";
import { NavigationProvider } from "@/src/contexts/NavigationProvider";
import { Redirect } from "expo-router";
import { Stack } from "expo-router/stack";

export default function Layout() {
  const { session } = useAuth();
  if (session === null) {
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
          <Stack.Screen name="settings" options={{ animation: "fade" }} />
        </Stack>
        <ButtonNavigator />
      </NavigationProvider>
    </DataProvider>
  );
}
