import LoadingScreen from "@/src/components/screens/SplashScreen";
import { useAppNavigation } from "@/src/services/Navigation";
import { generateId } from "@/src/stores/AsyncStorage";
import { addNotification } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import { observer, useMountOnce } from "@legendapp/state/react";
import { View } from "react-native";
import * as Linking from "expo-linking";
import { Href, router } from "expo-router";
import { useEffect } from "react";
const Loading = observer(function Loading() {
  useAppNavigation();
  return (
    <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <LoadingScreen />
    </View>
  );
});
export default Loading;
