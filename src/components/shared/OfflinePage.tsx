import { SafeAreaView, Text, View } from "react-native";
import { styled } from "nativewind";
const StyledText = styled(Text);
export function OfflinePage() {
  return (
    // <View style={{ position: "absolute", left: 0, right: 0, top: 30 }}>
    <SafeAreaView
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        // alignItems: "center",
        // justifyContent: "center",
      }}>
      <StyledText
        className=" text-3xl tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended-bold" }}>
        SLICE OF LIFE
      </StyledText>
      <StyledText className="text-[10px] text-secondary text-center" style={{ fontFamily: "PragmaticaExtended" }}>
        ORDINARY MUNDANE. BUT UNIQUELY YOURS.
      </StyledText>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <StyledText className="text-secondary text-2xl">Offline. Reconnect to continue...</StyledText>
      </View>
    </SafeAreaView>
    // </View>
  );
}
