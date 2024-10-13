import { Redirect } from "expo-router";
import { View } from "react-native";

const Index = () => {
  return (
    <View style={{ flex: 1 }}>
      <Redirect href="/library" />
      {/* <Redirect href="/journal" /> */}
    </View>
  );
};
export default Index;
