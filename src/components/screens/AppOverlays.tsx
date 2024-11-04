import { observer } from "@legendapp/state/react";
import { View } from "react-native";
import { styled } from "nativewind";
const StyledView = styled(View);
const AppOverlays = observer(function AppOverlays() {
  return (
    <StyledView className="absolute top-0 bottom-0 right-0 left-0 z-100" pointerEvents="box-none">
      {/* Overlays go here, like notifs, modals etc */}
    </StyledView>
  );
});
export default AppOverlays;
