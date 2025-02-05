import { Redirect } from "expo-router";
import * as SystemUI from "expo-system-ui";
SystemUI.setBackgroundColorAsync("black");

const Index = () => {
  return <Redirect href="/loading" />;
};
export default Index;
