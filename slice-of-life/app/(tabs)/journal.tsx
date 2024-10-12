import JournalScreen from "@/src/components/screens/JournalScreen";
import { CanvasProvider } from "@/src/contexts/CanvasProvider";
import { JournalProvider } from "@/src/contexts/JournalProvider";
export default function JournalTab() {
  return (
    <CanvasProvider>
      <JournalProvider>
        <JournalScreen />
      </JournalProvider>
    </CanvasProvider>
  );
}
