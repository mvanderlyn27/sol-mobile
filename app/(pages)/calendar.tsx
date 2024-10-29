import { View } from "moti";
import { Text } from "react-native";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Link } from "expo-router";
import { styled } from "nativewind";
const StyledView = styled(View);
export default function Calendar() {
  const db = useDatabase();
  return (
    <StyledView className="flex-1 justify-center">
      <Text>Profile</Text>
      <Link href="/journal">Journal</Link>
      <Link href="/profile">profile</Link>
    </StyledView>
  );
}
