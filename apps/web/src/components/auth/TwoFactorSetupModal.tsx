import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { ShieldIcon as Shield, XIcon as X, AlertCircleIcon as AlertCircle, ArrowLeftIcon as ArrowLeft } from "../shared/icons/index";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
  font-family: "Poppins", sans-serif;
`;

const Modal = styled.div`
  background: #ffffff;
  border-radius: 20px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: ${slideUp} 0.3s ease;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 32px 32px 0 32px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);

  svg {
    color: white;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;

  &:hover {
    background: #e2e8f0;
    color: #334155;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
`;

const ModalBody = styled.div`
  padding: 32px;
`;

const InputWrapper = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
`;

const CodeInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 20px;
  font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
  letter-spacing: 8px;
  text-align: center;
  transition: all 0.2s;
  box-sizing: border-box;
  color: #000000;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    letter-spacing: normal;
    color: #cbd5e1;
  }

  &.error {
    border-color: #ef4444;
    
    &:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #991b1b;

  svg {
    flex-shrink: 0;
    color: #ef4444;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Poppins", sans-serif;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RecoveryCodeLink = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px;
  margin-top: 12px;
  transition: color 0.2s;
  font-family: "Poppins", sans-serif;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  transition: color 0.2s;
  font-family: "Poppins", sans-serif;

  &:hover {
    color: #334155;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Hint = styled.div`
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  margin-top: 16px;
  line-height: 1.5;
`;

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, isRecoveryCode: boolean) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  onVerify,
  isLoading,
  error,
}: TwoFactorModalProps) {
  const [code, setCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === (useRecoveryCode ? 8 : 6)) {
      await onVerify(code, useRecoveryCode);
    }
  };

  const handleCodeChange = (value: string) => {
    // Allow only digits for TOTP, alphanumeric for recovery codes
    const sanitized = useRecoveryCode 
      ? value.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : value.replace(/\D/g, "");
    
    const maxLength = useRecoveryCode ? 8 : 6;
    setCode(sanitized.slice(0, maxLength));
  };

  const toggleRecoveryCode = () => {
    setUseRecoveryCode(!useRecoveryCode);
    setCode("");
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>

        <ModalHeader>
          <IconWrapper>
            <Shield size={32} />
          </IconWrapper>
          <Title>Two-Factor Authentication</Title>
          <Description>
            {useRecoveryCode 
              ? "Enter one of your recovery codes to sign in"
              : "Enter the 6-digit code from your authenticator app"}
          </Description>
        </ModalHeader>

        <ModalBody>
          {useRecoveryCode && (
            <BackButton onClick={toggleRecoveryCode}>
              <ArrowLeft />
              Back to authenticator code
            </BackButton>
          )}

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <Label>
                {useRecoveryCode ? "Recovery Code" : "Verification Code"}
              </Label>
              <CodeInput
                type="text"
                maxLength={useRecoveryCode ? 8 : 6}
                placeholder={useRecoveryCode ? "XXXXXXXX" : "000000"}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={error ? "error" : ""}
                autoFocus
                autoComplete="off"
              />
            </InputWrapper>

            <Button 
              type="submit" 
              disabled={isLoading || code.length !== (useRecoveryCode ? 8 : 6)}
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>
          </form>

          {!useRecoveryCode && (
            <RecoveryCodeLink onClick={toggleRecoveryCode}>
              Use a recovery code instead
            </RecoveryCodeLink>
          )}

          <Hint>
            {useRecoveryCode 
              ? "Recovery codes are 8 characters long and can only be used once"
              : "Open your authenticator app to view your current code"}
          </Hint>
        </ModalBody>
      </Modal>
    </Overlay>
  );
}