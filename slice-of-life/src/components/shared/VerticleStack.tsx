import { styled } from "nativewind";
import { MotiView } from "moti";
import CircleButton from "../shared/CircleButton"; // Assuming this is your button component
import { VerticalStackItem } from "@/src/types/shared.types";

export const StyledMotiView = styled(MotiView);

export default function VerticalStack({ items }: { items: VerticalStackItem[] }) {
  return (
    <StyledMotiView
      className="flex flex-col-reverse gap-24"
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      exitTransition={{ type: "timing", duration: 100 }}
      transition={{ type: "timing", duration: 200 }}>
      {items.map((item, index) => (
        <StyledMotiView
          key={index} // Using the index as the key
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          transition={{ type: "timing", duration: 200, delay: index * 50 }} // Delay increases by 50ms per item
        >
          <CircleButton
            onClick={item.onClick}
            buttonType={item.buttonType}
            selected={item.selected}
            disabled={item.disabled}
          />
        </StyledMotiView>
      ))}
    </StyledMotiView>
  );
}
