import "./index.css";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router/router";
import { useAuthStore } from "./store/authStore";
import { toast } from "./services/toast.service";

const auth = {
  isLoggedIn: () => !!localStorage.getItem("token"),
  logout: () => useAuthStore.getState().logout(),
};

console.log("App starting, toast system:", {
  hasInstance: !!toast,
  callbacks: toast["callbacks"] || "none",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} context={{ auth }} />,
);
