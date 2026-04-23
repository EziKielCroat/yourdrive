import React, { useState } from "react";
import { EyeIcon as Eye, EyeOffIcon as EyeOff, CheckCircleIcon as CheckCircle, AlertCircleIcon as AlertCircle } from "../../shared/icons/index";
import styled from "styled-components";
import type { UserSettings } from "../types/UserSettings";
import TwoFactorSettings from "./TwoFactorSettings";
import { SessionsSection } from "./SessionsSection";
import { settingsService } from "../service/settingsService";
import {
  Section,
  SectionTitle,
  SectionDescription,
  FormGroup,
  Label,
  Input,
  Button,
  InfoCard,
  InfoText,
  SmallText,
} from "../styles/settings.styles";

interface SecuritySectionProps {
  settings?: UserSettings | null;
  updateSecurity?: (data: Partial<UserSettings["security"]>) => Promise<void>;
}

const PasswordFieldWrap = styled.div`
  position: relative;
`;

const VisibilityButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7f95;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Failed to update security setting. Please try again.";
};

export const SecuritySection: React.FC<SecuritySectionProps> = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(password))
      return "Password must contain at least one special character";
    return null;
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    const validation = validatePassword(passwordData.newPassword);
    if (validation) {
      setPasswordError(validation);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    try {
      setPasswordLoading(true);
      await settingsService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error: unknown) {
      setPasswordError(
        getErrorMessage(error).replace(
          "security setting",
          "password. Please check your current password",
        ),
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <TwoFactorSettings />

      <SessionsSection />

      <Section>
        <SectionTitle>Change Password</SectionTitle>
        <SectionDescription>
          Use a strong, unique password to secure your account.
        </SectionDescription>

        {passwordError && (
          <InfoCard style={{ backgroundColor: "#fff4f4", borderColor: "#ffd1d1" }}>
            <InfoText style={{ color: "#991b1b" }}>
              <AlertCircle size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              {passwordError}
            </InfoText>
          </InfoCard>
        )}

        {passwordSuccess && (
          <InfoCard style={{ backgroundColor: "#eafff0", borderColor: "#b8efc9" }}>
            <InfoText style={{ color: "#166534" }}>
              <CheckCircle size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              Password updated successfully.
            </InfoText>
          </InfoCard>
        )}

        <FormGroup>
          <Label>Current Password</Label>
          <PasswordFieldWrap>
            <Input
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              placeholder="Enter current password"
              disabled={passwordLoading}
            />
            <VisibilityButton
              onClick={() =>
                setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
              }
              type="button"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </VisibilityButton>
          </PasswordFieldWrap>
        </FormGroup>

        <FormGroup>
          <Label>New Password</Label>
          <PasswordFieldWrap>
            <Input
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              placeholder="Enter new password"
              disabled={passwordLoading}
            />
            <VisibilityButton
              onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
              type="button"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </VisibilityButton>
          </PasswordFieldWrap>
          <SmallText>
            At least 8 characters with uppercase, lowercase, number and symbol.
          </SmallText>
        </FormGroup>

        <FormGroup>
          <Label>Confirm New Password</Label>
          <PasswordFieldWrap>
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              placeholder="Confirm new password"
              disabled={passwordLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter") handlePasswordUpdate();
              }}
            />
            <VisibilityButton
              onClick={() =>
                setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
              }
              type="button"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </VisibilityButton>
          </PasswordFieldWrap>
        </FormGroup>

        <Button $variant="primary" onClick={handlePasswordUpdate} disabled={passwordLoading}>
          {passwordLoading ? "Updating..." : "Update Password"}
        </Button>
      </Section>
    </>
  );
};