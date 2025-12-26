import styled from "styled-components";

export const PopupContainer = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 9999;
  padding: 8px 0;
  animation: slideIn 0.15s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const PopupItem = styled.div<{ $selected?: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: ${(props) => (props.$selected ? "#0066ff" : "#1a1a1a")};
  background: ${(props) => (props.$selected ? "#f0f7ff" : "transparent")};
  transition: background 0.15s ease;

  &:hover {
    background: ${(props) => (props.$selected ? "#e6f2ff" : "#f5f5f5")};
  }

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CheckMark = styled.span`
  color: #0066ff;
  font-weight: bold;
  font-size: 16px;
  margin-left: 12px;
`;

export const PopupHeader = styled.div`
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
`;
