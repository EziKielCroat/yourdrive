import React from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import PopupPortal from "../../Portal/Portal";

interface UploadPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement>;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isUploadPopupOpen);
  const closeUploadPopup = usePopupStore((s) => s.closeUploadPopup);

  const popupRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen, anchorRef]);

  useClickOutside(popupRef as React.RefObject<HTMLElement>, () =>
    closeUploadPopup()
  );

  if (!isOpen) return null;

  return (
    <PopupPortal>
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          background: "white",
          padding: 12,
          borderRadius: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          zIndex: 9999,
          /*on hover of children give cursor pointer*/
        }}
      >
        <p style={{ cursor: "pointer", margin: "4px 0" }}>Nova mapa</p>
        <p style={{ cursor: "pointer", margin: "4px 0" }}>Prijenos datoteke</p>
        <p style={{ cursor: "pointer", margin: "4px 0" }}>Prijenos mape</p>
      </div>
    </PopupPortal>
  );
};

export default UploadPopup;
