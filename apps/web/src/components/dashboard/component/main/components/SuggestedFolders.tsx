import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../../../store/authStore";
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

interface Folder {
  name: string;
  path: string;
  fileCount: number;
  totalSize: number;
}

const SuggestedFolders: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/files/folders", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch folders");
        }

        const data = await response.json();
        if (data.success) {
          setFolders(data.folders);
        }
      } catch (err) {
        console.error("Error fetching folders:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchFolders();
    }
  }, [accessToken]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFolderClick = (folder: Folder) => {
    console.log("Navigate to folder:", folder.path);
    // TODO: Implement navigation to folder view
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
    <Container>
      <Header>
        <Title>Suggested Folders</Title>
      </Header>
      <FoldersGrid>
        {folders.slice(0, 6).map((folder) => (
          <FolderCard
            key={folder.path}
            onClick={() => handleFolderClick(folder)}
          >
            <FolderIconWrapper>
              <FilesIcon color="#5f6368" />
            </FolderIconWrapper>
            <FolderInfo>
              <FolderName title={folder.name}>{folder.name}</FolderName>
              <FolderMeta>
                {folder.fileCount} {folder.fileCount === 1 ? "file" : "files"}
                {" ("}
                {formatSize(folder.totalSize)}
                {")"}
              </FolderMeta>
            </FolderInfo>
          </FolderCard>
        ))}
      </FoldersGrid>
    </Container>
  );
};

// Styled Components
export default SuggestedFolders;
