import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { X, Sliders, Download, Image } from "lucide-react";
import type { EnhancedFileItem } from "../types/fileActions";

interface OptimizeModalProps {
  isOpen: boolean;
  file: EnhancedFileItem;
  onClose: () => void;
  onOptimize: (file: EnhancedFileItem, options: any) => Promise<void>;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 440px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  flex: 1;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const FileIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8eaed;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.h3`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

const FileSize = styled.p`
  margin: 0;
  font-size: 12px;
  color: #5f6368;
`;

const OptionsSection = styled.div`
  margin-bottom: 32px;
`;

const OptionGroup = styled.div`
  margin-bottom: 20px;
`;

const OptionLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Slider = styled.input.attrs({ type: "range" })`
  flex: 1;
  height: 4px;
  background: #e8eaed;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const SliderValue = styled.span`
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #1a73e8;
`;

const OptionDescription = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #5f6368;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #202124;
  cursor: pointer;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) =>
    props.$primary
      ? `
    background: #1a73e8;
    color: white;
    &:hover:not(:disabled) {
      background: #0d62d9;
    }
    &:disabled {
      background: #8ab4f8;
      cursor: not-allowed;
    }
  `
      : props.$danger
        ? `
    background: #d93025;
    color: white;
    &:hover:not(:disabled) {
      background: #c5221f;
    }
  `
        : `
    background: #f1f3f4;
    color: #202124;
    &:hover:not(:disabled) {
      background: #e8eaed;
    }
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const OptimizeModal: React.FC<OptimizeModalProps> = ({
  isOpen,
  file,
  onClose,
  onOptimize,
}) => {
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [format, setFormat] = useState<"jpeg" | "webp">("jpeg");
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!isOpen) return null;

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await onOptimize(file, { quality, maxWidth, format });
      onClose();
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Sliders size={24} color="#1a73e8" />
          <ModalTitle>Optimize Image</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <FilePreview>
          <FileIconWrapper>
            <Image size={20} color="#5f6368" />
          </FileIconWrapper>
          <FileInfo>
            <FileName>{file.name}</FileName>
            <FileSize>
              {formatFileSize(file.size)} • {file.mimeType}
            </FileSize>
          </FileInfo>
        </FilePreview>

        <OptionsSection>
          <OptionGroup>
            <OptionLabel>Quality: {quality}%</OptionLabel>
            <SliderContainer>
              <Slider
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
              />
              <SliderValue>{quality}%</SliderValue>
            </SliderContainer>
            <OptionDescription>
              Higher quality = larger file size
            </OptionDescription>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Maximum Width: {maxWidth}px</OptionLabel>
            <SliderContainer>
              <Slider
                min="320"
                max="3840"
                step="160"
                value={maxWidth}
                onChange={(e) => setMaxWidth(parseInt(e.target.value))}
              />
              <SliderValue>{maxWidth}px</SliderValue>
            </SliderContainer>
            <OptionDescription>
              Images will be resized to fit within this width
            </OptionDescription>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Output Format</OptionLabel>
            <RadioGroup>
              <RadioOption>
                <input
                  type="radio"
                  name="format"
                  value="jpeg"
                  checked={format === "jpeg"}
                  onChange={() => setFormat("jpeg")}
                />
                JPEG (Best for photos)
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="format"
                  value="webp"
                  checked={format === "webp"}
                  onChange={() => setFormat("webp")}
                />
                WebP (Better compression)
              </RadioOption>
            </RadioGroup>
          </OptionGroup>
        </OptionsSection>

        <ModalFooter>
          <Button onClick={onClose} disabled={isOptimizing}>
            Cancel
          </Button>
          <Button $primary onClick={handleOptimize} disabled={isOptimizing}>
            {isOptimizing ? (
              <>
                <LoadingSpinner />
                Optimizing...
              </>
            ) : (
              <>
                <Download size={16} />
                Optimize & Download
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
