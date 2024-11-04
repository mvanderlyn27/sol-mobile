import PagerTest from "@/src/components/playground/pagetTest";
import { observer } from "@legendapp/state/react";

const Journal = observer(function Journal() {
  return <PagerTest />;
});
export default Journal;
