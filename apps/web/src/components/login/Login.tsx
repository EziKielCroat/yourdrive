import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import styled from "styled-components";
import { Lock, Mail, X, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import TwoFactorModal from "../auth/TwoFactorModal";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";
import api from "../../lib/axios";

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  background: #a3b0bd;
  overflow-y: hidden;
  margin: 0;
  padding: 0;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 32px 48px;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 80px;
`;

const Logo = styled.h1`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0;
  color: #1f9afe;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 8px;

  &:hover {
    color: #334155;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #000000;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const ToggleIcon = styled.button`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: #334155;
  }
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

const ForgotPassword = styled.div`
  text-align: right;
  margin-top: -8px;

  button {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 14px;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Button = styled.button`
  background: #3b82f6;
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 12px;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinkRow = styled.div`
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #64748b;

  button {
    border: none;
    background: none;
    color: #3b82f6;
    font-weight: 600;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Right = styled.div`
  flex: 1;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const RightContent = styled.div`
  text-align: center;
  color: #ffffff;
  max-width: 600px;

  h2 {
    font-size: 48px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
  }

  span {
    color: #3b82f6;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  color: #991b1b;
  font-size: 14px;
  margin-bottom: 16px;
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    try {
      const result = await login(email, password);

      if (result.requires2FA) {
        setTempToken(result.tempToken || "");
        setShow2FAModal(true);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : ((
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            )?.response?.data?.error ??
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ??
            "Login failed. Please check your credentials.");
      setError(msg);
    }
  };

  const handle2FAVerification = async (
    code: string,
    isRecoveryCode: boolean = false,
  ) => {
    setIs2FALoading(true);
    setTwoFactorError("");

    try {
      // NexaCore uses a single endpoint that accepts both TOTP and recovery codes
      const response = await api.post("/auth/totp/verify", {
        tempToken,
        ...(isRecoveryCode ? { recoveryCode: code } : { token: code }),
      });

      const data = response.data;

      if (!data || !data.accessToken) {
        throw new Error(data?.error || "Invalid verification code");
      }

      // NexaCore returns refreshToken in cookie, just store accessToken
      localStorage.setItem("accessToken", data.accessToken);

      // Update auth store
      const authStore = useAuthStore.getState();
      authStore.setUser(data.user);
      authStore.setAuthenticated(true);
      if (data.currentDevice) {
        useAuthStore.setState({ currentDevice: data.currentDevice });
      }
      // Fetch devices to ensure everything is synced
      await authStore.fetchDevices();

      // Close modal and navigate
      setShow2FAModal(false);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : ((
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            )?.response?.data?.error ??
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ??
            "Verification failed");
      setTwoFactorError(msg);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handle2FAClose = () => {
    setShow2FAModal(false);
    setTempToken("");
    setTwoFactorError("");
  };

  return (
    <>
      <Page>
        <Left>
          <Header>
            <Logo>NexaCore</Logo>
            <CloseButton onClick={() => navigate({ to: "/" })}>
              <X size={20} />
              Close
            </CloseButton>
          </Header>

          <Content>
            <Card>
              <Title>Welcome Back,</Title>
              <Subtitle>Please enter your details to login.</Subtitle>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Form onSubmit={handleSubmit} noValidate>
                <InputWrapper>
                  <Icon>
                    <Mail size={20} />
                  </Icon>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </InputWrapper>

                <InputWrapper>
                  <Icon>
                    <Lock size={20} />
                  </Icon>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <ToggleIcon
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </ToggleIcon>
                </InputWrapper>

                <ForgotPassword>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </ForgotPassword>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Form>

              <LinkRow>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate({ to: "/register" })}
                >
                  Sign Up
                </button>
              </LinkRow>
            </Card>
          </Content>
        </Left>

        <Right>
          <RightContent>
            <h2>
              Send, receive and edit files
              <br />
              with <span>NexaCore</span>
            </h2>
          </RightContent>
        </Right>
      </Page>

      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={handle2FAClose}
        onVerify={handle2FAVerification}
        isLoading={is2FALoading}
        error={twoFactorError}
      />

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onLoginClick={() => {
          setShowForgotPassword(false);
          // Focus email field when returning to login
          setTimeout(() => {
            const emailInput = document.querySelector(
              'input[type="email"]',
            ) as HTMLInputElement;
            if (emailInput) emailInput.focus();
          }, 100);
        }}
      />
    </>
  );
}
