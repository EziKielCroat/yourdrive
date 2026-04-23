import styled from "styled-components";
import { FileQuestionIcon as FileQuestion, DownloadIcon as Download } from "../../../icons/index";

interface UnsupportedStateProps {
  fileName: string;
  fileType: string;
  onDownload?: () => void;
}

export default function UnsupportedState({
  fileName,
  fileType,
  onDownload,
}: UnsupportedStateProps) {
  return (
    <Container>
      <IconWrapper>
        <FileQuestion />
      </IconWrapper>
      <Title>Preview not available</Title>
      <Subtitle>
        {fileType
          ? `${fileType.toUpperCase()} files cannot be previewed in the browser`
          : "This file type cannot be previewed in the browser"}
      </Subtitle>
      <FileName>{fileName}</FileName>
      {onDownload && (
        <Button onClick={onDownload}>
          <Download size={16} />
          Download to view
        </Button>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #e9eef6;
  gap: 1rem;
  padding: 2rem;
`;

const IconWrapper = styled.div`
  width: 4rem;
  height: 4rem;
  color: #5f6368;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  color: #202124;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #5f6368;
  margin: 0.5rem 0;
  text-align: center;
  max-width: 400px;
`;

const FileName = styled.p`
  font-size: 0.875rem;
  color: #202124;
  margin: 0;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 0.5rem;
  font-family: monospace;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background: #1a73e8;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background: #1557b0;
    box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
`;
