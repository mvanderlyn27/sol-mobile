import { BlurView } from "expo-blur";
import { AnimatePresence } from "moti";
import { MotiView } from "moti";
import { styled } from "nativewind";
import QuickAction from "./QuickAction";
import { StyledText } from "../canvas/CanvasText";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
const StyledMotiView = styled(MotiView);
const StyledBlurView = styled(BlurView);

const QuickActionsOverlay = observer(function QuickActionsOverlay() {
  const displayQuickActionsOverlay = uiStore$.displayQuickActionsOverlay.get();
  const quickActions = [
    {
      icon: "photo",
      label: "Photo",
      onPress: () => {
        console.log("photo");
        // setQuickActionsOverlayDisplay(false);
      },
    },
    {
      icon: "templates",
      label: "Templates",
      onPress: () => {
        console.log("template");
        // setQuickActionsOverlayDisplay(false);
      },
    },
    {
      icon: "text",
      label: "Text",
      onPress: () => {
        console.log("text");
        // setQuickActionsOverlayDisplay(false);
      },
    },
  ];
  return (
    <StyledMotiView
      className="absolute top-0 bottom-0 right-0 left-0  justify-center items-center"
      key="quick-actions-overlay"
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "timing", duration: 200 }}>
      <StyledBlurView intensity={10} className="w-full h-full items-center justify-center flex-column ">
        <StyledText className="text-slate-500 font-bold text-2xl text-center mb-5">How was your day?</StyledText>
        {quickActions.map((action) => (
          <QuickAction action={action} key={action.label} />
        ))}
      </StyledBlurView>
    </StyledMotiView>
  );
});

export default QuickActionsOverlay;
