import { create } from "zustand";
interface UIState {
  displayNavigationBar: boolean;
  displayBottomBar: boolean;
}
export const useUIStore = create<UIState>((set) => ({
  displayNavigationBar: false,
  displayBottomBar: false,
  setNavigationBarDisplay: (val: boolean) => set(() => ({ displayNavigationBar: val })),
  setBottomBarDisplay: (val: boolean) => set(() => ({ displayBottomBar: val })),
}));
