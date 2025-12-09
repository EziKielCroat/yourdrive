/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePopupStore } from "../../../../../shared/popups/popup.store";
import { useClickOutside } from "../../../../../shared/hooks/useOutsideClick";
import PopupPortal from "../../../../../shared/Portal/Portal";
import { PopupWrapper } from "../../../../../shared/popups/styles/general";

interface LastModifiedPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const LastModifiedPopup: React.FC<LastModifiedPopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isLastModifiedPopupOpen);
  const closeLastModifiedPopup = usePopupStore((s) => s.closeLastModifiedPopup);

  const popupRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }
  }, [isOpen, anchorRef]);

  useClickOutside(popupRef as RefObject<HTMLElement>, closeLastModifiedPopup);

  if (!isOpen) return null;

  return (
    <PopupPortal>
      <PopupWrapper
        ref={popupRef}
        style={{ top: coords.top, left: coords.left }}
      ></PopupWrapper>
    </PopupPortal>
  );
};

export default LastModifiedPopup;
