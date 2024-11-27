import { observable } from "@legendapp/state";
import { LocalNotification } from "../types/shared.types";

interface NotificationStore {
  notifications: LocalNotification[];
  incomingRoute: string | null;
}
export const notificationStore$ = observable<NotificationStore>({
  notifications: [],
  incomingRoute: null,
});
export const addNotification = (notification: LocalNotification) => {
  notificationStore$.notifications.set((prev) => [...prev, notification]);
};
