import { Image } from "expo-image";
import { useData } from "@/src/contexts/DataProvider";
import { getImageFromPath } from "@/src/assets/images/images";
import { Dimensions } from "react-native";
import { styled } from "nativewind";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");
const imageSize = width * 0.7; // 70% of the screen width

const StyledImage = styled(Image);
const StyledMotiView = styled(MotiView);

export default function ProfilePic() {
  const { profile } = useData();

  return (
    <StyledMotiView style={{ width: imageSize, height: imageSize }} className="bg-secondary rounded-lg overflow-hidden">
      <StyledImage
        source={profile?.avatar_url ? profile?.avatar_url : getImageFromPath("default_avatar")}
        content-fit="cover"
        className="flex-1"
      />
    </StyledMotiView>
  );
}
