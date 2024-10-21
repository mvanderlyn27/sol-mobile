import { useData } from "@/src/contexts/DataProvider";
import { MotiView, Text } from "moti";
import { styled } from "nativewind";
import { Pressable } from "react-native";
import * as Linking from "expo-linking";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
export default function HelpSection() {
  const { profile } = useData();
  const handleEmailPress = () => {
    Linking.openURL(
      `mailto:support@sliceoflifeapp.com?subject=${profile?.name ? "Support for " + profile?.name : "Support"}`
    );
  };
  return (
    <StyledMotiView className="px-12">
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="text-md text-secondary">
        For support, reach out to us
      </StyledText>
      <Pressable onPress={handleEmailPress} style={{}}>
        <StyledText className="text-md text-secondary underline" style={{ fontFamily: "PragmaticaExtended-bold" }}>
          support@sliceoflifeapp.com
        </StyledText>
      </Pressable>
    </StyledMotiView>
  );
}
