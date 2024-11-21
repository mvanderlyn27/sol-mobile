import { observable } from "@legendapp/state";
import { LocalNotification } from "../types/shared.types";

interface NotificationStore {
  notifications: LocalNotification[];
}
export const notificationStore$ = observable<NotificationStore>({
  notifications: [],
});
export const addNotification = (notification: LocalNotification) => {
  console.log("notification added");
  notificationStore$.notifications.set((prev) => [...prev, notification]);
  console.log("notofications", notificationStore$.notifications.get());
};
