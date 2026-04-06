import styled from "styled-components";

export const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: min(720px, 100%);
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  padding: 0 env(safe-area-inset-right, 0) 0 env(safe-area-inset-left, 0);
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica",
    "Arial", sans-serif;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  > svg {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    width: 18px;
    height: 18px;
  }

  > svg:nth-of-type(1) {
    left: 14px;
  }

  > button[data-advanced-filter="true"] {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  > button[data-advanced-filter="true"] > svg {
    position: static;
    transform: none;
    pointer-events: auto;
    width: 18px;
    height: 18px;
  }

  input {
    background: #e9eef6;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding: 10px 44px;
    border: none;
    outline: none;
    border-radius: 8px;
    height: 44px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 16px;
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

    @media (min-width: 768px) {
      font-size: 14px;
      height: 42px;
    }
  }
`;

export const FilterButtons = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  row-gap: 10px;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 8px;
    justify-content: stretch;
  }
`;

export const FilterButton = styled.button`
  background: #e9eef6;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  transition: all 0.15s ease;
  min-height: 36px;
  flex: 1 1 calc(50% - 6px);
  max-width: 100%;
  min-width: 0;

  &:hover {
    background: #dde4f0;
  }

  &:active {
    background: #d1dae8;
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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

  @media (min-width: 768px) {
    flex: 0 1 auto;
    padding: 6px 12px;
    min-height: 32px;
    border: none;
  }
`;

export const FilterText = styled.span`
  font-weight: 500;
  font-size: clamp(12px, 2.8vw, 13px);
  line-height: 16px;
  letter-spacing: -0.01em;
  color: #374151;
`;
