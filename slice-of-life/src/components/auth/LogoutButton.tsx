import { useAuth } from "@/src/contexts/AuthProvider";
import { Button } from "react-native";

export default function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <Button
      title="logout"
      onPress={() => {
        signOut();
      }}></Button>
  );
}
