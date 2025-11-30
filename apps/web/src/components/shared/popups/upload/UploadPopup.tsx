import React from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import PopupPortal from "../../Portal/Portal";
import { PopupItems, PopupWrapper } from "../styles/general";

interface UploadPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
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
      <PopupWrapper
        ref={popupRef}
        style={{
          top: coords.top,
          left: coords.left,
        }}
      >
        <PopupItems>Nova mapa</PopupItems>
        <PopupItems>Prijenos datoteke</PopupItems>
        <PopupItems>Prijenos mape</PopupItems>
      </PopupWrapper>
    </PopupPortal>
  );
};

export default UploadPopup;
