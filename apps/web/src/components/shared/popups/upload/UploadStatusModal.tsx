import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import FileUploadIcon from "../../icons/fileUpload";
import { FileIcon as FileUploadedIcon } from "../../icons/file";

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

interface UploadStatusModalProps {
  isOpen: boolean;
  files: UploadFile[];
  onClose: () => void;
  totalProgress: number;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const progressAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #1a1a1a;
  }
`;

const ProgressSection = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
`;

const OverallProgress = styled.div`
  margin-bottom: 12px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number; $isComplete: boolean }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: ${(props) =>
    props.$isComplete
      ? "#10b981"
      : "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)"};
  background-size: 200% 200%;
  animation: ${(props) => (props.$isComplete ? "none" : progressAnimation)} 2s
    ease infinite;
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;

const FileItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${(props) =>
    props.$status === "complete"
      ? "#f0fdf4"
      : props.$status === "error"
      ? "#fef2f2"
      : "#f9fafb"};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s;
  border: 1px solid
    ${(props) =>
      props.$status === "complete"
        ? "#bbf7d0"
        : props.$status === "error"
        ? "#fecaca"
        : "#e5e7eb"};
`;

const FileIcon = styled.div<{ $status: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${(props) =>
    props.$status === "complete"
      ? "#10b981"
      : props.$status === "error"
      ? "#ef4444"
      : "#3b82f6"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: white;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const FileStatus = styled.div<{ $status: string }>`
  font-size: 12px;
  color: ${(props) =>
    props.$status === "complete"
      ? "#10b981"
      : props.$status === "error"
      ? "#ef4444"
      : "#3b82f6"};
  font-weight: 500;
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: #3b82f6;
    color: white;
    &:hover {
      background: #2563eb;
    }
  `
      : `
    background: #f5f5f5;
    color: #1a1a1a;
    &:hover {
      background: #e5e5e5;
    }
  `}
`;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

const UploadStatusModal: React.FC<UploadStatusModalProps> = ({
  isOpen,
  files,
  onClose,
  totalProgress,
}) => {
  // TODO: popravi boje
  console.log("Modal render:", {
    isOpen,
    filesCount: files.length,
    totalProgress,
  });

  if (!isOpen) return null;

  const allComplete = files.every((f) => f.status === "complete");
  const hasErrors = files.some((f) => f.status === "error");
  const isUploading = files.some(
    (f) => f.status === "uploading" || f.status === "pending"
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <FileUploadedIcon />;
      case "error":
        return "✕";
      case "uploading":
        return <FileUploadIcon />;
      default:
        return "•";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "error":
        return "Failed";
      case "uploading":
        return "Uploading...";
      default:
        return "Waiting...";
    }
  };

  return createPortal(
    <Overlay onClick={allComplete || hasErrors ? onClose : undefined}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            {allComplete
              ? "Upload Complete"
              : hasErrors
              ? "Upload Completed with Errors"
              : isUploading
              ? "Uploading Files"
              : "Queueing Files..."}
          </Title>
          {(allComplete || hasErrors) && (
            <CloseButton onClick={onClose}>×</CloseButton>
          )}
        </Header>

        <ProgressSection>
          <OverallProgress>
            <ProgressLabel>
              <span>
                {files.filter((f) => f.status === "complete").length} of{" "}
                {files.length} files
              </span>
              <span>{Math.round(totalProgress)}%</span>
            </ProgressLabel>
            <ProgressBarContainer>
              <ProgressBar
                $progress={totalProgress}
                $isComplete={allComplete}
              />
            </ProgressBarContainer>
          </OverallProgress>
        </ProgressSection>

        <FileList>
          {files.map((file, index) => (
            <FileItem key={index} $status={file.status}>
              <FileIcon $status={file.status}>
                {getStatusIcon(file.status)}
              </FileIcon>
              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileSize>{formatBytes(file.size)}</FileSize>
              </FileInfo>
              <FileStatus $status={file.status}>
                {getStatusText(file.status)}
              </FileStatus>
            </FileItem>
          ))}
        </FileList>

        {(allComplete || hasErrors) && (
          <Footer>
            <Button $variant="primary" onClick={onClose}>
              Done
            </Button>
          </Footer>
        )}
      </Modal>
    </Overlay>,
    document.body
  );
};

export default UploadStatusModal;
