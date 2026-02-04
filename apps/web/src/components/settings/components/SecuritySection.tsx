import React, { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import TwoFactorSettings from "./TwoFactorSettings";
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

  return (
    <>
      <TwoFactorSettings />
      <Section>
        <SectionTitle>Security Settings</SectionTitle>
        <SectionDescription>
          Protect your account with additional security features
        </SectionDescription>

        <InfoCard>
          <InfoText>
            <Shield
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Keep your account secure by enabling two-factor authentication and
            using a strong password.
          </InfoText>
        </InfoCard>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Two-Factor Authentication</ToggleTitle>
            <ToggleDescription>
              Add an extra layer of security to your account with 2FA
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={securityData.twoFactorEnabled}
            onClick={() => handleToggle("twoFactorEnabled")}
            disabled={loading}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Client-Side Encryption</ToggleTitle>
            <ToggleDescription>
              Encrypt files on your device before uploading (end-to-end
              encryption)
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={securityData.clientSideEncryption}
            onClick={() => handleToggle("clientSideEncryption")}
            disabled={loading}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Offline Mode</ToggleTitle>
            <ToggleDescription>
              Download and access your files when you're not connected to the
              internet
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={securityData.offlineModeEnabled}
            onClick={() => handleToggle("offlineModeEnabled")}
            disabled={loading}
          />
        </ToggleWrapper>
      </Section>

      <Section>
        <SectionTitle>Change Password</SectionTitle>
        <SectionDescription>
          Update your password to keep your account secure
        </SectionDescription>

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
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormGroup>

        <Button variant="primary">Update Password</Button>
      </Section>
    </>
  );
};
