import { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Upload,
  FileUp,
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { eventBus } from "../../../../events/eventBus";
import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import computeSHA256 from "../../utils/computeSHA256";

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
  uploadedBytes: number;
  speed: number;
  startTime?: number;
  uploadId?: string;
  s3Key?: string;
  folderPath?: string;
}

interface UppyUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  folderPath?: string;
  preSelectedFiles?: FileList | null;
}

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_CONCURRENT_CHUNKS = 6;
const MAX_RETRIES = 3;
const DIRECT_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
};

const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
};

const UppyUploadPopup = ({
  isOpen,
  onClose,
  folderPath = "",
  preSelectedFiles,
}: UppyUploadPopupProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const accessToken = useAuthStore((s) => s.accessToken);

  const generateFileId = () => `file-${Date.now()}-${Math.random()}`;

  useEffect(() => {
    if (preSelectedFiles && preSelectedFiles.length > 0) {
      handleFileSelect(preSelectedFiles);
    }
  }, [preSelectedFiles]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadFile[] = [];
    let hasOversizedFile = false;

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        hasOversizedFile = true;
        return;
      }

      let extractedFolderPath = folderPath;
      const relativePath = file.webkitRelativePath || "";

      if (relativePath) {
        const lastSlashIndex = relativePath.lastIndexOf("/");
        if (lastSlashIndex > -1) {
          extractedFolderPath = relativePath.substring(0, lastSlashIndex);
        }
      }

      newFiles.push({
        id: generateFileId(),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "pending",
        uploadedBytes: 0,
        speed: 0,
        folderPath: extractedFolderPath,
      });
    });

    if (hasOversizedFile) {
      alert(`Some files exceed the 500MB limit and were not added.`);
    }

    if (newFiles.length > 0) {
      setUploadFiles(newFiles);
      processUploadQueue(newFiles);
    }
  };

  const uploadDirectly = async (uploadFile: UploadFile): Promise<void> => {
    const { file, id: fileId, folderPath: fileFolderPath } = uploadFile;
    const startTime = Date.now();
    const token = accessToken;

    if (!token) throw new Error("Not authenticated");

    const uploadFolderPath = fileFolderPath || folderPath;

    try {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "uploading", startTime } : f,
        ),
      );

      const formData = new FormData();
      formData.append("files", file);
      if (uploadFolderPath) {
        formData.append("folderPaths", JSON.stringify({ 0: uploadFolderPath }));
      }

      const xhr = new XMLHttpRequest();
      const abortController = new AbortController();
      abortControllersRef.current.set(fileId, abortController);

      abortController.signal.addEventListener("abort", () => xhr.abort());

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = e.loaded / elapsed;
          const progress = Math.round((e.loaded / e.total) * 100);

          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress, uploadedBytes: e.loaded, speed }
                : f,
            ),
          );
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload cancelled")),
        );

        xhr.open("POST", "/api/files/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "complete",
                progress: 100,
                uploadedBytes: file.size,
              }
            : f,
        ),
      );

      abortControllersRef.current.delete(fileId);
    } catch (error: any) {
      abortControllersRef.current.delete(fileId);
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: error.message || "Upload failed" }
            : f,
        ),
      );
    }
  };

  const uploadMultipart = async (uploadFile: UploadFile): Promise<void> => {
    const { file, id: fileId, folderPath: fileFolderPath } = uploadFile;
    const startTime = Date.now();
    const token = accessToken;
    const fileHash = await computeSHA256(file);

    if (!token) throw new Error("Not authenticated");

    const uploadFolderPath = fileFolderPath || folderPath;

    try {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "uploading", startTime } : f,
        ),
      );

      const initResponse = await fetch("/api/files/init-multipart-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          folderPath: uploadFolderPath,
          fileHash,
        }),
      });

      if (!initResponse.ok) throw new Error("Failed to initialize upload");

      const initData = await initResponse.json();

      if (initData.duplicate) {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "complete",
                  progress: 100,
                  uploadedBytes: file.size,
                }
              : f,
          ),
        );
        return;
      }

      if (!initData.uploadId || !initData.s3Key) {
        throw new Error("Invalid response from server");
      }

      const { uploadId, s3Key } = initData;

      setUploadFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, uploadId, s3Key } : f)),
      );

      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];
      let uploadedBytes = 0;

      const uploadPart = async (
        partNumber: number,
        retryCount = 0,
      ): Promise<void> => {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("uploadId", uploadId);
        formData.append("s3Key", s3Key);
        formData.append("partNumber", partNumber.toString());

        const abortController = new AbortController();
        abortControllersRef.current.set(
          `${fileId}-${partNumber}`,
          abortController,
        );

        try {
          const uploadResponse = await fetch("/api/files/upload-chunk", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
            signal: abortController.signal,
          });

          if (!uploadResponse.ok)
            throw new Error(`Part ${partNumber} upload failed`);

          const { ETag } = await uploadResponse.json();

          uploadedParts.push({
            PartNumber: partNumber,
            ETag: ETag.replace(/"/g, ""),
          });
          uploadedBytes += chunk.size;

          const elapsed = (Date.now() - startTime) / 1000;
          const speed = uploadedBytes / elapsed;
          const progress = Math.round((uploadedBytes / file.size) * 100);

          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress, uploadedBytes, speed } : f,
            ),
          );

          abortControllersRef.current.delete(`${fileId}-${partNumber}`);
        } catch (error: any) {
          abortControllersRef.current.delete(`${fileId}-${partNumber}`);

          if (error.name === "AbortError") throw error;

          if (retryCount < MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
            );
            return uploadPart(partNumber, retryCount + 1);
          }
          throw error;
        }
      };

      for (let i = 0; i < totalParts; i += MAX_CONCURRENT_CHUNKS) {
        const batch = [];
        for (let j = 0; j < MAX_CONCURRENT_CHUNKS && i + j < totalParts; j++) {
          batch.push(uploadPart(i + j + 1));
        }
        await Promise.all(batch);
      }

      const completeResponse = await fetch(
        "/api/files/complete-multipart-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uploadId,
            s3Key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream",
            folderPath: uploadFolderPath,
            fileHash,
            parts: uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber),
          }),
        },
      );

      if (!completeResponse.ok) throw new Error("Failed to complete upload");

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "complete",
                progress: 100,
                uploadedBytes: file.size,
              }
            : f,
        ),
      );
    } catch (error: any) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: error.message || "Upload failed" }
            : f,
        ),
      );
    }
  };

  const processUploadQueue = async (filesToProcess?: UploadFile[]) => {
    setIsUploading(true);

    const files =
      filesToProcess || uploadFiles.filter((f) => f.status === "pending");

    for (const file of files) {
      if (file.file.size < DIRECT_UPLOAD_THRESHOLD) {
        await uploadDirectly(file).catch(console.error);
      } else {
        await uploadMultipart(file).catch(console.error);
      }
    }

    setIsUploading(false);
    eventBus.emit(FILES_REFRESH_EVENT);

    const hasErrors = uploadFiles.some((f) => f.status === "error");
    if (!hasErrors) {
      setTimeout(() => {
        onClose();
        setUploadFiles([]);
      }, 1500);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      if (!confirm("Upload in progress. Cancel all uploads?")) return;
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
    }
    onClose();
    setUploadFiles([]);
  };

  const cancelUpload = async (fileId: string) => {
    const file = uploadFiles.find((f) => f.id === fileId);
    if (!file) return;

    abortControllersRef.current.forEach((controller, key) => {
      if (key.startsWith(fileId)) {
        controller.abort();
        abortControllersRef.current.delete(key);
      }
    });

    if (file.uploadId && file.s3Key) {
      const token = accessToken;
      if (token) {
        try {
          await fetch("/api/files/abort-multipart-upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              uploadId: file.uploadId,
              s3Key: file.s3Key,
            }),
          });
        } catch (err) {
          console.error("Failed to abort upload:", err);
        }
      }
    }

    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "error", error: "Cancelled" } : f,
      ),
    );
  };

  const completedFiles = uploadFiles.filter(
    (f) => f.status === "complete",
  ).length;
  const failedFiles = uploadFiles.filter((f) => f.status === "error").length; // ?
  const allComplete =
    uploadFiles.length > 0 && completedFiles === uploadFiles.length;

  const totalSize = uploadFiles.reduce((sum, f) => sum + f.size, 0);
  const uploadedSize = uploadFiles.reduce((sum, f) => sum + f.uploadedBytes, 0);
  const overallProgress =
    totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;

  const activeFiles = uploadFiles.filter(
    (f) => f.status === "uploading" && f.speed > 0,
  );
  const averageSpeed =
    activeFiles.length > 0
      ? activeFiles.reduce((sum, f) => sum + f.speed, 0) / activeFiles.length
      : 0;
  const estimatedTimeLeft =
    averageSpeed > 0 ? (totalSize - uploadedSize) / averageSpeed : 0;

  if (!isOpen) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <Modal>
        <Header>
          <HeaderLeft>
            <Upload size={20} />
            <Title>
              {allComplete
                ? "Upload Complete"
                : isUploading
                  ? "Uploading Files"
                  : "Upload Files"}
            </Title>
          </HeaderLeft>
          <CloseButton onClick={handleClose} disabled={isUploading}>
            <X size={20} />
          </CloseButton>
        </Header>

        {uploadFiles.length > 0 && (
          <ProgressSection>
            <ProgressInfo>
              <ProgressText>
                {allComplete ? (
                  <>
                    <CheckCircle size={16} /> {completedFiles} files uploaded
                  </>
                ) : isUploading ? (
                  <>
                    <Loader size={16} className="spin" /> {completedFiles} of{" "}
                    {uploadFiles.length}
                  </>
                ) : (
                  <>{uploadFiles.length} files ready</>
                )}
              </ProgressText>
              <ProgressSize>
                {formatBytes(uploadedSize)} / {formatBytes(totalSize)}
              </ProgressSize>
            </ProgressInfo>
            <ProgressBar>
              <ProgressFill
                $progress={overallProgress}
                $complete={allComplete}
              />
            </ProgressBar>
            <ProgressStats>
              <span>{overallProgress}%</span>
              {averageSpeed > 0 && estimatedTimeLeft < 3600 && (
                <span>
                  {formatSpeed(averageSpeed)} • {formatTime(estimatedTimeLeft)}{" "}
                  left
                </span>
              )}
            </ProgressStats>
          </ProgressSection>
        )}

        <FileList>
          {uploadFiles.map((file) => (
            <FileItem key={file.id} $status={file.status}>
              <FileIcon $status={file.status}>
                {file.status === "complete" && <CheckCircle size={18} />}
                {file.status === "error" && <AlertCircle size={18} />}
                {file.status === "uploading" && (
                  <Loader size={18} className="spin" />
                )}
                {file.status === "pending" && <FileUp size={18} />}
              </FileIcon>
              <FileInfo>
                <FileName>
                  {file.name}
                  {file.folderPath && (
                    <FolderPathText> in {file.folderPath}</FolderPathText>
                  )}
                </FileName>
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
                  {file.status === "uploading" && (
                    <StatusText $status="uploading">
                      {formatBytes(file.uploadedBytes)} /{" "}
                      {formatBytes(file.size)} • {file.progress}%
                      {file.speed > 0 && ` • ${formatSpeed(file.speed)}`}
                    </StatusText>
                  )}
                  {file.status === "pending" && (
                    <StatusText $status="pending">
                      {formatBytes(file.size)}
                    </StatusText>
                  )}
                </FileDetails>
                {file.status === "uploading" && (
                  <FileProgress>
                    <FileProgressFill $progress={file.progress} />
                  </FileProgress>
                )}
              </FileInfo>
              {file.status === "uploading" && (
                <CancelButton onClick={() => cancelUpload(file.id)}>
                  Cancel
                </CancelButton>
              )}
            </FileItem>
          ))}
        </FileList>

        <Footer>
          {allComplete && (
            <Button $variant="primary" onClick={handleClose}>
              Done
            </Button>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
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
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #3b82f6;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button<{ disabled?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #6b7280;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #f3f4f6;
    color: #111827;
  }
`;

const ProgressSection = styled.div`
  padding: 20px 24px;
  background: #f9fafb;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;

  svg {
    color: #3b82f6;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const ProgressSize = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number; $complete: boolean }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: ${(props) =>
    props.$complete
      ? "linear-gradient(90deg, #10b981, #059669)"
      : "linear-gradient(90deg, #3b82f6, #2563eb)"};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  min-height: 200px;
  max-height: 450px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;

    &:hover {
      background: #9ca3af;
    }
  }
`;

const FileItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 10px;
  background: ${(props) =>
    props.$status === "complete"
      ? "#f0fdf4"
      : props.$status === "error"
        ? "#fef2f2"
        : "#fff"};
  border: 1px solid
    ${(props) =>
      props.$status === "complete"
        ? "#d1fae5"
        : props.$status === "error"
          ? "#fecaca"
          : "#e5e7eb"};
  transition: all 0.15s;
`;

const FileIcon = styled.div<{ $status: string }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  background: ${(props) =>
    props.$status === "complete"
      ? "#d1fae5"
      : props.$status === "error"
        ? "#fee2e2"
        : "#f3f4f6"};

  svg {
    color: ${(props) =>
      props.$status === "complete"
        ? "#10b981"
        : props.$status === "error"
          ? "#ef4444"
          : "#3b82f6"};
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

const FileDetails = styled.div`
  margin-bottom: 8px;
`;

const StatusText = styled.div<{ $status: string }>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) =>
    props.$status === "complete"
      ? "#059669"
      : props.$status === "error"
        ? "#dc2626"
        : props.$status === "uploading"
          ? "#2563eb"
          : "#6b7280"};
`;

const FileProgress = styled.div`
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
`;

const FileProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #dc2626;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;

  &:hover {
    background: #fee2e2;
  }
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const Button = styled.button<{ $variant: "primary" | "secondary" }>`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: ${(props) =>
    props.$variant === "secondary" ? "1px solid #d1d5db" : "none"};
  background: ${(props) =>
    props.$variant === "primary" ? "#3b82f6" : "transparent"};
  color: ${(props) => (props.$variant === "primary" ? "#fff" : "#6b7280")};

  &:hover {
    background: ${(props) =>
      props.$variant === "primary" ? "#2563eb" : "#f9fafb"};
    color: ${(props) => (props.$variant === "secondary" ? "#111827" : "#fff")};
    border-color: ${(props) =>
      props.$variant === "secondary" ? "#9ca3af" : "transparent"};
  }
`;

const FolderPathText = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-left: 6px;
`;

export default UppyUploadPopup;
