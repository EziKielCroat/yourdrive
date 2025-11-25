import { createPortal } from "react-dom";

const PopupPortal = ({ children }: { children: React.ReactNode }) => {
  const root = document.getElementById("popup-root");
  return root ? createPortal(children, root) : null;
};

export default PopupPortal;
