import React from "react";
import styled, { keyframes } from "styled-components";
import {
  X,
  Calendar,
  User,
  Hash,
  File as FileIcon,
  Image,
  FileText,
  FileVideo,
  FileAudio,
  Archive,
  Lock,
  Star,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import type { EnhancedFileItem } from "../types/fileActions";

interface DetailsModalProps {
  isOpen: boolean;
  file: EnhancedFileItem;
  onClose: () => void;
  onDownload?: (file: EnhancedFileItem) => void;
  onShare?: (file: EnhancedFileItem) => void;
  onDelete?: (file: EnhancedFileItem) => void;
  onToggleStar?: (file: EnhancedFileItem) => void;
  onToggleLock?: (file: EnhancedFileItem) => void;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
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
  justify-content: flex-end;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  width: 420px;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e8eaed;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #202124;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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

const ModalBody = styled.div`
  padding: 24px;
`;

const PreviewSection = styled.div`
  margin-bottom: 32px;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const FileIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8eaed;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: #202124;
`;

const FileType = styled.p`
  margin: 0;
  font-size: 13px;
  color: #5f6368;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  background: #f8f9fa;
  margin-bottom: 16px;
`;

const DetailsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DetailIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f1f3f4;
  border-radius: 8px;
  color: #5f6368;
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 2px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #202124;
  font-weight: 500;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span<{ $type?: string }>`
  padding: 4px 8px;
  background: ${(props) => {
    switch (props.$type) {
      case "starred":
        return "#fef7e0";
      case "locked":
        return "#fce8e6";
      case "shared":
        return "#e8f0fe";
      default:
        return "#f1f3f4";
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case "starred":
        return "#fbbc04";
      case "locked":
        return "#d93025";
      case "shared":
        return "#1a73e8";
      default:
        return "#5f6368";
    }
  }};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PermissionsSection = styled.div`
  margin-bottom: 32px;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const PermissionLabel = styled.div`
  font-size: 14px;
  color: #202124;
`;

const PermissionValue = styled.div`
  font-size: 13px;
  color: #5f6368;
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: ${(props) => (props.$danger ? "#fce8e6" : "#f1f3f4")};
  border: none;
  border-radius: 8px;
  color: ${(props) => (props.$danger ? "#d93025" : "#202124")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#fad2cf" : "#e8eaed")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.includes("zip") || mimeType.includes("archive")) return Archive;
  if (mimeType.includes("document") || mimeType.includes("text"))
    return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get owner name from owner object
const getOwnerName = (owner: any): string => {
  if (!owner) return "Unknown";

  if (typeof owner === "string") {
    return owner;
  }

  if (typeof owner === "object") {
    if (owner.name) {
      return owner.isYou ? `${owner.name} (You)` : owner.name;
    }
    return "Unknown";
  }

  return String(owner);
};

// Helper function to check if current user is the owner
const isCurrentUserOwner = (owner: any): boolean => {
  if (!owner) return false;

  if (typeof owner === "string") {
    return owner === "current" || owner === "You";
  }

  if (typeof owner === "object") {
    return owner.isYou === true;
  }

  return false;
};

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  file,
  onClose,
  onDownload,
  onShare,
  onDelete,
  onToggleStar,
  onToggleLock,
}) => {
  if (!isOpen) return null;

  const mimeType = file.mimeType ?? "application/octet-stream";
  const FileIconComponent = getFileIcon(mimeType);
  const isImage = mimeType.startsWith("image/");
  const ownerName = getOwnerName(file.owner);
  const isOwner = isCurrentUserOwner(file.owner);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else if (file.url != null) {
      window.open(file.url, "_blank");
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(file);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file);
    }
  };

  const handleToggleStar = () => {
    if (onToggleStar) {
      onToggleStar(file);
    }
  };

  const handleToggleLock = () => {
    if (onToggleLock) {
      onToggleLock(file);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>File Details</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <PreviewSection>
            {isImage && file.url != null && (
              <PreviewImage src={file.url} alt={file.name} />
            )}

            <FilePreview>
              <FileIconWrapper>
                <FileIconComponent size={24} color="#5f6368" />
              </FileIconWrapper>
              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileType>{mimeType}</FileType>
              </FileInfo>
            </FilePreview>

            <TagContainer>
              <Tag
                onClick={handleToggleStar}
                $type="starred"
                style={{ cursor: onToggleStar ? "pointer" : "default" }}
              >
                <Star
                  size={12}
                  fill={file.isStarred ? "#fbbc04" : "none"}
                  stroke={file.isStarred ? "#fbbc04" : "#fbbc04"}
                />
                {file.isStarred ? "Starred" : "Star"}
              </Tag>

              <Tag
                onClick={handleToggleLock}
                $type="locked"
                style={{ cursor: onToggleLock ? "pointer" : "default" }}
              >
                <Lock size={12} />
                {file.isLocked ? "Locked" : "Unlocked"}
              </Tag>

              {file.shared === true && <Tag $type="shared">Shared</Tag>}
            </TagContainer>
          </PreviewSection>

          <DetailsSection>
            <SectionTitle>File Information</SectionTitle>
            <DetailGrid>
              <DetailItem>
                <DetailIcon>
                  <Hash size={16} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>File ID</DetailLabel>
                  <DetailValue>{file.id}</DetailValue>
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailIcon>
                  <FileIcon size={16} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Size</DetailLabel>
                  <DetailValue>{formatFileSize(file.size ?? 0)}</DetailValue>
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailIcon>
                  <Calendar size={16} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Created</DetailLabel>
                  <DetailValue>{formatDate(file.createdAt ?? (file as { created_at?: string }).created_at)}</DetailValue>
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailIcon>
                  <Calendar size={16} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Modified</DetailLabel>
                  <DetailValue>{formatDate(file.updatedAt ?? (file as { updated_at?: string }).updated_at)}</DetailValue>
                </DetailContent>
              </DetailItem>

              {ownerName !== "Unknown" && (
                <DetailItem>
                  <DetailIcon>
                    <User size={16} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>Owner</DetailLabel>
                    <DetailValue>{ownerName}</DetailValue>
                  </DetailContent>
                </DetailItem>
              )}
            </DetailGrid>
          </DetailsSection>

          {ownerName !== "Unknown" && (
            <PermissionsSection>
              <SectionTitle>Permissions</SectionTitle>
              <PermissionItem>
                <PermissionLabel>You</PermissionLabel>
                <PermissionValue>
                  {isOwner ? "Owner" : "Viewer"}
                </PermissionValue>
              </PermissionItem>
            </PermissionsSection>
          )}

          <ActionsSection>
            <ActionButton onClick={handleDownload}>
              <Download size={16} />
              Download
            </ActionButton>
            <ActionButton onClick={handleShare}>
              <Share2 size={16} />
              Share
            </ActionButton>
            <ActionButton $danger onClick={handleDelete}>
              <Trash2 size={16} />
              Delete
            </ActionButton>
          </ActionsSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};
