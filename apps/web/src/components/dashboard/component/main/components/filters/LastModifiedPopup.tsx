/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, type RefObject } from "react";
import { usePopupStore } from "../../../../../shared/popups/popup.store";
import { useClickOutside } from "../../../../../shared/hooks/useOutsideClick";
import { PopupContainer, PopupItem } from "../../styles/filterPopup.styles";
import { usePopupPosition } from "../../../../../shared/hooks/usePopupPosition";
import { useSearchStore } from "../../../../../../store/searchStore";

interface LastModifiedPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const options = [
  { value: "all", label: "Any Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
] as const;

const LastModifiedPopup: React.FC<LastModifiedPopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isLastModifiedPopupOpen);
  const closeLastModifiedPopup = usePopupStore((s) => s.closeLastModifiedPopup);

  const popupRef = useRef<HTMLDivElement>(null);

  const lastModified = useSearchStore((s) => s.filters.lastModified);
  const setLastModified = useSearchStore((s) => s.setLastModified);

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as RefObject<HTMLElement>, closeLastModifiedPopup);

  if (!isOpen) return null;

  return (
    <PopupContainer
      ref={popupRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {options.map((option) => (
        <PopupItem
          key={option.value}
          $selected={lastModified === option.value}
          onClick={() => setLastModified(option.value)}
        >
          {option.label}
        </PopupItem>
      ))}
    </PopupContainer>
  );
};

export default LastModifiedPopup;
