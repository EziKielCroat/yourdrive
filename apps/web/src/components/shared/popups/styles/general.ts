import styled from "styled-components";

export const PopupWrapper = styled.div`
  position: fixed;
  background: white;
  top: ${(props) => props.style?.top ?? 0}px;
  left: ${(props) => props.style?.left ?? 0}px;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
`;

export const PopupItems = styled.div`
  display: flex;
  flex-direction: row;
  padding: 12px 6px;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

export const PopupIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PopupText = styled.span`
  font-size: 15px;
  color: #363840;
`;
