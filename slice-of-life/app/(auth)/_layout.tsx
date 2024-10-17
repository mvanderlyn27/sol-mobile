import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/src/contexts/AuthProvider";
import * as Linking from "expo-linking";
export default function Layout() {
  const { session } = useAuth();
  if (session !== null) {
    console.log("logged in already", session);
    return <Redirect href="/journal" />;
  }
  return <Slot />;
}
