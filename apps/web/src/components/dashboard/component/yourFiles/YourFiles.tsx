import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import { useFileSearch } from "../../../shared/hooks/useFileSearch";

import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import { useEvent } from "../../../../events/useEvent";

export interface ApiFile {
  id: string;
  original_name: string;
  s3_key: string;
  folder_path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export const formatDate = (dateString: string): string => {
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

const getEmptyMessage = (hasActiveFilters: boolean): string => {
  if (hasActiveFilters) {
    return "No files match your filters";
  }
  return "No files yet";
};

const getEmptySubtext = (hasActiveFilters: boolean): string => {
  if (hasActiveFilters) {
    return "Try adjusting your search or filter criteria";
  }
  return "Upload files to get started";
};

const YourFiles: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const { filteredFiles, hasActiveFilters, activeFilterCount } =
    useFileSearch(files);

  const handleFilePreview = (file: FileItem) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/files", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();

      if (data.success) {
        const transformedFiles: FileItem[] = data.files.map(
          (file: ApiFile) => ({
            id: file.id,
            name: file.original_name,
            type: "file" as const,
            mimeType: file.mime_type,
            lastInteraction: formatDate(file.created_at),
            lastInteractionType: "uploaded" as const,
            location: file.folder_path || "Your Files",
            owner: {
              name: user?.name || user?.email || "You",
              isYou: true,
            },
            size: file.size,
            url: file.s3_key,
          }),
        );
        setFiles(transformedFiles);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [accessToken, user]);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchFiles();
  });

  return (
    <Container>
      <Header>
        <Title>Your Files</Title>
        {files.length > 0 && (
          <FileCount>
            {files.length} {files.length === 1 ? "file" : "files"}
          </FileCount>
        )}
      </Header>

      {hasActiveFilters && (
        <FilterIndicator>
          Showing {filteredFiles.length} of {files.length} files
          {activeFilterCount > 0 &&
            ` (${activeFilterCount} filter${
              activeFilterCount > 1 ? "s" : ""
            } active)`}
        </FilterIndicator>
      )}

      <EnhancedFilesTable
        files={filteredFiles}
        loading={loading}
        emptyMessage={getEmptyMessage(hasActiveFilters)}
        emptySubtext={getEmptySubtext(hasActiveFilters)}
        onFilePreview={handleFilePreview}
        showOwner={false}
        showLocation={true}
      />

      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={handleClosePreview}
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

const FileCount = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

const FilterIndicator = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
`;

export default YourFiles;
