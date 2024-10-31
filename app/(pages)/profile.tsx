import { View } from "moti";
import { Text } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
const StyledView = styled(View);
export default function Profile() {
  return (
    <StyledView className="flex-1 justify-center">
      <Text>Profile</Text>
      <Link href="/journal">Journal</Link>
      <Link href="/calendar">Calendar</Link>
    </StyledView>
  );
}
