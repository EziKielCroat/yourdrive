import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { XIcon as X, ArrowRightIcon as ArrowRight, ZapIcon as Zap } from "../../icons/index";
import { useFileConversion } from "../../hooks/useFileConversion";

interface ConversionModalProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  onClose: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({
  fileId,
  fileName,
  mimeType,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState("");
  const { formats, loadFormats, convertFile, converting } = useFileConversion();

  useEffect(() => {
    loadFormats(mimeType);
  }, [mimeType]);

  const handleConvert = async () => {
    if (!selectedFormat) return;

    await convertFile(fileId, fileName, selectedFormat);
    onClose();
  };

  const currentExtension = fileName.split(".").pop()?.toLowerCase() || "";

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Zap size={20} />
            Convert File
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <FileInfo>
            <FileName>{fileName}</FileName>
            <FileType>
              Current format: {currentExtension.toUpperCase()}
            </FileType>
          </FileInfo>

          <ConversionFlow>
            <FormatBadge>{currentExtension.toUpperCase()}</FormatBadge>
            <Arrow>
              <ArrowRight size={20} />
            </Arrow>
            <FormatSelect
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="">Select format...</option>
              {formats
                .filter((f) => f !== currentExtension)
                .map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
            </FormatSelect>
          </ConversionFlow>

          {formats.length === 0 && (
            <EmptyState>
              No conversion formats available for this file type
            </EmptyState>
          )}
        </Content>

        <Footer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <ConvertButton
            onClick={handleConvert}
            disabled={!selectedFormat || converting}
          >
            {converting ? "Converting..." : "Convert"}
          </ConvertButton>
        </Footer>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #202124;
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    color: #1a73e8;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const FileInfo = styled.div`
  margin-bottom: 24px;
`;

const FileName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 4px;
  word-break: break-word;
`;

const FileType = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

const ConversionFlow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FormatBadge = styled.div`
  padding: 8px 16px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  min-width: 60px;
  text-align: center;
`;

const Arrow = styled.div`
  color: #5f6368;
  flex-shrink: 0;
`;

const FormatSelect = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  cursor: pointer;
  color: #202124;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: #5f6368;
  font-size: 14px;
  margin-top: 16px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8eaed;
`;

const Button = styled.button`
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: none;
  color: #5f6368;
  &:hover {
    background: #f1f3f4;
  }
`;

const ConvertButton = styled(Button)`
  background: #1a73e8;
  border: none;
  color: white;
  &:hover:not(:disabled) {
    background: #1557b0;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
