import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Lock, Download, Eye, AlertCircle } from "lucide-react";
import { useParams } from "@tanstack/react-router";

interface SharedFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  permission: string;
  ownerName: string;
  hasPassword: boolean;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
}

const SharedViewer: React.FC = () => {
  const params = useParams({ strict: false });
  const token = params.token as string;
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchShareInfo();
    }
  }, [token]);

  const fetchShareInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching share info for token:", token);
      const response = await fetch(`/api/sharing/public/${token}`);
      const data = await response.json();

      console.log("Share info response:", data);

      if (!data.success) {
        setError(data.error || "Failed to load shared file");
        setLoading(false);
        return;
      }

      setFile(data.share);
      setPasswordRequired(data.share.hasPassword);

      // If no password required, automatically get access
      if (!data.share.hasPassword) {
        console.log("No password required, getting access...");
        await handleAccess("");
      } else {
        console.log("Password required");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching share info:", err);
      setError("Failed to load shared file");
      setLoading(false);
    }
  };

  const handleAccess = async (pwd: string) => {
    setAuthenticating(true);
    setError(null);

    try {
      console.log("Requesting access for token:", token);
      const response = await fetch(`/api/sharing/access/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pwd || password }),
      });

      const data = await response.json();
      console.log("Access response:", data);

      if (!data.success) {
        setError(data.error || "Failed to access file");
        setAuthenticating(false);
        return;
      }

      // The signed URL is already returned from the access endpoint
      if (data.signedUrl) {
        console.log("✅ Got signed URL successfully");
        setFileUrl(data.signedUrl);
        setPasswordRequired(false);
        setLoading(false);
      } else {
        console.error("❌ No signed URL in response");
        setError("No file URL provided");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error accessing file:", err);
      setError("Failed to access file");
      setAuthenticating(false);
    } finally {
      setAuthenticating(false);
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file?.fileName || "download";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Simple inline preview components to avoid triggering any external file loaders
  const renderPreview = () => {
    if (!fileUrl || !file) {
      return (
        <NoPreview>
          <AlertCircle size={48} color="#dadce0" />
          <NoPreviewText>Unable to load file</NoPreviewText>
        </NoPreview>
      );
    }

    const mimeType = file.mimeType;

    // Image preview
    if (mimeType.startsWith("image/")) {
      return (
        <ImagePreview
          src={fileUrl}
          alt={file.fileName}
          onError={(e) => {
            console.error("Image failed to load:", fileUrl);
            console.error("Error event:", e);
          }}
        />
      );
    }

    // PDF preview
    if (mimeType === "application/pdf") {
      return (
        <PdfPreview>
          <iframe
            src={`${fileUrl}#toolbar=0`}
            width="100%"
            height="100%"
            title="PDF Preview"
          />
        </PdfPreview>
      );
    }

    // Video preview
    if (mimeType.startsWith("video/")) {
      return (
        <VideoPreview controls>
          <source src={fileUrl} type={mimeType} />
          Your browser does not support the video tag.
        </VideoPreview>
      );
    }

    // Audio preview
    if (mimeType.startsWith("audio/")) {
      return (
        <AudioPreview controls>
          <source src={fileUrl} type={mimeType} />
          Your browser does not support the audio tag.
        </AudioPreview>
      );
    }

    // Text preview for plain text and code files
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "application/xml"
    ) {
      return (
        <TextPreviewContainer>
          <TextPreviewFrame src={fileUrl} title="Text Preview" />
        </TextPreviewContainer>
      );
    }

    // No preview available
    return (
      <NoPreview>
        <Eye size={48} color="#dadce0" />
        <NoPreviewText>Preview not available for this file type</NoPreviewText>
        <FileTypeBadge>{mimeType}</FileTypeBadge>
        {file?.permission === "download" && (
          <DownloadButton onClick={handleDownload}>
            <Download size={18} />
            Download to view
          </DownloadButton>
        )}
      </NoPreview>
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading shared file...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <AlertCircle size={64} color="#d93025" />
          <ErrorTitle>Cannot access file</ErrorTitle>
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  if (passwordRequired) {
    return (
      <Container>
        <PasswordContainer>
          <Lock size={48} color="#1a73e8" />
          <PasswordTitle>This file is password protected</PasswordTitle>
          <PasswordSubtitle>
            Enter the password to view "{file?.fileName}"
          </PasswordSubtitle>

          <PasswordForm
            onSubmit={(e) => {
              e.preventDefault();
              handleAccess(password);
            }}
          >
            <PasswordInput
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <SubmitButton type="submit" disabled={!password || authenticating}>
              {authenticating ? "Verifying..." : "Access File"}
            </SubmitButton>
          </PasswordForm>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </PasswordContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ViewerCard>
        <ViewerHeader>
          <FileInfo>
            <FileIcon>
              <Eye size={24} />
            </FileIcon>
            <FileDetails>
              <FileName>{file?.fileName}</FileName>
              <FileMetadata>
                {formatFileSize(file?.fileSize || 0)} · Shared by{" "}
                {file?.ownerName}
              </FileMetadata>
            </FileDetails>
          </FileInfo>

          {file?.permission === "download" && fileUrl && (
            <DownloadButton onClick={handleDownload}>
              <Download size={18} />
              Download
            </DownloadButton>
          )}
        </ViewerHeader>

        <PreviewArea>{renderPreview()}</PreviewArea>

        {file?.expiresAt && (
          <ExpirationNotice>
            This link expires on {new Date(file.expiresAt).toLocaleDateString()}
          </ExpirationNotice>
        )}

        {file?.maxDownloads && (
          <DownloadNotice>
            {file.downloadCount} / {file.maxDownloads} downloads used
          </DownloadNotice>
        )}
      </ViewerCard>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #5f6368;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 400px;
  text-align: center;
`;

const ErrorTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #202124;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #5f6368;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fce8e6;
  border: 1px solid #d93025;
  border-radius: 8px;
  color: #d93025;
  font-size: 14px;
  width: 100%;
`;

const PasswordContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const PasswordTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0;
  text-align: center;
`;

const PasswordSubtitle = styled.div`
  font-size: 14px;
  color: #5f6368;
  text-align: center;
`;

const PasswordForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  color: #202124;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const SubmitButton = styled.button`
  padding: 14px 24px;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #1557b0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ViewerCard = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e8eaed;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #e8f0fe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a73e8;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #202124;
`;

const FileMetadata = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #1557b0;
  }
`;

const PreviewArea = styled.div`
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  position: relative;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 800px;
  object-fit: contain;
`;

const PdfPreview = styled.div`
  width: 100%;
  height: 800px;

  iframe {
    border: none;
  }
`;

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 800px;
`;

const AudioPreview = styled.audio`
  width: 100%;
  max-width: 600px;
`;

const TextPreviewContainer = styled.div`
  width: 100%;
  height: 800px;
  background: white;
  padding: 24px;
  overflow: auto;
`;

const TextPreviewFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 1px solid #e8eaed;
  border-radius: 8px;
`;

const NoPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
`;

const NoPreviewText = styled.div`
  font-size: 16px;
  color: #5f6368;
`;

const FileTypeBadge = styled.div`
  padding: 6px 12px;
  background: #e8eaed;
  border-radius: 6px;
  font-size: 12px;
  color: #5f6368;
  font-family: monospace;
`;

const ExpirationNotice = styled.div`
  padding: 12px 24px;
  background: #fff3cd;
  border-top: 1px solid #ffc107;
  font-size: 13px;
  color: #856404;
  text-align: center;
`;

const DownloadNotice = styled.div`
  padding: 12px 24px;
  background: #e8f0fe;
  border-top: 1px solid #1a73e8;
  font-size: 13px;
  color: #1557b0;
  text-align: center;
`;

export default SharedViewer;
