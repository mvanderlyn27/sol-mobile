import { Link, Redirect } from "expo-router";
import JournalScreen from "@/src/components/screens/JournalScreen";
import { CanvasProvider } from "@/src/contexts/CanvasProvider";
import { JournalProvider } from "@/src/contexts/JournalProvider";
import { useData } from "@/src/contexts/DataProvider";
export default function Journal() {
  const { profile } = useData();
  if (profile?.new) {
    return <Redirect href="/tutorial" />;
  }

  return (
    <CanvasProvider>
      <JournalProvider>
        <JournalScreen />
      </JournalProvider>
    </CanvasProvider>
  );
}
