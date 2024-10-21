import SettingsScreen from "@/src/components/screens/SettingsScreen";
import { ProfileProvider } from "@/src/contexts/ProfileProvider";

export default function Settings() {
  return (
    <ProfileProvider>
      <SettingsScreen />
    </ProfileProvider>
  );
}
