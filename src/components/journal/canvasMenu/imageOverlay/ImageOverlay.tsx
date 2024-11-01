import { observer } from "@legendapp/state/react";
import ImageMenu from "./ImageMenu";
import { BlurView } from "expo-blur";
import { styled } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageOverlayButtons from "./ImageOverlayButtons";
import ImagePreview from "./ImagePreview";
const StyledBlurView = styled(BlurView);
const ImageOverlay = observer(function ImageOverlay() {
  return (
    <StyledBlurView tint="dark" className="flex-1">
      <SafeAreaView style={{ flex: 1 }} pointerEvents="box-none">
        <ImageOverlayButtons />
        <ImagePreview />
        <ImageMenu />
      </SafeAreaView>
    </StyledBlurView>
  );
});

export default ImageOverlay;
