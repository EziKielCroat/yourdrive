import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import styled, { createGlobalStyle } from "styled-components";
import { MailIcon as Mail, LockIcon as Lock, UserIcon as User, XIcon as X, EyeIcon as Eye, EyeOffIcon as EyeOff } from "../shared/icons/index";
import { useAuthStore } from "../../store/authStore";

const FontStyles = () => {
  const GlobalFontStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  `;

  return <GlobalFontStyle />;
};

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
  font-family: "Poppins", sans-serif;
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
  color: #1F9AFE;
  font-family: "Poppins", sans-serif;
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
  font-family: "Poppins", sans-serif;

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
  font-family: "Poppins", sans-serif;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 40px;
  font-family: "Poppins", sans-serif;
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
  pointer-events: none;
  z-index: 1;
  transition: color 0.2s ease;
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
  z-index: 2;

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
  font-family: "Poppins", sans-serif;
  transition: all 0.2s ease;
  position: relative;

  &::placeholder {
    color: #94a3b8;
    font-family: "Poppins", sans-serif;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

    & + ${Icon} {
      color: #3b82f6;
    }
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  /* Invalid state */
  &:invalid:not(:placeholder-shown):not(:focus) {
    border-color: #ef4444;

    & + ${Icon} {
      color: #ef4444;
    }
  }

  /* Valid state when filled */
  &:valid:not(:placeholder-shown):not(:focus) {
    border-color: #10b981;

    & + ${Icon} {
      color: #10b981;
    }
  }

  /* Disabled state */
  &:disabled {
    background-color: #f8fafc;
    border-color: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;

    & + ${Icon} {
      color: #cbd5e1;
    }
  }

  /* Error state (for programmatic validation) */
  &.error {
    border-color: #ef4444;

    & + ${Icon} {
      color: #ef4444;
    }
  }

  /* Success state (for programmatic validation) */
  &.success {
    border-color: #10b981;

    & + ${Icon} {
      color: #10b981;
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
  font-family: "Poppins", sans-serif;

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
  font-family: "Poppins", sans-serif;

  button {
    border: none;
    background: none;
    color: #3b82f6;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-family: "Poppins", sans-serif;

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
    font-family: "Poppins", sans-serif;
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    firstName: false,
    email: false,
    password: false,
  });
  const [submitError, setSubmitError] = useState("");

  const validateEmail = (emailVal: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailVal);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitError("");

    const newErrors = {
      firstName: firstName.trim().length === 0,
      email: !validateEmail(email),
      password: password.length < 6,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setSubmitError("Please fix the errors above.");
      return;
    }

    try {
      await register(email, password, firstName);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Registration failed. Please try again.";
      setSubmitError(msg);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: false,
    }));

    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  return (
    <>
      <FontStyles />
      <Page>
        <Left>
          <Header>
            <Logo>Nexa Core</Logo>
            <CloseButton onClick={() => navigate({ to: "/" })}>
              <X size={20} />
              Close
            </CloseButton>
          </Header>

          <Content>
            <Card>
              <Title>Create an Account</Title>
              <Subtitle>Please enter your details to register.</Subtitle>

              {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

              <Form onSubmit={handleSubmit} noValidate>
                <InputWrapper>
                  <Icon>
                    <User size={20} />
                  </Icon>
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                    autoComplete="off"
                    className={
                      errors.firstName ? "error" : firstName ? "success" : ""
                    }
                  />
                </InputWrapper>

                <InputWrapper>
                  <Icon>
                    <Mail size={20} />
                  </Icon>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    autoComplete="off"
                    className={
                      errors.email
                        ? "error"
                        : email && validateEmail(email)
                          ? "success"
                          : ""
                    }
                  />
                </InputWrapper>

                <InputWrapper>
                  <Icon>
                    <Lock size={20} />
                  </Icon>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    minLength={6}
                    autoComplete="off"
                    className={
                      errors.password
                        ? "error"
                        : password.length >= 6
                          ? "success"
                          : ""
                    }
                  />
                  <ToggleIcon
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </ToggleIcon>
                </InputWrapper>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </Form>

              <LinkRow>
                Already have an account?{" "}
                <button type="button" onClick={() => navigate({ to: "/login" })}>
                  Sign in
                </button>
              </LinkRow>
            </Card>
          </Content>
        </Left>

        <Right>
          <RightContent>
            <h2>
              Send, receive and edit files with <span>NexaCore</span>
            </h2>
          </RightContent>
        </Right>
      </Page>
    </>
  );
}
