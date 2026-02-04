import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Shield, Copy, Download, AlertCircle, CheckCircle, X } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import api from "../../../lib/axios"; // Add this import

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: "Poppins", sans-serif;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #3b82f6;
  }
`;

const Description = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
`;

const StatusBanner = styled.div<{ enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  background: ${props => props.enabled ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.enabled ? '#bbf7d0' : '#fecaca'};
  margin-bottom: 24px;

  svg {
    color: ${props => props.enabled ? '#22c55e' : '#ef4444'};
    flex-shrink: 0;
  }
`;

const StatusText = styled.div`
  flex: 1;

  strong {
    display: block;
    font-weight: 600;
    color: #000000;
    margin-bottom: 2px;
  }

  span {
    font-size: 13px;
    color: #64748b;
  }
`;

const QRSection = styled.div`
  text-align: center;
  margin: 32px 0;
`;

const QRCodeWrapper = styled.div`
  display: inline-block;
  padding: 24px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  img {
    display: block;
    width: 240px;
    height: 240px;
  }
`;

const QRInstructions = styled.div`
  max-width: 400px;
  margin: 0 auto 24px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
`;

const SecretKeyBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
`;

const SecretKeyLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const SecretKeyValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;

  code {
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    font-size: 15px;
    color: #000000;
    font-weight: 600;
    letter-spacing: 2px;
    word-break: break-all;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const InputGroup = styled.div`
  margin: 24px 0;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-family: "SF Mono", "Monaco", monospace;
  letter-spacing: 4px;
  text-align: center;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    letter-spacing: normal;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' && `
    background: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background: #2563eb;
    }
  `}

  ${props => props.variant === 'danger' && `
    background: #ef4444;
    color: white;

    &:hover:not(:disabled) {
      background: #dc2626;
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #f1f5f9;
    color: #000000;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RecoveryCodesSection = styled.div`
  margin-top: 32px;
`;

const RecoveryCodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin: 16px 0;
`;

const RecoveryCodeItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  font-family: "SF Mono", "Monaco", monospace;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  letter-spacing: 1px;
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  gap: 12px;

  svg {
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const WarningText = styled.div`
  color: #92400e;
  font-size: 13px;
  line-height: 1.6;

  strong {
    display: block;
    margin-bottom: 4px;
    color: #78350f;
  }
`;

const DownloadButton = styled(Button)`
  background: #10b981;
  color: white;

  &:hover:not(:disabled) {
    background: #059669;
  }
`;

interface SetupData {
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}

export default function TwoFactorSettings() {
  const { user } = useAuthStore();
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
    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/totp/verify-and-enable", {
        token: verificationCode,
      });

      setRecoveryCodes(response.data.recoveryCodes);
      setIsEnabled(true);
      setSetupData(null);
      setVerificationCode("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to verify code");
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
    <Container>
      <Header>
        <Title>
          <Shield size={32} />
          Two-Factor Authentication
        </Title>
        <Description>
          Add an extra layer of security to your account by requiring a verification code from your authenticator app.
        </Description>
      </Header>

      <Card>
        <StatusBanner enabled={isEnabled}>
          {isEnabled ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <StatusText>
            <strong>{isEnabled ? "2FA is Enabled" : "2FA is Disabled"}</strong>
            <span>
              {isEnabled 
                ? "Your account is protected with two-factor authentication" 
                : "Your account is not using two-factor authentication"}
            </span>
          </StatusText>
        </StatusBanner>

        {error && (
          <WarningBox>
            <AlertCircle size={20} />
            <WarningText>
              <strong>Error</strong>
              {error}
            </WarningText>
          </WarningBox>
        )}

        {!isEnabled && !setupData && (
          <>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
              Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
            </p>
            <Button variant="primary" onClick={handleSetupTwoFactor} disabled={isLoading}>
              {isLoading ? "Setting up..." : "Enable Two-Factor Authentication"}
            </Button>
          </>
        )}

        {setupData && !isEnabled && (
          <>
            <QRSection>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                Scan QR Code
              </h3>
              <QRCodeWrapper>
                <img src={setupData.qrCode} alt="2FA QR Code" />
              </QRCodeWrapper>
              <QRInstructions>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
              </QRInstructions>
            </QRSection>

            <SecretKeyBox>
              <SecretKeyLabel>Manual Entry Key</SecretKeyLabel>
              <SecretKeyValue>
                <code>{setupData.secret}</code>
                <CopyButton onClick={handleCopySecret}>
                  {copySuccess ? <CheckCircle /> : <Copy />}
                  {copySuccess ? "Copied!" : "Copy"}
                </CopyButton>
              </SecretKeyValue>
            </SecretKeyBox>

            <InputGroup>
              <InputLabel>Enter Verification Code</InputLabel>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleVerifyAndEnable();
                  }
                }}
              />
            </InputGroup>

            <ButtonGroup>
              <Button variant="secondary" onClick={handleCancelSetup} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleVerifyAndEnable} 
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify & Enable"}
              </Button>
            </ButtonGroup>
          </>
        )}

        {isEnabled && (
          <>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
              Two-factor authentication is currently enabled on your account. You'll need to enter a code from your authenticator app each time you sign in.
            </p>
            <Button variant="danger" onClick={handleDisableTwoFactor} disabled={isLoading}>
              {isLoading ? "Disabling..." : "Disable Two-Factor Authentication"}
            </Button>
          </>
        )}
      </Card>

      {recoveryCodes.length > 0 && (
        <Card>
          <RecoveryCodesSection>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
              Recovery Codes
            </h3>
            
            <WarningBox>
              <AlertCircle size={20} />
              <WarningText>
                <strong>Save these recovery codes!</strong>
                Each code can only be used once. Store them in a safe place in case you lose access to your authenticator app.
              </WarningText>
            </WarningBox>

            <RecoveryCodesGrid>
              {recoveryCodes.map((code, index) => (
                <RecoveryCodeItem key={index}>{code}</RecoveryCodeItem>
              ))}
            </RecoveryCodesGrid>

            <DownloadButton onClick={handleDownloadRecoveryCodes}>
              <Download size={18} />
              Download Recovery Codes
            </DownloadButton>
          </RecoveryCodesSection>
        </Card>
      )}
    </Container>
  );
}