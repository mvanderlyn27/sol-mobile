import LoadingScreen from "@/src/components/screens/SplashScreen";
import { useAppNavigation } from "@/src/services/Navigation";
import { observer } from "@legendapp/state/react";
import { View } from "react-native";

const Loading = observer(function Loading() {
  useAppNavigation();
  return (
    <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <LoadingScreen />
    </View>
  );
});
export default Loading;
