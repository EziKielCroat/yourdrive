import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import FilesTable from "../../../shared/files_table/FilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";

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
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

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
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  useEffect(() => {
    if (accessToken) {
      fetchFavorites();
    }
  }, [accessToken]);

  return (
    <Container>
      <Header>
        <Title>Favorites</Title>
      </Header>

      <FilesTable
        files={files}
        loading={loading}
        emptyMessage="No favorited files"
        emptySubtext="Star files to add them to your favorites"
        onFilePreview={handleFilePreview}
        showOwner={false}
        showLocation={true}
        singleClickMode="preview"
      />

      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={handleClosePreview}
          onFavorite={fetchFavorites}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 32px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

export default Favorited;
