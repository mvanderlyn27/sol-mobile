import { create } from "zustand";
interface UIState {
  displayNavigationBar: boolean;
  displayBottomBar: boolean;
  displayQuickActionsOverlay: boolean;
  displayJournalEditMenu: boolean;
  setNavigationBarDisplay: (val: boolean) => void;
  setBottomBarDisplay: (val: boolean) => void;
  setQuickActionsOverlayDisplay: (val: boolean) => void;
  setJournalEditMenuDisplay: (val: boolean) => void;
}
export const useUIStore = create<UIState>((set) => ({
  displayNavigationBar: false,
  displayBottomBar: false,
  displayQuickActionsOverlay: false,
  displayJournalEditMenu: true,
  setNavigationBarDisplay: (val: boolean) => set(() => ({ displayNavigationBar: val })),
  setBottomBarDisplay: (val: boolean) => set(() => ({ displayBottomBar: val })),
  setQuickActionsOverlayDisplay: (val: boolean) => set(() => ({ displayQuickActionsOverlay: val })),
  setJournalEditMenuDisplay: (val: boolean) => set(() => ({ displayJournalEditMenu: val })),
}));
