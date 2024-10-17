import { Redirect, usePathname } from "expo-router";
import { View } from "react-native";
import * as Linking from "expo-linking";

const Index = () => {
  return <Redirect href="/journal" />;
};
export default Index;
