import PagerTest from "@/src/components/playground/pagetTest";
import { observer } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";

const Journal = observer(function Journal() {
  const ensureNotArray = (input: string | string[]) => {
    if (Array.isArray(input)) {
      return input[0];
    }
    return input;
  };
  const groupId = ensureNotArray(useLocalSearchParams().id);
  console.log("group Id", groupId);
  return <PagerTest />;
});
export default Journal;
