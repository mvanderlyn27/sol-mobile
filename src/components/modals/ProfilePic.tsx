import authStore$ from "@/src/stores/AuthStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { Pressable, View } from "react-native";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
export default function ProfilePic({ action }: { action?: () => void }) {
  const userId = authStore$.session.get()?.user.id;
  const profile = userId ? profiles$[userId].get() : null;
  const shortId = userId ? userId.slice(0, 8) : Math.random();
  console.log(userId, profile);
  return (
    <StyledPressable
      className="rounded-full w-full aspect-square bg-secondary overflow-hidden"
      onPress={action ? action : null}>
      {profile?.avatar_url ? (
        <Image style={{ flex: 1 }} source={profile.avatar_url} placeholder={profile.avatar_placeholder} />
      ) : (
        <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${shortId}`} />
      )}
    </StyledPressable>
  );
}
