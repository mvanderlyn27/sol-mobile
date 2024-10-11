import JournalScreen from "@/src/components/screens/JournalScreen";
import { CanvasProvider } from "@/src/contexts/CanvasProvider";

export default function JournalTab() {
  return (
    <CanvasProvider>
      <JournalScreen />
    </CanvasProvider>
  );
}
