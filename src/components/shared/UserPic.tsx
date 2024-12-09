import { profiles$ } from "@/src/stores/ProfileStore";
import { observer } from "@legendapp/state/react";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const UserPic = observer(function UserPic({
  action,
  number,
  userId,
  largeView,
  pending,
}: {
  action?: () => void;
  number?: number;
  userId?: string;
  largeView?: boolean;
  pending?: boolean;
}) {
  if (!number && !userId) return null;
  if (userId) {
    const profile = profiles$[userId].get();
    const shortId = userId ? userId.slice(0, 8) : "";
    return (
      <StyledPressable
        key={`user-${userId}`}
        pointerEvents={action !== undefined ? "auto" : "none"}
        onPress={action}
        className={`rounded-full ${
          largeView ? "w-[70px]" : "w-[40px]"
        } aspect-square mr-1 bg-secondary overflow-hidden ${pending ? "opacity-50" : ""}`}>
        {profile?.avatar_url ? (
          <Image
            style={{ flex: 1 }}
            source={profile.avatar_url}
            placeholder={{ blurhash: profile.avatar_placeholder || "" }}
          />
        ) : (
          <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${shortId}`} />
        )}
      </StyledPressable>
    );
  } else {
    return (
      <StyledView className="rounded-full w-[40px] mr-1 aspect-square bg-secondary overflow-hidden">
        <StyledView className="flex-1 justify-center items-center">
          <StyledText>{number}+</StyledText>
        </StyledView>
      </StyledView>
    );
  }
});
export default UserPic;
