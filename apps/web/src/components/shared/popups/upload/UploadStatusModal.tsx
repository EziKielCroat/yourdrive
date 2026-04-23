import React from "react";
import styled, { keyframes } from "styled-components";
import { XIcon as X, CheckCircleIcon as CheckCircle, AlertCircleIcon as AlertCircle, LoaderIcon as Loader, FileUpIcon as FileUp } from "../../icons/index";

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "assembling" | "complete" | "error";
  error?: string;
  uploadedBytes: number;
  speed: number;
}

interface UploadStatusModalProps {
  isOpen: boolean;
  files: UploadFile[];
  onClose: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
};

const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

const UploadStatusModal: React.FC<UploadStatusModalProps> = ({
  isOpen,
  files,
  onClose,
}) => {
  if (!isOpen) return null;

  const completedFiles = files.filter((f) => f.status === "complete").length;
  const errorFiles = files.filter((f) => f.status === "error").length;
  const uploadingFiles = files.filter((f) => f.status === "uploading").length;
  const assemblingFiles = files.filter((f) => f.status === "assembling").length;
  const allComplete = files.length > 0 && completedFiles === files.length;
  const hasErrors = errorFiles > 0;
  const canClose =
    allComplete ||
    (errorFiles > 0 && uploadingFiles === 0 && assemblingFiles === 0);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const uploadedSize = files.reduce((sum, f) => sum + f.uploadedBytes, 0);

  const overallProgress =
    totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;

  const uploadingFilesWithSpeed = files.filter(
    (f) =>
      (f.status === "uploading" || f.status === "assembling") && f.speed > 0,
  );
  const averageSpeed =
    uploadingFilesWithSpeed.length > 0
      ? uploadingFilesWithSpeed.reduce((sum, f) => sum + f.speed, 0) /
        uploadingFilesWithSpeed.length
      : 0;

  return (
    <Overlay
      onClick={(e) => e.target === e.currentTarget && canClose && onClose()}
    >
      <Modal>
        <Header>
          <HeaderLeft>
            <FileUp size={20} color="#1a73e8" />
            <Title>
              {allComplete
                ? "Upload Complete"
                : hasErrors && uploadingFiles === 0
                  ? "Upload Issues"
                  : "Uploading Files"}
            </Title>
          </HeaderLeft>
          {canClose && (
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          )}
        </Header>

        <ProgressSection>
          <ProgressHeader>
            <ProgressText>
              {allComplete ? (
                <>
                  <CheckCircle size={16} color="#34a853" />
                  <span>
                    {completedFiles} of {files.length} files uploaded
                  </span>
                </>
              ) : hasErrors && uploadingFiles === 0 && assemblingFiles === 0 ? (
                <>
                  <AlertCircle size={16} color="#ea4335" />
                  <span>
                    {completedFiles} completed, {errorFiles} failed
                  </span>
                </>
              ) : (
                <>
                  <Loader size={16} className="spinning" />
                  <span>
                    {completedFiles} of {files.length} files
                    {uploadingFiles > 0 && ` • ${uploadingFiles} uploading`}
                    {assemblingFiles > 0 && ` • ${assemblingFiles} processing`}
                  </span>
                </>
              )}
            </ProgressText>
            <SizeText>
              {formatBytes(uploadedSize)} / {formatBytes(totalSize)}
            </SizeText>
          </ProgressHeader>

          <ProgressBarContainer>
            <ProgressBar
              $progress={overallProgress}
              $status={
                allComplete ? "complete" : hasErrors ? "error" : "uploading"
              }
            />
          </ProgressBarContainer>

          <ProgressFooter>
            <ProgressPercentage>{overallProgress}%</ProgressPercentage>
            {averageSpeed > 0 && (
              <SpeedText>{formatSpeed(averageSpeed)}</SpeedText>
            )}
          </ProgressFooter>
        </ProgressSection>

        <FilesList>
          {files.map((file, index) => (
            <FileItem key={`${file.name}-${index}`} $status={file.status}>
              <FileIconWrapper $status={file.status}>
                {file.status === "complete" && (
                  <CheckCircle size={18} color="#34a853" />
                )}
                {file.status === "error" && (
                  <AlertCircle size={18} color="#ea4335" />
                )}
                {(file.status === "uploading" ||
                  file.status === "assembling") && (
                  <Loader size={18} className="spinning" color="#1a73e8" />
                )}
                {file.status === "pending" && (
                  <FileUp size={18} color="#5f6368" />
                )}
              </FileIconWrapper>

              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileDetails>
                  {file.status === "complete" && (
                    <StatusText $status="complete">
                      {formatBytes(file.size)} • Complete
                    </StatusText>
                  )}
                  {file.status === "error" && (
                    <StatusText $status="error">
                      {file.error || "Upload failed"}
                    </StatusText>
                  )}
                  {file.status === "assembling" && (
                    <StatusText $status="assembling">
                      Processing file... This may take a few minutes for large
                      files
                    </StatusText>
                  )}
                  {file.status === "uploading" && (
                    <StatusText $status="uploading">
                      {formatBytes(file.uploadedBytes)} /{" "}
                      {formatBytes(file.size)} • {file.progress}%
                      {file.speed > 0 && ` • ${formatSpeed(file.speed)}`}
                    </StatusText>
                  )}
                  {file.status === "pending" && (
                    <StatusText $status="pending">
                      {formatBytes(file.size)} • Waiting...
                    </StatusText>
                  )}
                </FileDetails>

                {(file.status === "uploading" ||
                  file.status === "assembling") && (
                  <FileProgressBar>
                    <FileProgressFill $progress={file.progress} />
                  </FileProgressBar>
                )}
              </FileInfo>
            </FileItem>
          ))}
        </FilesList>

        {canClose && (
          <Footer>
            <CompleteButton onClick={onClose}>Done</CompleteButton>
          </Footer>
        )}
      </Modal>
    </Overlay>
  );
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
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
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 540px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  animation: ${slideUp} 0.3s ease-out;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: #5f6368;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f1f3f4;
  }
`;

const ProgressSection = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #202124;
  font-weight: 500;

  .spinning {
    animation: ${spin} 1s linear infinite;
  }
`;

const SizeText = styled.div`
  font-size: 13px;
  color: #5f6368;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #e8eaed;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div<{
  $progress: number;
  $status: "uploading" | "complete" | "error";
}>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: ${(props) =>
    props.$status === "complete"
      ? "#34a853"
      : props.$status === "error"
        ? "#ea4335"
        : "#1a73e8"};
  border-radius: 4px;
  transition:
    width 0.3s ease,
    background 0.3s ease;
`;

const ProgressFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressPercentage = styled.div`
  font-size: 12px;
  color: #5f6368;
  font-weight: 500;
`;

const SpeedText = styled.div`
  font-size: 12px;
  color: #1a73e8;
  font-weight: 500;
`;

const FilesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #bdc1c6;
  }
`;

const FileItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: ${(props) =>
    props.$status === "complete"
      ? "#f0f9f4"
      : props.$status === "error"
        ? "#fce8e6"
        : "#f8f9fa"};
  transition: background 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$status === "complete"
        ? "#e6f4ea"
        : props.$status === "error"
          ? "#fad2cf"
          : "#f1f3f4"};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const FileIconWrapper = styled.div<{ $status: string }>`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${(props) =>
    props.$status === "complete"
      ? "#e6f4ea"
      : props.$status === "error"
        ? "#fad2cf"
        : "#fff"};

  .spinning {
    animation: ${spin} 1s linear infinite;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const FileDetails = styled.div`
  margin-bottom: 8px;
`;

const StatusText = styled.div<{ $status: string }>`
  font-size: 12px;
  color: ${(props) =>
    props.$status === "complete"
      ? "#34a853"
      : props.$status === "error"
        ? "#ea4335"
        : props.$status === "uploading"
          ? "#1a73e8"
          : props.$status === "assembling"
            ? "#f9ab00"
            : "#5f6368"};
`;

const FileProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
`;

const FileProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: #1a73e8;
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e8eaed;
  display: flex;
  justify-content: flex-end;
`;

const CompleteButton = styled.button`
  padding: 10px 24px;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #1765cc;
  }
`;

export default UploadStatusModal;
