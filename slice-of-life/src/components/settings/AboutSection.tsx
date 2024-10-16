import { MotiView, Text } from "moti";
import { styled } from "nativewind";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
export default function AboutSection() {
  return (
    <StyledMotiView className="px-12">
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="text-md text-secondary">
        About Info
      </StyledText>
    </StyledMotiView>
  );
}
