import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import { useFileSearch } from "../../../shared/hooks/useFileSearch";

import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import { useEvent } from "../../../../events/useEvent";

interface SharedFile {
  share_id: string;
  file_id: number;
  original_name: string;
  size: number;
  mime_type: string;
  owner_name: string;
  owner_email: string;
  permission: string;
  share_type: string;
  folder_path?: string;
  expires_at: string | null;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const getEmptyMessage = (hasActiveFilters: boolean) =>
  hasActiveFilters ? "No files match your filters" : "No shared files yet";

const getEmptySubtext = (hasActiveFilters: boolean) =>
  hasActiveFilters
    ? "Try adjusting your search or filter criteria"
    : "Files shared with you will appear here";

const SharedWithYou: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [sharedFiles, setSharedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const { filteredFiles, hasActiveFilters, activeFilterCount } =
    useFileSearch(sharedFiles);

  const handleFilePreview = (file: FileItem) => setPreviewFile(file);
  const handleClosePreview = () => setPreviewFile(null);

  const fetchSharedFiles = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await fetch("/api/files/shared-with-me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        // Transform shared files to FileItem format
        const transformedFiles: FileItem[] = data.sharedFiles.map(
          (file: SharedFile) => ({
            id: file.file_id,
            name: file.original_name,
            type: "file",
            mimeType: file.mime_type,
            size: file.size,
            location: file.folder_path || "Shared With You",
            owner: {
              name: file.owner_name || file.owner_email,
              isYou: false,
            },
            lastInteraction: file.expires_at
              ? formatDate(file.expires_at)
              : "Shared",
            lastInteractionType: "shared",
            url: "", // optional if needed
          }),
        );
        setSharedFiles(transformedFiles);
      }
    } catch (err) {
      console.error("Failed to fetch shared files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedFiles();
  }, [accessToken]);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchSharedFiles();
  });

  return (
    <Container>
      <Header>
        <Title>Shared With You</Title>
        {sharedFiles.length > 0 && (
          <FileCount>
            {sharedFiles.length} {sharedFiles.length === 1 ? "file" : "files"}
          </FileCount>
        )}
      </Header>

      {hasActiveFilters && (
        <FilterIndicator>
          Showing {filteredFiles.length} of {sharedFiles.length} files
          {activeFilterCount > 0 &&
            ` (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active)`}
        </FilterIndicator>
      )}

      <EnhancedFilesTable
        files={filteredFiles}
        loading={loading}
        emptyMessage={getEmptyMessage(hasActiveFilters)}
        emptySubtext={getEmptySubtext(hasActiveFilters)}
        onFilePreview={handleFilePreview}
        showOwner={true}
        showLocation={true}
        isShared={true}
      />

      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          ownerName={previewFile.owner.name}
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

export default SharedWithYou;
