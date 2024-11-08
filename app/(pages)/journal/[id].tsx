import PagerTest from "@/src/components/playground/pagetTest";
import { groupStore$ } from "@/src/stores/GroupStore";
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
  groupStore$.selectedGroup.set(groupId);
  console.log("group Id", groupId);
  return <PagerTest groupId={groupId} />;
});
export default Journal;
