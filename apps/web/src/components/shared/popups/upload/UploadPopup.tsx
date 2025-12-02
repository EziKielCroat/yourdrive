import React from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import PopupPortal from "../../Portal/Portal";
import {
  PopupIcon,
  PopupItems,
  PopupText,
  PopupWrapper,
} from "../styles/general";
import UploadFolderIcon from "../../icons/uploadFolder";
import NewFolderIcon from "../../icons/newFolder";
import FileUploadIcon from "../../icons/FileUpload";

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

  const uploadOptions = [
    { icon: NewFolderIcon, text: "Nova mapa" },
    { icon: FileUploadIcon, text: "Prijenos datoteke" },
    { icon: UploadFolderIcon, text: "Prijenos mape" },
  ];

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
        {uploadOptions.map((option, index) => {
          const Icon = option.icon;

          return (
            <PopupItems key={index}>
              <PopupIcon>
                <Icon color="#535355" />
              </PopupIcon>
              <PopupText>{option.text}</PopupText>
            </PopupItems>
          );
        })}
      </PopupWrapper>
    </PopupPortal>
  );
};

export default UploadPopup;
