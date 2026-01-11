import React from "react";
import {
  useSearchStore,
  type FileTypeFilter,
} from "../../../../../../store/searchStore";
import { usePopupStore } from "../../../../../shared/popups/popup.store";
import { PopupContainer, PopupItem } from "../../styles/filterPopup.styles";
import { useClickOutside } from "../../../../../shared/hooks/useOutsideClick";
import { usePopupPosition } from "../../../../../shared/hooks/usePopupPosition";

interface FileTypePopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const fileTypes: { value: FileTypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "documents", label: "Documents" },
  { value: "images", label: "Images" },
  { value: "videos", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "other", label: "Other" },
];

const FileTypePopup: React.FC<FileTypePopupProps> = ({ anchorRef }) => {
  const popupRef = React.useRef<HTMLDivElement>(null);

  const isOpen = usePopupStore((s) => s.isFileTypePopupOpen);
  const closePopup = usePopupStore((s) => s.toggleFileTypePopup);

  const fileType = useSearchStore((s) => s.filters.fileType);
  const setFileType = useSearchStore((s) => s.setFileType);

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as React.RefObject<HTMLElement>, closePopup);

  if (!isOpen) return null;

  const handleSelect = (type: FileTypeFilter) => {
    setFileType(type);
    closePopup();
  };

  return (
    <PopupContainer
      ref={popupRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {fileTypes.map((type) => (
        <PopupItem
          key={type.value}
          $selected={fileType === type.value}
          onClick={() => handleSelect(type.value)}
        >
          {type.label}
        </PopupItem>
      ))}
    </PopupContainer>
  );
};

export default FileTypePopup;
