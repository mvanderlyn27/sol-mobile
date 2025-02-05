import { observable } from "@legendapp/state";
import { Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");
interface AppStore {
  adjustedWidth: number;
  adjustedHeight: number;
  saving: boolean;
  loading: boolean;
  offline: boolean;
}
export const appState$ = observable<AppStore>({
  adjustedHeight: height,
  adjustedWidth: width,
  saving: false,
  loading: false,
  offline: false,
});
