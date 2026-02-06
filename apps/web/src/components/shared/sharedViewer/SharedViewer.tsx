import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Lock,
  AlertCircle,
  Download,
  MessageSquare,
  Edit3,
  Eye,
  User,
} from "lucide-react";
import { useParams } from "@tanstack/react-router";
import api, { getApiBaseURL } from "../../../lib/axios";

interface SharedFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  permission: "view" | "comment" | "edit" | "download";
  ownerName: string;
  hasPassword: boolean;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
  is_locked: boolean;
}

interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface User {
  id: string;
  firstName: string;
  email: string;
}

const SharedViewer: React.FC = () => {
  const params = useParams({ strict: false });
  const tokenFromParams = (params as { token?: string })?.token;
  const tokenFromPath = typeof window !== "undefined" ? window.location.pathname.match(/\/shared\/([^/]+)/)?.[1] : null;
  const token = tokenFromParams ?? tokenFromPath ?? null;
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState(false);

  // Authenticated user
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Permission-based states
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const canDownload = () => {
    return file?.permission === "download" || file?.permission === "edit";
  };

  const canComment = () => {
    return file?.permission === "comment" || file?.permission === "edit";
  };

  const canEdit = () => {
    return file?.permission === "edit";
  };

  // Fetch current authenticated user
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me", {
        withCredentials: true,
      });

      if (response.data) {
        const data = response.data;
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchShareInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/sharing/public/${token}`);

      const data = response.data;

      if (!data.success) {
        setError(data.error || "Failed to load shared file");
        setLoading(false);
        return;
      }

      setFile(data.share);
      setPasswordRequired(data.share.hasPassword);

      if (!data.share.hasPassword) {
        await handleAccess("");
      } else {
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error("Error fetching share info:", err);
      const apiError = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setError(
        apiError ||
        (err instanceof Error ? err.message : "Failed to load shared file. Check the link and try again."),
      );
      setLoading(false);
    }
  };

  const handleAccess = async (pwd: string) => {
    setAuthenticating(true);
    setError(null);

    try {
      const response = await api.post(`/sharing/access/${token}`, {
        password: pwd || password,
      });

      const data = response.data;

      if (!data.success) {
        setError(data.error || "Failed to access file");
        setAuthenticating(false);
        return;
      }

      if (data.signedUrl) {
        // Use stream URL (same-origin) for previews to avoid CORS with B2/signed URLs
        const streamUrl = `${getApiBaseURL()}/sharing/stream/${token}`;
        setFileUrl(streamUrl);
        setPasswordRequired(false);
        setLoading(false);
      } else {
        setError("No file URL provided");
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error("Error accessing file:", err);
      const apiError = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setError(apiError || (err instanceof Error ? err.message : "Failed to access file"));
      setAuthenticating(false);
    } finally {
      setAuthenticating(false);
    }
  };

  const loadFileContent = async () => {
    if (!file || !token) return;

    const mimeType = file.mimeType.toLowerCase();
    const extension = getFileExtension(file.fileName);

    // Text-based files: load via API proxy to avoid CORS with signed URLs
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      mimeType === "application/typescript" ||
      mimeType === "application/x-yaml" ||
      mimeType === "application/sql" ||
      mimeType === "application/x-sh" ||
      mimeType === "application/x-bat" ||
      mimeType === "application/x-powershell" ||
      mimeType === "application/x-httpd-php" ||
      mimeType === "application/x-ruby" ||
      mimeType === "text/x-python" ||
      mimeType === "text/x-java" ||
      mimeType === "text/x-go" ||
      mimeType === "text/rust" ||
      mimeType === "text/x-c++" ||
      mimeType === "text/x-c" ||
      mimeType === "text/x-csharp" ||
      mimeType === "text/x-scss" ||
      [
        "txt",
        "md",
        "json",
        "xml",
        "csv",
        "tsv",
        "log",
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "c",
        "cpp",
        "h",
        "css",
        "scss",
        "html",
        "sql",
        "yaml",
        "yml",
        "sh",
        "bat",
        "ps1",
        "php",
        "rb",
        "go",
        "rs",
        "cs",
        "ini",
        "conf",
        "env",
        "lock",
      ].includes(extension)
    ) {
      setContentLoading(true);
      try {
        const response = await api.get(`/sharing/content/${token}`);
        const data = response.data;
        if (data?.success && typeof data.content === "string") {
          setFileContent(data.content);
          setEditedContent(data.content);
        } else {
          throw new Error("Invalid content response");
        }
      } catch (err) {
        console.error("Failed to load file content:", err);
        setError("Failed to load file content");
      } finally {
        setContentLoading(false);
      }
    }
  };

  const loadComments = async () => {
    if (!token || !canComment()) return;

    setLoadingComments(true);
    try {
      const response = await api.get(`/sharing/comments/${token}`);

      const data = response.data;

      if (data.success && data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDownload = () => {
    if (fileUrl && canDownload()) {
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

  const handleSaveEdit = async () => {
    if (!canEdit() || !file) return;

    setSaving(true);
    try {
      const response = await api.post(`/sharing/edit/${token}`, {
        content: editedContent,
      });

      const data = response.data;

      if (data.success) {
        setFileContent(editedContent);
        setIsEditing(false);
        alert("Changes saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save changes");
      }
    } catch (err) {
      console.error("Failed to save changes:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!canComment() || !newComment.trim()) return;

    // Use authenticated user's name or "Anonymous"
    const userName = currentUser?.firstName || "Anonymous";

    try {
      const response = await api.post(`/sharing/comments/${token}`, {
        text: newComment,
        userName: userName,
      }, {
        withCredentials: true,
      });

      const data = response.data;

      if (data.success && data.comment) {
        setComments([...comments, data.comment]);
        setNewComment("");
      } else {
        throw new Error(data.error || "Failed to add comment");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to add comment. Please try again.",
      );
    }
  };

  const renderPreview = () => {
    if (!fileUrl || !file) return null;

    if (file.is_locked) {
      return; // Locked file, no preview
    }

    const mimeType = file.mimeType.toLowerCase();
    const extension = getFileExtension(file.fileName);

    // Images
    if (mimeType.startsWith("image/")) {
      return (
        <ImageContainer>
          <PreviewImage src={fileUrl} alt={file.fileName} />
        </ImageContainer>
      );
    }

    // PDFs
    if (mimeType === "application/pdf") {
      return (
        <IframeContainer>
          <PreviewIframe src={`${fileUrl}#view=FitH`} title={file.fileName} />
        </IframeContainer>
      );
    }

    // Videos
    if (mimeType.startsWith("video/")) {
      return (
        <VideoContainer>
          <PreviewVideo controls>
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the video tag.
          </PreviewVideo>
        </VideoContainer>
      );
    }

    // Audio
    if (mimeType.startsWith("audio/")) {
      return (
        <AudioContainer>
          <PreviewAudio controls>
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the audio tag.
          </PreviewAudio>
        </AudioContainer>
      );
    }

    // Text-based files
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      mimeType === "application/typescript" ||
      mimeType === "application/x-yaml" ||
      mimeType === "application/sql" ||
      mimeType === "application/x-sh" ||
      mimeType === "application/x-bat" ||
      mimeType === "application/x-powershell" ||
      mimeType === "application/x-httpd-php" ||
      mimeType === "application/x-ruby" ||
      mimeType === "text/x-python" ||
      mimeType === "text/x-java" ||
      mimeType === "text/x-go" ||
      mimeType === "text/rust" ||
      mimeType === "text/x-c++" ||
      mimeType === "text/x-c" ||
      mimeType === "text/x-csharp" ||
      mimeType === "text/x-scss" ||
      [
        "txt",
        "md",
        "json",
        "xml",
        "csv",
        "tsv",
        "log",
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "c",
        "cpp",
        "h",
        "css",
        "scss",
        "html",
        "sql",
        "yaml",
        "yml",
        "sh",
        "bat",
        "ps1",
        "php",
        "rb",
        "go",
        "rs",
        "cs",
        "ini",
        "conf",
        "env",
        "lock",
      ].includes(extension)
    ) {
      if (contentLoading) {
        return (
          <CenteredContainer>
            <LoadingSpinner />
            <LoadingText>Loading content...</LoadingText>
          </CenteredContainer>
        );
      }

      if (!fileContent) {
        return (
          <CenteredContainer>
            <LoadingSpinner />
            <LoadingText>Waiting for content...</LoadingText>
          </CenteredContainer>
        );
      }

      // Edit mode for text files
      if (isEditing && canEdit()) {
        return (
          <EditContainer>
            <EditToolbar>
              <EditInfo>
                <Edit3 size={16} />
                Editing mode
              </EditInfo>
              <EditActions>
                <CancelEditButton
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(fileContent);
                  }}
                >
                  Cancel
                </CancelEditButton>
                <SaveEditButton onClick={handleSaveEdit} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </SaveEditButton>
              </EditActions>
            </EditToolbar>
            <EditTextArea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              spellCheck={false}
            />
          </EditContainer>
        );
      }

      // View mode for text files
      const lines = fileContent.split("\n");

      return (
        <TextViewerContainer>
          <TextViewerContent>
            {lines.map((line, index) => (
              <TextLine key={index}>
                <LineNumberCell>{index + 1}</LineNumberCell>
                <LineContentCell>{line || "\u00A0"}</LineContentCell>
              </TextLine>
            ))}
          </TextViewerContent>
        </TextViewerContainer>
      );
    }

    // Office documents via Google Viewer
    if (["doc", "docx", "xls", "xlsx", "xlsm", "ppt", "pptx", "odt", "ods", "rtf"].includes(extension)) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        fileUrl,
      )}&embedded=true`;
      return (
        <IframeContainer>
          <PreviewIframe src={viewerUrl} title={file.fileName} />
        </IframeContainer>
      );
    }

    // Spreadsheets (CSV, TSV) - already handled as text above, but add fallback
    if (["csv", "tsv"].includes(extension) && !fileContent) {
      // If CSV/TSV wasn't loaded as text, try to show it
      return (
        <CenteredContainer>
          <DownloadButton onClick={handleDownload}>
            <Download size={20} />
            Download {file.fileName}
          </DownloadButton>
          <InfoText>
            CSV/TSV files can be viewed as text. Click download to open in a spreadsheet application.
          </InfoText>
        </CenteredContainer>
      );
    }

    // Archive files - not previewable
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return (
        <CenteredContainer>
          <DownloadButton onClick={handleDownload}>
            <Download size={20} />
            Download {file.fileName}
          </DownloadButton>
          <InfoText>
            Archive files cannot be previewed. Please download to extract.
          </InfoText>
        </CenteredContainer>
      );
    }

    // Default fallback for unsupported formats
    return (
      <CenteredContainer>
        <UnsupportedIcon>📄</UnsupportedIcon>
        <UnsupportedTitle>Preview not available</UnsupportedTitle>
        <UnsupportedText>
          This file type cannot be previewed in the browser
        </UnsupportedText>
        {canDownload() && (
          <DownloadButton onClick={handleDownload}>
            <Download size={18} />
            Download to view
          </DownloadButton>
        )}
      </CenteredContainer>
    );
  };

  useEffect(() => {
    if (token) {
      fetchShareInfo();
      fetchCurrentUser();
    } else {
      setLoading(false);
      setError("Invalid share link. Check the URL and try again.");
    }
  }, [token]);

  // Show invalid link immediately when no token (e.g. /shared without token)
  if (!token) {
    return (
      <Container>
        <CenteredContainer>
          <AlertCircle size={64} color="#d93025" />
          <ErrorTitle>Invalid share link</ErrorTitle>
          <ErrorText>Check the URL and try again.</ErrorText>
        </CenteredContainer>
      </Container>
    );
  }

  useEffect(() => {
    if (fileUrl && file) {
      loadFileContent();
      loadComments();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <Container>
        <CenteredContainer>
          <LoadingSpinner />
          <LoadingText>Loading shared file...</LoadingText>
        </CenteredContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <CenteredContainer>
          <AlertCircle size={64} color="#d93025" />
          <ErrorTitle>Cannot access file</ErrorTitle>
          <ErrorText>{error}</ErrorText>
        </CenteredContainer>
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

  if (fileUrl && file) {
    return (
      <PreviewOverlay>
        <PreviewContainer>
          <PreviewHeader>
            <HeaderLeft>
              <FileName>{file.fileName}</FileName>
              <FileInfo>
                {formatFileSize(file.fileSize)} · Shared by {file.ownerName}
              </FileInfo>
              <PermissionBadge $permission={file.permission}>
                {file.permission === "view" && <Eye size={14} />}
                {file.permission === "comment" && <MessageSquare size={14} />}
                {file.permission === "edit" && <Edit3 size={14} />}
                {file.permission === "download" && <Download size={14} />}
                {file.permission === "view" && "View only"}
                {file.permission === "comment" && "Can comment"}
                {file.permission === "edit" && "Can edit"}
                {file.permission === "download" && "Can download"}
              </PermissionBadge>
            </HeaderLeft>

            <HeaderRight>
              {canEdit() && fileContent && (
                <HeaderButton
                  onClick={() => setIsEditing(!isEditing)}
                  title={isEditing ? "View mode" : "Edit mode"}
                  $active={isEditing}
                >
                  <Edit3 size={20} />
                </HeaderButton>
              )}

              {canComment() && (
                <HeaderButton
                  onClick={() => setShowComments(!showComments)}
                  title="Comments"
                  $active={showComments}
                >
                  <MessageSquare size={20} />
                  {comments.length > 0 && (
                    <CommentBadge>{comments.length}</CommentBadge>
                  )}
                </HeaderButton>
              )}

              {canDownload() && (
                <HeaderButton onClick={handleDownload} title="Download">
                  <Download size={20} />
                </HeaderButton>
              )}
            </HeaderRight>
          </PreviewHeader>

          <ContentWrapper>
            <PreviewContent $withComments={showComments && canComment()}>
              {renderPreview()}
            </PreviewContent>

            <CommentsPanel $show={showComments && canComment()}>
              <CommentsPanelHeader>
                <CommentsPanelTitle>
                  <MessageSquare size={18} />
                  Comments ({comments.length})
                </CommentsPanelTitle>
              </CommentsPanelHeader>

              <CommentsList>
                {loadingComments ? (
                  <CenteredContainer>
                    <LoadingSpinner />
                    <LoadingText>Loading comments...</LoadingText>
                  </CenteredContainer>
                ) : comments.length === 0 ? (
                  <EmptyComments>
                    <MessageSquare size={32} color="#dadce0" />
                    <EmptyCommentsText>No comments yet</EmptyCommentsText>
                    <EmptyCommentsSubtext>
                      Be the first to comment
                    </EmptyCommentsSubtext>
                  </EmptyComments>
                ) : (
                  comments.map((comment) => (
                    <CommentItem key={comment.id}>
                      <CommentHeader>
                        <CommentAvatar>
                          <User size={14} />
                        </CommentAvatar>
                        <CommentAuthor>{comment.userName}</CommentAuthor>
                      </CommentHeader>
                      <CommentText>{comment.text}</CommentText>
                      <CommentTime>
                        {new Date(comment.timestamp).toLocaleString()}
                      </CommentTime>
                    </CommentItem>
                  ))
                )}
              </CommentsList>

              <CommentInputContainer>
                {currentUser ? (
                  <CurrentUserBadge>
                    <User size={12} />
                    Commenting as: <strong>{currentUser.firstName}</strong>
                  </CurrentUserBadge>
                ) : (
                  <AnonymousBadge>
                    <User size={12} />
                    Commenting as: <strong>Anonymous</strong>
                  </AnonymousBadge>
                )}
                <CommentTextArea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <CommentButton
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </CommentButton>
              </CommentInputContainer>
            </CommentsPanel>
          </ContentWrapper>

          {file.expiresAt && (
            <ExpirationNotice>
              This link expires on{" "}
              {new Date(file.expiresAt).toLocaleDateString()}
            </ExpirationNotice>
          )}

          {file.maxDownloads && canDownload() && (
            <DownloadNotice>
              {file.downloadCount} / {file.maxDownloads} downloads used
            </DownloadNotice>
          )}
        </PreviewContainer>
      </PreviewOverlay>
    );
  }

  return null;
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  background: #ffffff;
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
  box-sizing: border-box;

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

const PreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

const FileName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileInfo = styled.div`
  font-size: 13px;
  color: #5f6368;
`;

const PermissionBadge = styled.div<{ $permission: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(p) => {
    switch (p.$permission) {
      case "edit":
        return "#e8f5e9";
      case "comment":
        return "#fff3e0";
      case "download":
        return "#e3f2fd";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${(p) => {
    switch (p.$permission) {
      case "edit":
        return "#2e7d32";
      case "comment":
        return "#f57c00";
      case "download":
        return "#1976d2";
      default:
        return "#616161";
    }
  }};
  width: fit-content;
  margin-top: 4px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
`;

const HeaderButton = styled.button<{ $active?: boolean }>`
  position: relative;
  background: ${(p) => (p.$active ? "#e8f0fe" : "transparent")};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => (p.$active ? "#1a73e8" : "#5f6368")};
  transition: all 0.2s;

  &:hover {
    background: ${(p) => (p.$active ? "#e8f0fe" : "#f1f3f4")};
    color: ${(p) => (p.$active ? "#1a73e8" : "#202124")};
  }

  &:active {
    background: #e8eaed;
  }
`;

const CommentBadge = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  background: #1a73e8;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const PreviewContent = styled.div<{ $withComments?: boolean }>`
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #ffffff;
  width: ${(p) => (p.$withComments ? "calc(100% - 400px)" : "100%")};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  pre {
    color: black !important;
  }
`;

const CommentsPanel = styled.div<{ $show?: boolean }>`
  width: ${(p) => (p.$show ? "400px" : "0")};
  border-left: ${(p) => (p.$show ? "1px solid #e8eaed" : "none")};
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$show ? 1 : 0)};
`;

const CommentsPanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e8eaed;
  background: white;
`;

const CommentsPanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #202124;
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
`;

const EmptyComments = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
`;

const EmptyCommentsText = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #5f6368;
`;

const EmptyCommentsSubtext = styled.div`
  font-size: 13px;
  color: #80868b;
`;

const CommentItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const CommentAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a73e8;
  flex-shrink: 0;
`;

const CommentAuthor = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #202124;
`;

const CommentText = styled.div`
  font-size: 14px;
  color: #202124;
  margin-bottom: 8px;
  line-height: 1.5;
  word-wrap: break-word;
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const CommentInputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #e8eaed;
  background: white;
`;

const CurrentUserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e8f0fe;
  border-radius: 8px;
  font-size: 12px;
  color: #1a73e8;
  margin-bottom: 12px;

  strong {
    font-weight: 600;
  }
`;

const AnonymousBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 12px;

  strong {
    font-weight: 600;
  }
`;

const CommentTextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 12px;
  box-sizing: border-box;
  background: white;
  color: #202124;
  line-height: 1.5;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }

  &::placeholder {
    color: #80868b;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const CommentButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1557b0;
    box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
`;

const EditToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff3e0;
  border-bottom: 1px solid #ffe0b2;
`;

const EditInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #f57c00;
`;

const EditActions = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelEditButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #dadce0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  color: #5f6368;

  &:hover {
    background: #f5f5f5;
  }
`;

const SaveEditButton = styled.button`
  padding: 8px 16px;
  background: #1a73e8;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #1557b0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditTextArea = styled.textarea`
  flex: 1;
  padding: 20px;
  border: none;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  resize: none;
  line-height: 1.6;

  &:focus {
    outline: none;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #ffffff;
`;

const PreviewIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
`;

const PreviewVideo = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const AudioContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const PreviewAudio = styled.audio`
  width: 90%;
  max-width: 600px;
`;

const TextViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #ffffff;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
`;

const TextViewerContent = styled.div`
  display: table;
  width: 100%;
  border-collapse: collapse;
`;

const TextLine = styled.div`
  display: table-row;

  &:hover {
    background: #f8f9fa;
  }
`;

const LineNumberCell = styled.div`
  display: table-cell;
  padding: 4px 16px;
  text-align: right;
  color: #80868b;
  background: #f8f9fa;
  border-right: 1px solid #e8eaed;
  user-select: none;
  vertical-align: top;
  width: 60px;
  min-width: 60px;
`;

const LineContentCell = styled.div`
  display: table-cell;
  padding: 4px 24px;
  color: #202124 !important;
  background: #ffffff !important;
  white-space: pre-wrap;
  word-break: break-all;
  vertical-align: top;

  * {
    color: #202124 !important;
  }
`;

const UnsupportedIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const UnsupportedTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 8px;
`;

const UnsupportedText = styled.div`
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 16px;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: #5f6368;
  margin-top: 12px;
  text-align: center;
  max-width: 400px;
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

const ExpirationNotice = styled.div`
  padding: 12px 24px;
  background: #fff3cd;
  border-top: 1px solid #ffc107;
  font-size: 13px;
  color: #856404;
  text-align: center;
  flex-shrink: 0;
`;

const DownloadNotice = styled.div`
  padding: 12px 24px;
  background: #e8f0fe;
  border-top: 1px solid #1a73e8;
  font-size: 13px;
  color: #1557b0;
  text-align: center;
  flex-shrink: 0;
`;

export default SharedViewer;
