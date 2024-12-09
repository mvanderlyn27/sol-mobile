import { observable } from "@legendapp/state";
import { AuthService } from "../api/auth";
import { Session } from "@supabase/supabase-js";
import { posthog } from "../services/Posthog";
import { NotificationType, Profile } from "../types/shared.types";
import { addNotification } from "./NotificationStore";
import { generateId } from "./AsyncStorage";
import { handleSignup } from "../services/Profile";
interface AuthStore {
  session: Session | null;
  error: string | null;
  loading: boolean;
  init: () => void;
}
const authStore$ = observable<AuthStore>({
  session: null,
  error: null,
  loading: true,
  init: () => {
    authStore$.loading.set(true);
    AuthService.getSession()
      .then((session: Session | null) => {
        authStore$.session.set(session);
        authStore$.loading.set(false);
      })
      .catch((error) => {
        console.debug("Error getting session:", error);
        authStore$.session.set(null);
        authStore$.loading.set(false);
      });
    AuthService.setupSessionListener(authStore$.session.set);
  },
});
export default authStore$;
