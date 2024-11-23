import React, { useEffect } from "react";
import { router } from "expo-router";
import { observer } from "@legendapp/state/react";
import authStore$ from "@/src/stores/AuthStore";

const ProtectedLayout = observer(({ children }) => {
  const isAuthenticated = authStore$.session.get() !== null;

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login after component has rendered
      router.replace("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Render nothing while redirecting
    return null;
  }

  // Render protected content if authenticated
  return <>{children}</>;
});

export default ProtectedLayout;
