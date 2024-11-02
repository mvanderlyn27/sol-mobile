import { observer } from "@legendapp/state/react";
import DbTest from "../playground/dbTest";

const HomeScreen = observer(function HomeScreen() {
  return <DbTest />;
});
export default HomeScreen;
