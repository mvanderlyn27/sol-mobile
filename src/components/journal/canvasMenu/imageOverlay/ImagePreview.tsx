import { imageEditStore$ } from "@/src/stores/ImageEditStore";
import { observer } from "@legendapp/state/react";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { View } from "react-native";
const StyledView = styled(View);
const StyledImage = styled(Image);
const ImagePreview = observer(function ImagePreview() {
  const imagePath = imageEditStore$.selectedImage.get();
  if (!imagePath) return null;
  return (
    <StyledView className="flex-1 justify-center content-center p-4">
      <StyledImage source={{ uri: imagePath }} className="w-full flex-1 max-h-[200px]" contentFit="contain" />
    </StyledView>
  );
});
export default ImagePreview;
