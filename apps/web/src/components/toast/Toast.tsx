import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { CheckCircleIcon as CheckCircle, XCircleIcon as XCircle, InfoIcon as Info, AlertTriangleIcon as AlertTriangle, XIcon as X } from "../shared/icons/index";

export interface ToastProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
        return <Info size={20} />;
    }
  };

  return (
    <ToastContainer $type={type} $isExiting={isExiting}>
      <IconWrapper $type={type}>{getIcon()}</IconWrapper>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>
        <X size={16} />
      </CloseButton>
    </ToastContainer>
  );
};

export default Toast;

/* styles */
const slideIn = keyframes`
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
`;

const ToastContainer = styled.div<{
  $type: "success" | "error" | "info" | "warning";
  $isExiting: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  animation: ${({ $isExiting }) => ($isExiting ? slideOut : slideIn)} 0.3s
    cubic-bezier(0.4, 0, 0.2, 1) forwards;
  border-left: 4px solid
    ${({ $type }) =>
      ({
        success: "#0f9d58",
        error: "#d93025",
        warning: "#f9ab00",
        info: "#1a73e8",
      })[$type]};
`;

const IconWrapper = styled.div<{ $type: ToastProps["type"] }>`
  color: ${({ $type }) =>
    ({
      success: "#0f9d58",
      error: "#d93025",
      warning: "#f9ab00",
      info: "#1a73e8",
    })[$type]};
`;

const Message = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;
