import { styled } from "nativewind";
import { MotiView } from "moti";
import CircleButton from "../shared/CircleButton"; // Assuming this is your button component
import { VerticalStackItem } from "@/src/types/shared.types";

export const StyledMotiView = styled(MotiView);

export default function VerticalStack({
  items,
  entryDuration,
  exitDuration,
  entryDelay,
  exitDelay,
}: {
  items: VerticalStackItem[];
  entryDuration?: number;
  exitDuration?: number;
  entryDelay?: number;
  exitDelay?: number;
}) {
  return (
    <StyledMotiView
      className="flex-col-reverse gap-2" // Adjust gap as needed
      from={{ opacity: 0 }} // Start below the visible area
      animate={{ opacity: 1 }} // Animate to full visibility
      transition={{ type: "timing", duration: entryDuration ?? 200, delay: entryDelay ?? 0 }}
      exit={{ opacity: 0 }} // Exit slightly below the visible area
      exitTransition={{ type: "timing", duration: exitDuration ?? 200, delay: exitDelay ?? 0 }}>
      {items.map((item, index) => (
        <StyledMotiView
          key={index} // Using the index as the key
          from={{ opacity: 0, translateY: index * 25 }} // Start from the same position
          animate={{ opacity: 1, translateY: 0 }} // Animate to their designated position (e.g., 70 pixels up for each item)
          exit={{ opacity: 0, translateY: index * 25 }} // Slide down to the same position when exiting
          transition={{
            type: "timing",
            duration: 200,
            delay: index * 50, // Delay increases by 50ms per item
          }}
          exitTransition={{
            type: "timing",
            duration: 100,
            delay: index * 50, // Delay increases by 50ms per item
          }}>
          <CircleButton
            onClick={item.onClick}
            buttonType={item.buttonType}
            selected={item.selected}
            disabled={item.disabled}
            primary={item.primary}
          />
        </StyledMotiView>
      ))}
    </StyledMotiView>
  );
}
