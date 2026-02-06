import React, { useState } from "react";
import { Shield, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import TwoFactorSettings from "./TwoFactorSettings";
import { settingsService } from "../service/settingsService";
import {
  Section,
  SectionTitle,
  SectionDescription,
  ToggleWrapper,
  ToggleInfo,
  ToggleTitle,
  ToggleDescription,
  Toggle,
  FormGroup,
  Label,
  Input,
  Button,
  InfoCard,
  InfoText,
  SmallText,
} from "../styles/settings.styles";

interface SecuritySectionProps {
  settings: any;
  updateSecurity: (data: any) => Promise<void>;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  settings,
  updateSecurity,
}) => {
  const [securityData, setSecurityData] = useState<Record<string, boolean>>({
    twoFactorEnabled: settings?.security?.twoFactorEnabled || false,
    clientSideEncryption: settings?.security?.clientSideEncryption || false,
    offlineModeEnabled: settings?.security?.offlineModeEnabled || false,
  });

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

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleToggle = async (field: string) => {
    try {
      setLoading(true);
      const newValue = !securityData[field];
      await updateSecurity({ [field]: newValue });
      setSecurityData((prev) => ({ ...prev, [field]: newValue }));
    } catch (error) {
      console.error("Failed to update security setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    const passwordValidationError = validatePassword(passwordData.newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
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

      // Clear form and show success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("Failed to update password:", error);
      setPasswordError(
        error.message || "Failed to update password. Please check your current password and try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <TwoFactorSettings /> 
      <Section>
        <SectionTitle>Change Password</SectionTitle>
        <SectionDescription>
          Update your password to keep your account secure
        </SectionDescription>

        {passwordError && (
          <InfoCard style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
            <InfoText style={{ color: "#991b1b" }}>
              <AlertCircle
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              {passwordError}
            </InfoText>
          </InfoCard>
        )}

        {passwordSuccess && (
          <InfoCard style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <InfoText style={{ color: "#166534" }}>
              <CheckCircle
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              Password updated successfully!
            </InfoText>
          </InfoCard>
        )}

        <FormGroup>
          <Label>Current Password</Label>
          <div style={{ position: "relative" }}>
            <Input
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              placeholder="Enter current password"
              disabled={passwordLoading}
            />
            <button
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  current: !prev.current,
                }))
              }
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
              type="button"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormGroup>

        <FormGroup>
          <Label>New Password</Label>
          <div style={{ position: "relative" }}>
            <Input
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder="Enter new password"
              disabled={passwordLoading}
            />
            <button
              onClick={() =>
                setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
              }
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
              type="button"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <SmallText style={{ marginTop: "0.5rem" }}>
            Must be at least 8 characters with uppercase, lowercase, number, and
            special character
          </SmallText>
        </FormGroup>

        <FormGroup>
          <Label>Confirm New Password</Label>
          <div style={{ position: "relative" }}>
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm new password"
              disabled={passwordLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handlePasswordUpdate();
                }
              }}
            />
            <button
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  confirm: !prev.confirm,
                }))
              }
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
              type="button"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormGroup>

        <Button 
          variant="primary" 
          onClick={handlePasswordUpdate}
          disabled={passwordLoading}
        >
          {passwordLoading ? "Updating..." : "Update Password"}
        </Button>
      </Section>
    </>
  );
};