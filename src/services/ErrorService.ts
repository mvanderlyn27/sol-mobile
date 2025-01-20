import { generateId } from "../stores/AsyncStorage";
import { addNotification } from "../stores/NotificationStore";
import { NotificationType } from "../types/shared.types";
import { posthog } from "./Posthog";

export const ErrorService = {
  handleError: (errorName: string, error: string) => {
    posthog.capture(errorName, { error: error });
    addNotification({
      id: generateId(),
      type: NotificationType.error,
      message: error,
    });
    console.log(error);
  },
};
