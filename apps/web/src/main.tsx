import "./index.css";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router/router";
import { useAuthStore } from "./store/authStore";

const auth = {
  isLoggedIn: () => !!localStorage.getItem("token"),
  logout: () => useAuthStore.getState().logout(),
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} context={{ auth }} />
);
