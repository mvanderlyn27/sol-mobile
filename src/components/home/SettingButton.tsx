import { styled } from "nativewind";
import { StyledPressable } from "../journal/canvas/CanvasFrameHolder";
import Feather from "@expo/vector-icons/Feather";
const StyledFeather = styled(Feather);
export default function SettingButton({ action }: { action: () => void }) {
  return (
    <StyledPressable onPress={action}>
      <StyledFeather name="settings" size={40} className="text-secondary" />
    </StyledPressable>
  );
}
