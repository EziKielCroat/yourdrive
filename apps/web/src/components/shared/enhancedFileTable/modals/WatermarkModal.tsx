import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  X,
  Type,
  Palette,
  Download,
  Image as ImageIcon,
  FileText,
  FileVideo,
  FileAudio,
  Eye,
  EyeOff,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import type { EnhancedFileItem } from "../types/fileActions";

interface WatermarkModalProps {
  isOpen: boolean;
  files: EnhancedFileItem[];
  onClose: () => void;
  onApply: (files: EnhancedFileItem[], options: any) => Promise<void>;
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
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
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
  flex-shrink: 0;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;

const FilesList = styled.div`
  margin-bottom: 24px;
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 8px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: #f8f9fa;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const FileName = styled.span`
  font-size: 13px;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #9aa0a6;
    cursor: not-allowed;
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ColorPicker = styled.input.attrs({ type: "color" })`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 2px solid #e8eaed;
    border-radius: 6px;
  }
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${(props) => props.$color};
  border: 1px solid #e8eaed;
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

const PositionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const PositionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: ${(props) => (props.$active ? "#e8f0fe" : "#f8f9fa")};
  border: 1px solid ${(props) => (props.$active ? "#1a73e8" : "#e8eaed")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: ${(props) => (props.$active ? "#1a73e8" : "#5f6368")};

  &:hover {
    border-color: #1a73e8;
    background: #f1f3f4;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RotationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RotationInput = styled.input`
  width: 80px;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const RotationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f1f3f4;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #5f6368;

  &:hover {
    background: #e8eaed;
    color: #202124;
  }
`;

const PreviewSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
`;

const PreviewTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #5f6368;
`;

const PreviewCanvas = styled.div<{ $color: string; $opacity: number }>`
  width: 100%;
  height: 120px;
  background:
    linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
    linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WatermarkPreview = styled.div<{
  $text: string;
  $color: string;
  $opacity: number;
  $fontSize: number;
  $rotation: number;
  $position: string;
}>`
  position: absolute;
  color: ${(props) => props.$color};
  opacity: ${(props) => props.$opacity / 100};
  font-size: ${(props) => props.$fontSize}px;
  font-weight: bold;
  transform: rotate(${(props) => props.$rotation}deg);
  text-align: center;
  white-space: nowrap;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);

  ${(props) => {
    const positions: Record<string, string> = {
      "top-left": "top: 20px; left: 20px;",
      "top-center":
        "top: 20px; left: 50%; transform: translateX(-50%) rotate(" +
        props.$rotation +
        "deg);",
      "top-right": "top: 20px; right: 20px;",
      "middle-left":
        "top: 50%; left: 20px; transform: translateY(-50%) rotate(" +
        props.$rotation +
        "deg);",
      "middle-center":
        "top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(" +
        props.$rotation +
        "deg);",
      "middle-right":
        "top: 50%; right: 20px; transform: translateY(-50%) rotate(" +
        props.$rotation +
        "deg);",
      "bottom-left": "bottom: 20px; left: 20px;",
      "bottom-center":
        "bottom: 20px; left: 50%; transform: translateX(-50%) rotate(" +
        props.$rotation +
        "deg);",
      "bottom-right": "bottom: 20px; right: 20px;",
    };
    return positions[props.$position] || positions["middle-center"];
  }}
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.15s ease;
  box-sizing: border-box;
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const FontSizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FontSizeInput = styled.input`
  width: 80px;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const FileCount = styled.div`
  font-size: 13px;
  color: #5f6368;
  margin-left: 8px;
  font-weight: normal;
`;

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType === "application/pdf") return FileText;
  return FileText;
};

const positionOptions = [
  {
    id: "top-left",
    icon: <AlignLeft style={{ transform: "rotate(-90deg)" }} />,
    label: "Top Left",
  },
  {
    id: "top-center",
    icon: <AlignCenter style={{ transform: "rotate(-90deg)" }} />,
    label: "Top Center",
  },
  {
    id: "top-right",
    icon: <AlignRight style={{ transform: "rotate(-90deg)" }} />,
    label: "Top Right",
  },
  { id: "middle-left", icon: <AlignLeft />, label: "Middle Left" },
  { id: "middle-center", icon: <AlignCenter />, label: "Center" },
  { id: "middle-right", icon: <AlignRight />, label: "Middle Right" },
  {
    id: "bottom-left",
    icon: <AlignLeft style={{ transform: "rotate(90deg)" }} />,
    label: "Bottom Left",
  },
  {
    id: "bottom-center",
    icon: <AlignCenter style={{ transform: "rotate(90deg)" }} />,
    label: "Bottom Center",
  },
  {
    id: "bottom-right",
    icon: <AlignRight style={{ transform: "rotate(90deg)" }} />,
    label: "Bottom Right",
  },
];

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  files,
  onClose,
  onApply,
}) => {
  const [text, setText] = useState("Confidential");
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(36);
  const [position, setPosition] = useState("middle-center");
  const [rotation, setRotation] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen && files.length > 0) {
      // Reset to defaults when modal opens with new files
      setText("Confidential");
      setColor("#000000");
      setOpacity(30);
      setFontSize(36);
      setPosition("middle-center");
      setRotation(0);
    }
  }, [isOpen, files]);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!text.trim()) {
      alert("Please enter watermark text");
      return;
    }

    setIsApplying(true);
    try {
      await onApply(files, {
        text: text.trim(),
        color,
        opacity,
        fontSize,
        position,
        rotation,
      });
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const handleRotationChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= -180 && num <= 180) {
      setRotation(num);
    }
  };

  const rotateLeft = () => {
    setRotation((prev) => (prev - 15 + 360) % 360);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 15) % 360);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const supportedFiles = files.filter(
    (file) =>
      file.mimeType.startsWith("image/") ||
      file.mimeType === "application/pdf" ||
      file.mimeType.startsWith("video/"),
  );

  const isSupported = supportedFiles.length > 0;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Type size={24} color="#1a73e8" />
          <ModalTitle>
            Add Watermark
            <FileCount>
              ({files.length} file{files.length !== 1 ? "s" : ""})
            </FileCount>
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <FilesList>
          {files.slice(0, 3).map((file, index) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <FileItem key={file.id}>
                <FileIcon>
                  <Icon size={16} color="#5f6368" />
                </FileIcon>
                <FileName>
                  {file.name}
                  {index === 2 &&
                    files.length > 3 &&
                    ` and ${files.length - 3} more...`}
                </FileName>
              </FileItem>
            );
          })}
        </FilesList>

        {!isSupported && (
          <div
            style={{
              padding: "16px",
              marginBottom: "24px",
              background: "#fce8e6",
              border: "1px solid #f28b82",
              borderRadius: "8px",
              color: "#c5221f",
              fontSize: "13px",
            }}
          >
            <strong>⚠️ Warning:</strong> Watermarking is only supported for
            images, PDFs, and videos. Some selected files may not be processed.
          </div>
        )}

        <PreviewSection>
          <PreviewTitle>Preview</PreviewTitle>
          <PreviewCanvas $color={color} $opacity={opacity}>
            <WatermarkPreview
              $text={text}
              $color={color}
              $opacity={opacity}
              $fontSize={fontSize}
              $rotation={rotation}
              $position={position}
            >
              {text}
            </WatermarkPreview>
          </PreviewCanvas>
        </PreviewSection>

        <OptionsSection>
          <OptionGroup>
            <OptionLabel htmlFor="watermarkText">Watermark Text</OptionLabel>
            <TextArea
              id="watermarkText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter watermark text..."
              maxLength={100}
              rows={2}
            />
            <OptionDescription>
              Text that will appear as the watermark
            </OptionDescription>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Color & Opacity</OptionLabel>
            <ColorPickerContainer>
              <ColorPicker
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="Select color"
              />
              <ColorPreview $color={hexToRgba(color, opacity)} />
              <div style={{ flex: 1 }}>
                <SliderContainer>
                  <Slider
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                  />
                  <SliderValue>{opacity}%</SliderValue>
                </SliderContainer>
                <OptionDescription>
                  Adjust watermark visibility
                </OptionDescription>
              </div>
            </ColorPickerContainer>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Font Size</OptionLabel>
            <FontSizeContainer>
              <Slider
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <FontSizeInput
                type="number"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) =>
                  setFontSize(
                    Math.min(120, Math.max(12, parseInt(e.target.value) || 36)),
                  )
                }
              />
            </FontSizeContainer>
            <OptionDescription>
              Adjust the size of the watermark text
            </OptionDescription>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Position</OptionLabel>
            <PositionGrid>
              {positionOptions.map((pos) => (
                <PositionButton
                  key={pos.id}
                  $active={position === pos.id}
                  onClick={() => setPosition(pos.id)}
                  title={pos.label}
                >
                  {pos.icon}
                </PositionButton>
              ))}
            </PositionGrid>
            <OptionDescription>
              Choose where the watermark appears
            </OptionDescription>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Rotation: {rotation}°</OptionLabel>
            <RotationContainer>
              <RotationButton onClick={rotateLeft} title="Rotate left">
                <RotateCw size={16} style={{ transform: "scaleX(-1)" }} />
              </RotationButton>
              <RotationInput
                type="number"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => handleRotationChange(e.target.value)}
              />
              <RotationButton onClick={rotateRight} title="Rotate right">
                <RotateCw size={16} />
              </RotationButton>
            </RotationContainer>
            <OptionDescription>
              Rotate the watermark for a diagonal effect
            </OptionDescription>
          </OptionGroup>
        </OptionsSection>

        <ModalFooter>
          <Button onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            $primary
            onClick={handleApply}
            disabled={isApplying || !isSupported}
          >
            {isApplying ? (
              <>
                <LoadingSpinner />
                Applying...
              </>
            ) : (
              <>
                <Download size={16} />
                Apply Watermark & Download
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
