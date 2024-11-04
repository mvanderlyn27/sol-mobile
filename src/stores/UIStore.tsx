import { observable } from "@legendapp/state";

export const uiStore$ = observable({
  displayNavigationBar: false,
  displayCanvasMenu: false,
  displayQuickActionsOverlay: false,
  displayJournalMenu: true,
  displayImageEditOverlay: false,
  showNotification: () => {
    //probably add to a notifcation context to get the toast hook
    // Toast.show("Check email for verification", {
    //     duration: 3000,
    //     position: Toast.positions.BOTTOM,
    //     backgroundColor: "#E7DBCB",
    //     opacity: 1,
    //     shadow: false,
    //     textColor: "#262326",
    //   });
  },
});
