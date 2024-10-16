import { MotiView, Text } from "moti";
import { styled } from "nativewind";
import { Linking } from "react-native";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
export default function HelpSection() {
  const handleEmailPress = () => {
    Linking.openURL("mailto:support@example.com?subject=Help&body=I need assistance.");
  };
  return (
    <StyledMotiView className="px-12">
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="text-md text-secondary">
        For support, reach out to us <Text onPress={handleEmailPress}>support@sliceoflifeapp.com</Text>
      </StyledText>
    </StyledMotiView>
  );
}
