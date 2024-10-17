import { MotiView, Text } from "moti";
import { styled } from "nativewind";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
export default function AboutSection() {
  return (
    <StyledMotiView className="px-12">
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="py-2 text-md text-secondary">
        Slice of Life is your personal retro-styled photo journal, designed to capture and celebrate everyday moments
        that matter most. Our mission is to help you document both the exciting and the ordinary, turning your daily
        memories into a collection you’ll love looking back on. Whether it’s big events or small slices of life, we make
        it easy to create beautiful photo entries that tell your story in your own way.
      </StyledText>
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="py-2 text-md text-secondary">
        Thank you for joining us during this MVP test launch! Your feedback is invaluable in helping us shape the future
        of Slice of Life. We’re grateful to have you on this journey as we work to create the best experience for
        memory-making and storytelling.
      </StyledText>
    </StyledMotiView>
  );
}
