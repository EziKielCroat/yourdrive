import React, { useState } from "react";
import styled from "styled-components";
import { XIcon as X, MailIcon as Mail, LockIcon as Lock, CheckCircleIcon as CheckCircle, AlertCircleIcon as AlertCircle } from "../shared/icons/index";
import api from "../../lib/axios";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  padding: 8px;

  &:hover {
    color: #334155;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #e2e8f0;
    z-index: 1;
  }
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const StepCircle = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(props) =>
    props.$completed ? "#10b981" : props.$active ? "#3b82f6" : "#e2e8f0"};
  color: ${(props) =>
    props.$completed || props.$active ? "white" : "#64748b"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const StepLabel = styled.span<{ $active: boolean }>`
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  color: ${(props) => (props.$active ? "#3b82f6" : "#64748b")};
  text-align: center;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #64748b;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  color: #000000;
  box-sizing: border-box;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Button = styled.button<{ $fullWidth?: boolean }>`
  background: #3b82f6;
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  color: #475569;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #166534;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #991b1b;
`;

const CodeInput = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const CodeDigit = styled.input`
  width: 48px;
  height: 56px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #cbd5e1;
  }
`;

const HelperText = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0 0;
  text-align: center;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onLoginClick,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleClose = () => {
    onClose();
    // Reset form
    setTimeout(() => {
      setStep(1);
      setEmail("");
      setCode(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
      setUserId("");
      setResetToken("");
    }, 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setIsLoading(true);

  try {
    const response = await api.post("/auth/password/forgot", { email });
    
    if (response.data.success) {
      // Use the userId returned from API (if it exists)
      if (response.data.userId) {
        setUserId(response.data.userId);
        setSuccess("Reset code has been sent to your email. Please check your inbox.");
        setStep(2);
      } else {
        // User doesn't exist, but we show same message for security
        setSuccess("If an account with this email exists, a reset code has been sent.");
        // Don't proceed to next step
      }
    }
  } catch (err: any) {
    setError(err.response?.data?.error || "Failed to send reset code");
  } finally {
    setIsLoading(false);
  }
};

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/password/verify-code", {
        userId,
        code: fullCode,
      });

      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/password/reset", {
        resetToken,
        newPassword,
      });

      if (response.data.success) {
        setSuccess("Password reset successful! You can now log in.");
        setTimeout(() => {
          handleClose();
          onLoginClick();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const steps = [
    { number: 1, label: "Enter Email" },
    { number: 2, label: "Enter Code" },
    { number: 3, label: "New Password" },
  ];

  return (
    <Overlay $isOpen={isOpen} onClick={handleClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Reset Password</Title>
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          <StepIndicator>
            {steps.map((stepItem) => (
              <Step
                key={stepItem.number}
                $active={step === stepItem.number}
                $completed={step > stepItem.number}
              >
                <StepCircle
                  $active={step === stepItem.number}
                  $completed={step > stepItem.number}
                >
                  {step > stepItem.number ? (
                    <CheckCircle size={20} />
                  ) : (
                    stepItem.number
                  )}
                </StepCircle>
                <StepLabel $active={step === stepItem.number}>
                  {stepItem.label}
                </StepLabel>
              </Step>
            ))}
          </StepIndicator>

          {error && (
            <ErrorMessage>
              <AlertCircle size={20} />
              <span>{error}</span>
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage>
              <CheckCircle size={20} />
              <span>{success}</span>
            </SuccessMessage>
          )}

          {step === 1 && (
            <Form onSubmit={handleEmailSubmit}>
              <InputWrapper>
                <Icon>
                  <Mail size={20} />
                </Icon>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputWrapper>

              <HelperText>
                We'll send a 6-digit verification code to this email address.
              </HelperText>

              <ActionRow>
                <SecondaryButton type="button" onClick={handleClose}>
                  Cancel
                </SecondaryButton>
                <Button type="submit" disabled={isLoading} $fullWidth>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </ActionRow>
            </Form>
          )}

          {step === 2 && (
            <Form onSubmit={handleCodeSubmit}>
              <div>
                <CodeInput>
                  {code.map((digit, index) => (
                    <CodeDigit
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      placeholder="0"
                      autoFocus={index === 0}
                    />
                  ))}
                </CodeInput>
                <HelperText>
                  Enter the 6-digit code sent to {email}
                </HelperText>
              </div>

              <ActionRow>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setCode(["", "", "", "", "", ""]);
                  }}
                >
                  Back
                </SecondaryButton>
                <Button type="submit" disabled={isLoading} $fullWidth>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </ActionRow>
            </Form>
          )}

          {step === 3 && (
            <Form onSubmit={handlePasswordSubmit}>
              <InputWrapper>
                <Icon>
                  <Lock size={20} />
                </Icon>
                <Input
                  type="password"
                  placeholder="New password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </InputWrapper>

              <InputWrapper>
                <Icon>
                  <Lock size={20} />
                </Icon>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </InputWrapper>

              <ActionRow>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Back
                </SecondaryButton>
                <Button type="submit" disabled={isLoading} $fullWidth>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </ActionRow>
            </Form>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
}