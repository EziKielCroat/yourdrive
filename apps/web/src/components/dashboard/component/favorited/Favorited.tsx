import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import SidebarToggle from "../sidebar/SidebarToggle";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }
};

const Favorited: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const navigableFiles =
    selectedFiles.size > 0
      ? files.filter((f) => selectedFiles.has(f.id))
      : files;

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/files/favorites", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const transformedFiles: FileItem[] = data.files.map((file: any) => ({
          id: file.id,
          name: file.original_name,
          type: "file" as const,
          mimeType: file.mime_type,
          lastInteraction: formatDate(file.favorited_at),
          lastInteractionType: "favorited" as const,
          location: file.folder_path || "Your Files",
          owner: {
            name: user?.name || user?.email || "You",
            isYou: true,
          },
          size: file.size,
          url: file.s3_key,
        }));
        setFiles(transformedFiles);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilePreview = (file: FileItem) => {
    const index = navigableFiles.findIndex((f) => f.id === file.id);
    setPreviewIndex(index);
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < navigableFiles.length) {
      setPreviewIndex(newIndex);
    }
  };

  const handleClosePreview = () => {
    setPreviewIndex(-1);
  };

  const handleFileSelect = (file: FileItem, selected: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(file.id);
      } else {
        newSet.delete(file.id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (accessToken) {
      fetchFavorites();
    }
  }, [accessToken]);

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

  return (
    <Container>
      <Header>
        <SidebarToggle />
        <Title>Favorites</Title>
        {files.length > 0 && (
          <FileCount>
            {files.length} {files.length === 1 ? "file" : "files"}
          </FileCount>
        )}
      </Header>

      <EnhancedFilesTable
        files={files}
        loading={loading}
        emptyMessage="No favorited files"
        emptySubtext="Star files to add them to your favorites"
        onFilePreview={handleFilePreview}
        onFileSelect={handleFileSelect}
        selectedFiles={selectedFiles}
        showOwner={false}
        showLocation={true}
        singleClickMode="preview"
        maxHeight={770}
      />

      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={handleClosePreview}
          onFavorite={fetchFavorites}
          allFiles={navigableFiles}
          currentIndex={previewIndex}
          onNavigate={handleNavigate}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

const FileCount = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

export default Favorited;
