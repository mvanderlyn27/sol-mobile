import OverlayTextButton from "@/src/components/shared/OverlayTextButton";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
import { MotiView } from "moti";
import { styled } from "nativewind";

const ImageOverlayButtons = observer(function ImageOverlayButtons() {
  const handleSave = () => {
    close();
  };
  const handleCancel = () => {
    close();
  };
  const close = () => {
    // journalStore$.editMode.set(false);
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayImageEditOverlay.set(false);
  };
  const StyledMotiView = styled(MotiView);
  return (
    <StyledMotiView
      className="flex flex-row justify-between px-8"
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      exitTransition={{ type: "timing", duration: 100 }}
      transition={{ type: "timing", duration: 100 }}>
      <OverlayTextButton onPress={handleCancel} text="Cancel" />
      <OverlayTextButton onPress={handleSave} text="Done" bold />
    </StyledMotiView>
  );
});
export default ImageOverlayButtons;
