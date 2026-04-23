import styled, { css } from "styled-components";

import { motion } from "framer-motion";
import { DASHBOARD_NAV_HEIGHT_PX } from "./application";

const MOBILE_DRAWER_WIDTH = "min(280px, 88vw)";

export interface SidebarWrapperProps {
  $isOpen: boolean;
  /** When true, drawer uses fixed overlay + translateX (no flex "peek"). */
  $isMobile: boolean;
}

export const SidebarWrapper = styled(motion.aside).attrs<SidebarWrapperProps>(
  ({ $isMobile }) => {
    if ($isMobile) {
      return {
        initial: { x: "-100%" },
        animate: { x: 0 },
        transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
      };
    }
    return {
      initial: { width: 0, opacity: 0, marginRight: 0 },
      animate: {
        width: "200px",
        opacity: 1,
        marginRight: "16px",
      },
      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
    };
  },
)<SidebarWrapperProps>`
  box-sizing: border-box;
  pointer-events: auto;
  z-index: 30;
  overflow: hidden;

  ${({ $isMobile }) =>
    $isMobile
      ? css`
          position: fixed;
          top: ${DASHBOARD_NAV_HEIGHT_PX}px;
          left: 0;
          bottom: 0;
          width: ${MOBILE_DRAWER_WIDTH};
          min-width: 0;
          max-width: 100%;
          height: calc(100dvh - ${DASHBOARD_NAV_HEIGHT_PX}px);
          max-height: calc(100dvh - ${DASHBOARD_NAV_HEIGHT_PX}px);
          margin-right: 0;
          background: rgba(248, 249, 250, 0.98);
          box-shadow: 2px 0 12px rgba(15, 23, 42, 0.12);
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        `
      : css`
          position: relative;
          min-width: 0;
          height: 100%;
          background: transparent;
        `}

  & > *:not(button) {
    opacity: 1;
    transition: opacity 0.2s ease;
  }
`;

export const UserName = styled.h1`
  font-size: 28px;
  font-weight: 500;
  line-height: 32px;
  margin-top: 0px;
  margin-bottom: 6px;
`;

export const UserDevice = styled.h3`
  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  color: #363840;
  margin-top: 0px;
`;

export const Navigation = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 190px;

  margin-top: 22px;
  margin-bottom: 22px;
`;

export const NavItem = styled.li<{ isActive: boolean; color: string }>`
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 10px;
  background: ${({ isActive }) => (isActive ? "#0F85FF" : "transparent")};

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: ${({ color }) => color};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 13px;
    font-weight: ${({ isActive }) => (isActive ? 500 : 400)};
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const UpgradeWrapper = styled.div`
  max-width: 190px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ProgressBar = styled.div`
  height: 5px;
  background: #c4ccd6;
  border-radius: 4px;
  overflow: hidden;
  width: inherit;
`;

export const ProgressFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => `${percentage * 100}%`};
  height: inherit;
  background: #2d9cff;
  transition: width 0.3s ease;
`;

export const UsageText = styled.div`
  font-size: 12px;
  color: #1a1a1a;

  span {
    color: #2d9cff;
    cursor: pointer;
  }
`;

export const UpgradeButton = styled.button`
  margin-top: 4px;
  padding: 10px 0;
  width: 100%;
  border-radius: 9999px;
  border: 1px solid #363840;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s ease;
  color: #363840;

  &:hover {
    background: #363840;
    color: white;
  }
`;
