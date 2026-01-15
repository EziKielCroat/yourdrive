/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, type RefObject } from "react";
import styled from "styled-components";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import { usePopupPosition } from "../../hooks/usePopupPosition";

import { PopupContainer } from "../../../dashboard/component/main/styles/filterPopup.styles";

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

const NOTIFICATION_COLORS = {
  info: {
    bg: "#E3F2FD",
    icon: "#1976D2",
  },
  warning: {
    bg: "#FFF3E0",
    icon: "#F57C00",
  },
  alert: {
    bg: "#FFEBEE",
    icon: "#D32F2F",
  },
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
        width: "320px",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      <NotificationHeader>Notifications</NotificationHeader>

      <NotificationList>
        {notificationsMock.length === 0 && (
          <EmptyState>No new notifications</EmptyState>
        )}

        {notificationsMock.map((noti) => {
          const Icon = NOTIFICATION_ICONS[noti.type];
          const colors = NOTIFICATION_COLORS[noti.type];

          return (
            <NotificationItem key={noti.id}>
              <IconWrapper $bgColor={colors.bg}>
                <Icon color={colors.icon} />
              </IconWrapper>

              <NotificationContent>
                <NotificationMessage>{noti.message}</NotificationMessage>
                <NotificationTime>{noti.timestamp}</NotificationTime>
              </NotificationContent>
            </NotificationItem>
          );
        })}
      </NotificationList>
    </PopupContainer>
  );
};

export default NotificationPopup;

const NotificationHeader = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e7eb;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
`;

const NotificationItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const IconWrapper = styled.div<{ $bgColor: string }>`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background-color: ${(props) => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #6b7280;
`;
