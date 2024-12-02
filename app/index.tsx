import { Redirect, usePathname } from "expo-router";
import { View } from "react-native";
import * as SystemUI from "expo-system-ui";
SystemUI.setBackgroundColorAsync("black");
const Index = () => {
  return <Redirect href="/loading" />;
};
export default Index;
