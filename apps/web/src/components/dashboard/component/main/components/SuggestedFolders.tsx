import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Header,
  Title,
  FoldersGrid,
  FolderCard,
  FolderIconWrapper,
  FolderInfo,
  FolderName,
  FolderMeta,
  LoadingState,
  ErrorState,
  EmptyState,
  EmptyText,
  EmptySubtext,
} from "../styles/suggestedFolders.styles";
import FilesIcon from "../../../../shared/icons/files";
import FolderPreviewModal from "./FolderPreviewModal";
import api from "../../../../../lib/axios";
import { useEvent } from "../../../../../events/useEvent";
import { FILES_REFRESH_EVENT } from "../../../../../events/fileEvents";

interface Folder {
  name: string;
  path: string;
  fileCount: number;
  totalSize: number;
}

const SuggestedFolders: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/files/folders");
      const data = response.data;
      if (data.success) setFolders(data.folders || []);
    } catch (err) {
      console.error("Error fetching folders:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEvent(FILES_REFRESH_EVENT, fetchFolders);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Suggested Folders</Title>
        </Header>
        <LoadingState>Loading folders...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Suggested Folders</Title>
        </Header>
        <ErrorState>Failed to load folders</ErrorState>
      </Container>
    );
  }

  if (folders.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Suggested Folders</Title>
        </Header>
        <EmptyState>
          <EmptyText>No folders yet</EmptyText>
          <EmptySubtext>Upload a folder to get started</EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <Title>Suggested Folders</Title>
        </Header>
        <FoldersGrid>
          {folders.slice(0, 4).map((folder) => (
            <FolderCard
              key={folder.path}
              onClick={() => setSelectedFolder(folder)}
            >
              <FolderIconWrapper>
                <FilesIcon color="#5f6368" />
              </FolderIconWrapper>
              <FolderInfo>
                <FolderName title={folder.name}>{folder.name}</FolderName>
                <FolderMeta>
                  {folder.fileCount} {folder.fileCount === 1 ? "file" : "files"}{" "}
                  ({formatSize(folder.totalSize)})
                </FolderMeta>
              </FolderInfo>
            </FolderCard>
          ))}
        </FoldersGrid>
      </Container>

      {selectedFolder && (
        <FolderPreviewModal
          folder={selectedFolder}
          onClose={() => setSelectedFolder(null)}
        />
      )}
    </>
  );
};

export default SuggestedFolders;
