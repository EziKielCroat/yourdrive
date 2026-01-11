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

export const PopupSection = styled.div`
  padding: 8px 0;
`;

export const PopupSectionTitle = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PopupDivider = styled.div`
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
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

export const InputGroup = styled.div`
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #5f6368;
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  color: #202124;
  background: white;
  outline: none;

  &:focus {
    border-color: #1a73e8;
  }

  &::placeholder {
    color: #80868b;
  }

  /* Fix for date inputs */
  &[type="date"] {
    color: #202124;

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
    }

    &::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
    }
  }

  /* Fix for number inputs */
  &[type="number"] {
    color: #202124;
  }
`;

export const StyledSelect = styled.select`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background: white;
  color: #202124;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;

  &:focus {
    border-color: #1a73e8;
  }

  &:hover {
    border-color: #c0c0c0;
  }

  option {
    color: #202124;
    background: white;
    padding: 8px;
  }
`;

export const SelectWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
