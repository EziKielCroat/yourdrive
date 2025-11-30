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
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
`;
