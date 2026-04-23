import { useState, useEffect } from "react";
import styled from "styled-components";
import { ShieldIcon as Shield, CopyIcon as Copy, DownloadIcon as Download, AlertCircleIcon as AlertCircle, CheckCircle2Icon as CheckCircle2 } from "../../shared/icons/index";
import { useAuthStore } from "../../../store/authStore";
import api from "../../../lib/axios";
import {
  Section,
  SectionTitle,
  SectionDescription,
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
  InfoCard,
  InfoText,
  SmallText,
} from "../styles/settings.styles";

const StatusBanner = styled.div<{ $enabled: boolean }>`
  border: 1px solid ${(props) => (props.$enabled ? "#b8efc9" : "#ffd1d1")};
  background: ${(props) => (props.$enabled ? "#eafff0" : "#fff4f4")};
  color: ${(props) => (props.$enabled ? "#0f7c3a" : "#c23232")};
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const QRWrapper = styled.div`
  display: inline-flex;
  border: 1px solid #dbe9f7;
  border-radius: 14px;
  padding: 0.75rem;
  background: #ffffff;
  margin: 0.8rem 0 0.5rem;
`;

const SecretRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const SecretCode = styled.code`
  font-family: "SF Mono", "Consolas", "Roboto Mono", monospace;
  letter-spacing: 1.5px;
  font-size: 0.9rem;
  color: #17324c;
  word-break: break-all;
`;

const RecoveryCodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin: 0.75rem 0 1rem;
`;

const RecoveryCode = styled.div`
  border: 1px solid #deebf8;
  border-radius: 10px;
  background: #f7fbff;
  padding: 0.55rem 0.6rem;
  text-align: center;
  font-family: "SF Mono", "Consolas", "Roboto Mono", monospace;
  font-size: 0.82rem;
  color: #18344f;
`;

interface SetupData {
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}

export default function TwoFactorSettings() {
  useAuthStore();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Check if 2FA is already enabled for the user
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await api.get("/auth/me/protected");
      setIsEnabled(response.data.user.totpEnabled || false);
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    }
  };

  const handleSetupTwoFactor = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/totp/setup");
      setSetupData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to setup two-factor authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    const code = String(verificationCode).trim().replace(/\s/g, "");
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/totp/verify-and-enable", {
        token: code,
      });

      setRecoveryCodes(response.data.recoveryCodes ?? []);
      setIsEnabled(true);
      setSetupData(null);
      setVerificationCode("");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ??
        err.response?.data?.message ??
        err.message ??
        "Failed to verify code";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/totp/disable");
      setIsEnabled(false);
      setRecoveryCodes([]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to disable two-factor authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCancelSetup = () => {
    setSetupData(null);
    setVerificationCode("");
    setError("");
  };

  return (
    <Section>
      <SectionTitle>
        <Shield size={18} />
        Two-Factor Authentication
      </SectionTitle>
      <SectionDescription>
        Add a second verification step to significantly improve account
        security.
      </SectionDescription>

      <StatusBanner $enabled={isEnabled}>
        {isEnabled ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <div>
          <strong>{isEnabled ? "2FA is enabled" : "2FA is disabled"}</strong>
          <SmallText style={{ marginTop: 2 }}>
            {isEnabled
              ? "Your account requires a verification code during sign-in."
              : "Enable 2FA to protect account access beyond password only."}
          </SmallText>
        </div>
      </StatusBanner>

      {error && (
        <InfoCard style={{ background: "#fff4f4", borderColor: "#ffd1d1" }}>
          <InfoText style={{ color: "#c23232" }}>{error}</InfoText>
        </InfoCard>
      )}

      {!isEnabled && !setupData && (
        <Button
          $variant="primary"
          onClick={handleSetupTwoFactor}
          disabled={isLoading}
        >
          {isLoading ? "Preparing setup..." : "Enable Two-Factor Authentication"}
        </Button>
      )}

      {setupData && !isEnabled && (
        <>
          <FormGroup style={{ marginTop: 12 }}>
            <Label>Scan QR code with your authenticator app</Label>
            <QRWrapper>
              <img src={setupData.qrCode} alt="2FA QR code" width={220} height={220} />
            </QRWrapper>
          </FormGroup>

          <InfoCard>
            <InfoText>
              If scanning fails, use this manual key:
            </InfoText>
            <SecretRow>
              <SecretCode>{setupData.secret}</SecretCode>
              <Button type="button" $variant="default" onClick={handleCopySecret}>
                {copySuccess ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copySuccess ? "Copied" : "Copy key"}
              </Button>
            </SecretRow>
          </InfoCard>

          <FormGroup>
            <Label>Verification code</Label>
            <Input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleVerifyAndEnable();
              }}
            />
          </FormGroup>

          <ButtonGroup>
            <Button $variant="default" onClick={handleCancelSetup} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              $variant="primary"
              onClick={handleVerifyAndEnable}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </ButtonGroup>
        </>
      )}

      {isEnabled && (
        <Button
          $variant="danger"
          onClick={handleDisableTwoFactor}
          disabled={isLoading}
        >
          {isLoading ? "Disabling..." : "Disable Two-Factor Authentication"}
        </Button>
      )}

      {recoveryCodes.length > 0 && (
        <Section style={{ marginTop: "1.6rem", marginBottom: 0 }}>
          <SectionTitle>Recovery Codes</SectionTitle>
          <SectionDescription>
            Save these codes in a safe place. Each code can be used once.
          </SectionDescription>
          <RecoveryCodesGrid>
            {recoveryCodes.map((code, index) => (
              <RecoveryCode key={index}>{code}</RecoveryCode>
            ))}
          </RecoveryCodesGrid>
          <Button type="button" $variant="default" onClick={handleDownloadRecoveryCodes}>
            <Download size={15} />
            Download recovery codes
          </Button>
        </Section>
      )}
    </Section>
  );
}