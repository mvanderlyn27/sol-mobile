import { Redirect, usePathname } from "expo-router";
import { View } from "react-native";
import * as Linking from "expo-linking";
import * as SystemUI from "expo-system-ui";
import { addNotification } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import { generateId } from "@/src/stores/AsyncStorage";
import { useEffect } from "react";
import { useMountOnce } from "@legendapp/state/react";
SystemUI.setBackgroundColorAsync("black");

const Index = () => {
  return <Redirect href="/loading" />;
};
export default Index;
