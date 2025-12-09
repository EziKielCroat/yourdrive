/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePopupStore } from "../../../../../shared/popups/popup.store";
import { useClickOutside } from "../../../../../shared/hooks/useOutsideClick";
import PopupPortal from "../../../../../shared/Portal/Portal";
import { PopupWrapper } from "../../../../../shared/popups/styles/general";

interface FileTypePopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const FileTypePopup: React.FC<FileTypePopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isFileTypePopupOpen);
  const closeFileTypePopup = usePopupStore((s) => s.closeFileTypePopup);

  const popupRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }
  }, [isOpen, anchorRef]);

  useClickOutside(popupRef as RefObject<HTMLElement>, closeFileTypePopup);

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

export default FileTypePopup;
