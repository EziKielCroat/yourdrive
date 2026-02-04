import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router/router";
import { useAuthStore } from "./store/authStore";
import { GlobalReset } from "./components/landing/styles/landing";

const auth = {
  isLoggedIn: () => !!localStorage.getItem("token"),
  logout: () => useAuthStore.getState().logout(),
};

function App() {
  return (
    <>
      <RouterProvider router={router} context={{ auth }} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
