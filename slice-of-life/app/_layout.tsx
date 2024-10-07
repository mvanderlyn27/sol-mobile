import { Slot } from "expo-router";
import { AuthProvider } from "@/src/contexts/AuthProvider";
export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
