import { useEffect, useState } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router/router";
import { useAuthStore, authRehydratedPromise } from "./store/authStore";
import Application from "./App";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

const auth = {
  isLoggedIn: () => !!localStorage.getItem("accessToken"),
  logout: () => useAuthStore.getState().logout(),
};

export function AppRoot() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authRehydratedPromise.then(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return null;
  }

  return (
    <Application>
      <ErrorBoundary>
        <RouterProvider router={router} context={{ auth }} />
      </ErrorBoundary>
    </Application>
  );
}

export { auth };
