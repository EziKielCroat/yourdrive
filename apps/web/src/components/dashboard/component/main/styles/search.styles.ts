import styled from "styled-components";

export const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica",
    "Arial", sans-serif;
`;

export const InputWrapper = styled.div`
  position: relative;
  min-width: 450px;
  display: flex;
  justify-content: center;

  svg {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    width: 18px;
    height: 18px;
  }

  svg:nth-of-type(1) {
    left: 14px;
  }

  svg:nth-of-type(2) {
    right: 14px;
    cursor: pointer;
    pointer-events: auto;
  }

  input {
    background: #e9eef6;
    min-width: 450px;
    padding: 10px 44px;
    border: none;
    outline: none;
    border-radius: 8px;
    height: 42px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    color: #1a1a1a;
    transition: background 0.15s ease;

    &:focus {
      background: #dde4f0;
    }

    &::placeholder {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #6b7280;
      letter-spacing: -0.01em;
    }
  }
`;

export const FilterButtons = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const FilterButton = styled.button`
  background: #e9eef6;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  transition: all 0.15s ease;
  height: 32px;

  &:hover {
    background: #dde4f0;
  }

  &:active {
    background: #d1dae8;
    transform: scale(0.98);
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 13px;

    svg {
      width: 13px;
      height: 14px;
    }
  }
`;

export const FilterText = styled.span`
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: -0.01em;
  color: #374151;
`;
