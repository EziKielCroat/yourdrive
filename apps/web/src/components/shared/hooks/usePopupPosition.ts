import { useState, useEffect } from "react";

export interface PopupPosition {
  top: number;
  left: number;
}

export type PopupPlacement =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

interface UsePopupPositionOptions {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement | null> | null;
  popupRef?: React.RefObject<HTMLElement | null>;
  placement?: PopupPlacement;
  offset?: number;
}

/**
 * Hook to calculate popup position relative to an anchor element
 *
 * @param isOpen - Whether the popup is currently open
 * @param anchorRef - Ref to the element that triggers the popup
 * @param popupRef - Optional ref to the popup itself (for smart positioning)
 * @param placement - Where to position the popup relative to anchor
 * @param offset - Gap between anchor and popup in pixels
 *
 * @returns Position object with top and left coordinates
 */

export function usePopupPosition({
  isOpen,
  anchorRef,
  popupRef,
  placement = "bottom-left",
  offset = 8,
}: UsePopupPositionOptions): PopupPosition {
  const [position, setPosition] = useState<PopupPosition>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRef?.current) {
      return;
    }

    const calculatePosition = () => {
      const anchorRect = anchorRef.current!.getBoundingClientRect();
      const popupRect = popupRef?.current?.getBoundingClientRect();

      let top = 0;
      let left = 0;

      // Calculate base position based on placement
      switch (placement) {
        case "bottom-left":
          top = anchorRect.bottom + offset;
          left = anchorRect.left;
          break;

        case "bottom-right":
          top = anchorRect.bottom + offset;
          left = anchorRect.right - (popupRect?.width || 0);
          break;

        case "top-left":
          top = anchorRect.top - (popupRect?.height || 0) - offset;
          left = anchorRect.left;
          break;

        case "top-right":
          top = anchorRect.top - (popupRect?.height || 0) - offset;
          left = anchorRect.right - (popupRect?.width || 0);
          break;
      }

      // Smart positioning: keep popup within viewport
      if (popupRect) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust horizontal position if popup goes off-screen
        if (left + popupRect.width > viewportWidth) {
          left = viewportWidth - popupRect.width - 16; // 16px margin from edge
        }
        if (left < 16) {
          left = 16;
        }

        // Adjust vertical position if popup goes off-screen
        if (top + popupRect.height > viewportHeight) {
          // Flip to top if there's more space above
          if (anchorRect.top > viewportHeight - anchorRect.bottom) {
            top = anchorRect.top - popupRect.height - offset;
          } else {
            top = viewportHeight - popupRect.height - 16;
          }
        }
        if (top < 16) {
          top = 16;
        }
      }

      setPosition({ top, left });
    };

    // Calculate immediately
    calculatePosition();

    // Recalculate on scroll or resize
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen, anchorRef, popupRef, placement, offset]);

  return position;
}
