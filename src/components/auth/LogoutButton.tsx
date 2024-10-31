import { useAuth } from "@/src/contexts/AuthProvider";
import { Button } from "react-native";
import { styled } from "nativewind";
import { Text, Pressable } from "react-native";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const LogoutButton = observer(function LogoutButton() {
  return (
    <StyledPressable
      onPress={() => {
        authStore$.signOut();
      }}
      className="w-full py-3 mb-2 bg-transparent border border-secondary rounded-lg">
      <StyledText className="text-center text-secondary" style={{ fontFamily: "PragmaticaExtended" }}>
        Log out
      </StyledText>
    </StyledPressable>
  );
});

export default LogoutButton;
