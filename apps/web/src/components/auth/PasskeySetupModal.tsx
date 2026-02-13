import { useState } from "react";
import styled from "styled-components";
import { X, Fingerprint, Check, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

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
  background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
  border-radius: 24px;
  padding: 3px;
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: #0a1929;
  border-radius: 22px;
  padding: 40px;
  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transform: rotate(90deg);
  }
`;

const Description = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
`;

const FingerprintAnimation = styled.div`
  width: 160px;
  height: 160px;
  margin: 0 auto 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
    opacity: 0.1;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.2;
    }
  }
`;

const FingerprintIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.2s ease;
  margin-bottom: 24px;

  &:focus {
    outline: none;
    border-color: #00c9ff;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  width: 100%;
  background: ${(props) =>
    props.variant === "secondary"
      ? "rgba(255, 255, 255, 0.05)"
      : "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)"};
  border: ${(props) =>
    props.variant === "secondary"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "none"};
  border-radius: 12px;
  padding: 16px;
  color: ${(props) => (props.variant === "secondary" ? "#ffffff" : "#0a1929")};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 201, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoBox = styled.div`
  background: rgba(0, 201, 255, 0.1);
  border: 1px solid rgba(0, 201, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: #00c9ff;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(146, 254, 157, 0.1);
  border: 1px solid rgba(146, 254, 157, 0.3);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #92fe9d;
  margin-bottom: 24px;

  svg {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    padding: 16px;
    border-radius: 50%;
    background: rgba(146, 254, 157, 0.1);
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);

  &:before {
    content: "✓";
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 201, 255, 0.1);
    color: #00c9ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }
`;

interface PasskeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function PasskeySetupModal({
  isOpen,
  onClose,
  onComplete,
}: PasskeySetupModalProps) {
  const { registerPasskey } = useAuthStore();

  const [step, setStep] = useState<"info" | "register" | "success">("info");
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!deviceName.trim()) {
      setError("Please enter a device name");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await registerPasskey(deviceName);
      setStep("success");
    } catch (error: any) {
      setError(
        error.message ||
          "Failed to register passkey. Make sure your device supports passkeys.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    // Reset state
    setStep("info");
    setDeviceName("");
    setError("");
  };

  const handleStartSetup = () => {
    // Auto-fill device name with browser/OS info
    const userAgent = navigator.userAgent;
    let detectedDevice = "My Device";

    if (/iPhone/i.test(userAgent)) {
      detectedDevice = "iPhone";
    } else if (/iPad/i.test(userAgent)) {
      detectedDevice = "iPad";
    } else if (/Android/i.test(userAgent)) {
      detectedDevice = "Android Device";
    } else if (/Macintosh/i.test(userAgent)) {
      detectedDevice = "Mac";
    } else if (/Windows/i.test(userAgent)) {
      detectedDevice = "Windows PC";
    }

    setDeviceName(detectedDevice);
    setStep("register");
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalContent>
          <Header>
            <Title>
              <Fingerprint size={28} />
              Set Up Passkey
            </Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          {step === "info" && (
            <>
              <Description>
                Passkeys are a faster, more secure way to sign in. Use your
                fingerprint, face, or device PIN instead of a password.
              </Description>

              <FingerprintAnimation>
                <FingerprintIcon>
                  <Fingerprint size={40} color="#0a1929" />
                </FingerprintIcon>
              </FingerprintAnimation>

              <FeatureList>
                <FeatureItem>Sign in instantly with biometrics</FeatureItem>
                <FeatureItem>No passwords to remember</FeatureItem>
                <FeatureItem>Protected against phishing</FeatureItem>
                <FeatureItem>Works across all your devices</FeatureItem>
              </FeatureList>

              <InfoBox>
                <AlertCircle size={20} />
                <div>
                  Your passkey is stored securely on your device and never
                  leaves it. We never see your biometric data.
                </div>
              </InfoBox>

              <Button onClick={handleStartSetup}>Continue</Button>
              <Button
                variant="secondary"
                onClick={onClose}
                style={{ marginTop: "12px" }}
              >
                Maybe Later
              </Button>
            </>
          )}

          {step === "register" && (
            <>
              <Description>
                Give this passkey a name so you can identify it later (e.g., "My
                iPhone" or "Work Laptop").
              </Description>

              {error && (
                <ErrorMessage>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </ErrorMessage>
              )}

              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                type="text"
                placeholder="e.g., My iPhone"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                autoFocus
              />

              <InfoBox>
                <Fingerprint size={20} />
                <div>
                  After clicking "Create Passkey", your device will prompt you
                  to verify your identity using your fingerprint, face, or PIN.
                </div>
              </InfoBox>

              <Button onClick={handleRegister} disabled={isLoading}>
                {isLoading ? "Creating Passkey..." : "Create Passkey"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep("info")}
                style={{ marginTop: "12px" }}
              >
                Back
              </Button>
            </>
          )}

          {step === "success" && (
            <>
              <SuccessMessage>
                <Check />
                <h3>Passkey Created!</h3>
                <p>You can now sign in to NexaCore using your {deviceName}.</p>
              </SuccessMessage>

              <InfoBox>
                <AlertCircle size={20} />
                <div>
                  You can add multiple passkeys for different devices in your
                  security settings.
                </div>
              </InfoBox>

              <Button onClick={handleComplete}>Done</Button>
            </>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
}
