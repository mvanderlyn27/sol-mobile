import { MotiView, Text } from "moti";
import { styled } from "nativewind";
import AccountForm from "./AccountForm";
import LogoutButton from "../auth/LogoutButton";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
export default function AccountSection() {
  return (
    <StyledMotiView className="px-12 flex-col justify-center items-center">
      <AccountForm />
      <LogoutButton />
    </StyledMotiView>
  );
}
