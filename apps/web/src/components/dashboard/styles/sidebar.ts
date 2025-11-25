import styled from "styled-components";

export const SidebarWrapper = styled.aside`
  min-width: 200px;
  background: transparent;
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
  max-width: 165px;

  margin-top: 22px;
  margin-bottom: 22px;
`;

export const NavItem = styled.li<{ isActive: boolean; color: string }>`
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: ${({ isActive }) => (isActive ? "#0F85FF" : "transparent")};

  a {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: ${({ color }) => color};
  }

  span {
    font-size: 14px;
    font-weight: ${({ isActive }) => (isActive ? 450 : 400)};
    line-height: 18px;
  }
`;

export const UpgradeWrapper = styled.div`
  max-width: 165px;
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
