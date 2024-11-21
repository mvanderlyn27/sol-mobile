import { observable } from "@legendapp/state";

export const uiStore$ = observable({
  displayNavigationBar: false,
  displayCanvasMenu: false,
  displayQuickActionsOverlay: false,
  displayJournalMenu: true,
  displayImageEditOverlay: false,
  displaySideBar: false,
  displayReactMenu: false,
  displayTextOverlay: false,
  displayReactOverlay: false,
  showNotification: () => {
    //probably add to a notifcation context to get the toast hook
  },
});
