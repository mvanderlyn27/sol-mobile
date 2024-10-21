import { useAuth } from "@/src/contexts/AuthProvider";
import { Button } from "react-native";
import { styled } from "nativewind";
import { Text, Pressable } from "react-native";
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
export default function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <StyledPressable
      onPress={() => {
        signOut();
      }}
      className="w-full py-3 mb-2 bg-transparent border border-secondary rounded-lg">
      <StyledText className="text-center text-secondary" style={{ fontFamily: "PragmaticaExtended" }}>
        Log out
      </StyledText>
    </StyledPressable>
  );
}
