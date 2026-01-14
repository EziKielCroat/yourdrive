import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../../store/authStore";
import FilesIcon from "../../../../shared/icons/files";
import FilePreview from "../../../../shared/filesPreview/FilesPreview";

interface FolderPreviewModalProps {
  folder: { name: string; path: string };
  onClose: () => void;
}

interface FolderContent {
  files: Array<{
    id: number;
    name: string;
    size: number;
    path: string;
    mimeType?: string;
  }>;
  folders: Array<{ name: string; path: string }>;
}

const FolderPreviewModal: React.FC<FolderPreviewModalProps> = ({
  folder,
  onClose,
}) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [content, setContent] = useState<FolderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(folder.path);
  const [pathHistory, setPathHistory] = useState<string[]>([folder.path]);
  const [previewFile, setPreviewFile] = useState<{
    id: number;
    name: string;
    mimeType?: string;
  } | null>(null);

  const fetchContent = async (path: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/files/folder-contents?path=${encodeURIComponent(path)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      if (data.success) setContent(data.content);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(currentPath);
  }, [currentPath, accessToken]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !previewFile) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, previewFile]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !previewFile) onClose();
  };

  const handleFolderClick = (folderPath: string) => {
    setPathHistory([...pathHistory, folderPath]);
    setCurrentPath(folderPath);
  };

  const handleBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
    }
  };

  const handleFileClick = (file: FolderContent["files"][0]) => {
    setPreviewFile({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getCurrentFolderName = () => {
    return currentPath.split("/").pop() || folder.name;
  };

  return (
    <>
      <Overlay onClick={handleBackdropClick}>
        <ModalContainer>
          <ModalHeader>
            <HeaderLeft>
              {pathHistory.length > 1 && (
                <BackButton onClick={handleBack}>←</BackButton>
              )}
              <FolderTitle>{getCurrentFolderName()}</FolderTitle>
            </HeaderLeft>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>

          <ModalContent>
            {loading ? (
              <LoadingState>
                <Spinner />
                <LoadingText>Loading...</LoadingText>
              </LoadingState>
            ) : content ? (
              <ContentGrid>
                {content.folders.map((f) => (
                  <GridItem
                    key={f.path}
                    onClick={() => handleFolderClick(f.path)}
                  >
                    <ItemIcon>
                      <FilesIcon color="#5f6368" />
                    </ItemIcon>
                    <ItemName title={f.name}>{f.name}</ItemName>
                    <ItemType>Folder</ItemType>
                  </GridItem>
                ))}

                {content.files.map((file) => (
                  <GridItem key={file.id} onClick={() => handleFileClick(file)}>
                    <ItemIcon>📄</ItemIcon>
                    <ItemInfo>
                      <ItemName title={file.name}>{file.name}</ItemName>
                      <ItemSize>{formatSize(file.size)}</ItemSize>
                    </ItemInfo>
                  </GridItem>
                ))}

                {content.files.length === 0 && content.folders.length === 0 && (
                  <EmptyState>
                    <EmptyText>This folder is empty</EmptyText>
                  </EmptyState>
                )}
              </ContentGrid>
            ) : null}
          </ModalContent>
        </ModalContainer>
      </Overlay>

      {previewFile && (
        <FilePreview
          fileId={previewFile.id.toString()}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};

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
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #dadce0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 20px;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #f1f3f4;
  }
`;

const FolderTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 20px;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #f1f3f4;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
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
  font-size: 14px;
  color: #5f6368;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`;

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #5f6368;
  }
`;

const ItemIcon = styled.div`
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const ItemInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const ItemType = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const ItemSize = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

export default FolderPreviewModal;
