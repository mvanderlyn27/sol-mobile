import { MotiView, Text } from "moti";
import { styled } from "nativewind";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
export default function AboutSection() {
  return (
    <StyledMotiView className="px-12">
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="py-2 text-md text-secondary">
        Thank you for joining us during this Beta test launch! Your feedback is invaluable in helping us shape the
        future of Slice of Life. We’re grateful to have you on this journey as we work to create the best experience for
        memory-making and storytelling.
      </StyledText>
    </StyledMotiView>
  );
}
