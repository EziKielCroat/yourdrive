/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, type RefObject } from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import { usePopupPosition } from "../../hooks/usePopupPosition";

import {
  PopupContainer,
  PopupItem,
} from "../../../dashboard/component/main/styles/filterPopup.styles";

import WarningIcon from "../../icons/warning";
import InfoIcon from "../../icons/info";

interface NotificationPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

interface NotificationItem {
  id: string;
  type: "info" | "warning" | "alert";
  message: string;
  timestamp: string;
}

const NOTIFICATION_ICONS = {
  info: InfoIcon,
  warning: WarningIcon,
  alert: WarningIcon,
};

const notificationsMock: NotificationItem[] = [
  {
    id: "1",
    type: "info",
    message: "Your files have been synchronized.",
    timestamp: "Just now",
  },
  {
    id: "2",
    type: "warning",
    message: "Storage is almost full.",
    timestamp: "5 min ago",
  },
  {
    id: "3",
    type: "alert",
    message: "Failed to upload 2 files.",
    timestamp: "10 min ago",
  },
];

const NotificationPopup: React.FC<NotificationPopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isNotificationPopupOpen);
  const closePopup = usePopupStore((s) => s.closeNotificationPopup);

  const popupRef = useRef<HTMLDivElement>(null);

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as RefObject<HTMLElement>, closePopup);

  if (!isOpen) return null;

  return (
    <PopupContainer
      ref={popupRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "260px",
        padding: "8px 0",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      {notificationsMock.length === 0 && (
        <PopupItem $selected={false}>No notifications</PopupItem>
      )}

      {notificationsMock.map((noti) => {
        const Icon = NOTIFICATION_ICONS[noti.type];

        return (
          <PopupItem
            key={noti.id}
            $selected={false}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              padding: "10px 14px",
            }}
          >
            <Icon color="#535355" />

            <div>
              <div style={{ fontWeight: 600 }}>{noti.message}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {noti.timestamp}
              </div>
            </div>
          </PopupItem>
        );
      })}
    </PopupContainer>
  );
};

export default NotificationPopup;
