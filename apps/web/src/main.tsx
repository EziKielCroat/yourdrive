import "./index.css";
import ReactDOM from "react-dom/client";
import { AppRoot } from "./AppRoot";
import { toast } from "./services/toast.service";

console.log("App starting, toast system:", {
  hasInstance: !!toast,
});

const container = document.getElementById("root")!;
type Root = ReturnType<typeof ReactDOM.createRoot>;
const root: Root = (window as Window & { __reactRoot?: Root }).__reactRoot ?? ReactDOM.createRoot(container);
if (!(window as Window & { __reactRoot?: Root }).__reactRoot) {
  (window as Window & { __reactRoot?: Root }).__reactRoot = root;
}
root.render(<AppRoot />);
