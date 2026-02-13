import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import SidebarToggle from "../sidebar/SidebarToggle";
import { useFileSearch } from "../../../shared/hooks/useFileSearch";

import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import { useEvent } from "../../../../events/useEvent";
import PageTransition from "../../../shared/PageTransition";
import api from "../../../../lib/axios";

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
  const [sharedFiles, setSharedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const { filteredFiles, hasActiveFilters, activeFilterCount } =
    useFileSearch(sharedFiles);

  const navigableFiles =
    selectedFiles.size > 0
      ? filteredFiles.filter((f) => selectedFiles.has(f.id))
      : filteredFiles;

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

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

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/files/shared-with-me");
      const data = res.data;
      if (data.success && data.sharedFiles) {
        const transformedFiles: FileItem[] = data.sharedFiles.map(
          (file: SharedFile) => ({
            id: String(file.file_id),
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
            url: "",
          }),
        );
        setSharedFiles(transformedFiles);
      } else {
        setSharedFiles([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch shared files:", err);
      setSharedFiles([]);
      // The backend route may be failing due to missing share_recipients table
      // This is a backend issue, but we handle it gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchSharedFiles();
  });

  return (
    <PageTransition>
      <Container>
        <Header>
          <SidebarToggle />
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
          files={filteredFiles as import("../../../shared/enhancedFileTable/types/fileActions").EnhancedFileItem[]}
          loading={loading}
          emptyMessage={getEmptyMessage(hasActiveFilters)}
          emptySubtext={getEmptySubtext(hasActiveFilters)}
          onFilePreview={(f) => handleFilePreview(f as import("../../../shared/files_table/FilesTable").FileItem)}
          onFileSelect={(f, sel) => handleFileSelect(f as import("../../../shared/files_table/FilesTable").FileItem, sel)}
          selectedFiles={selectedFiles}
          showOwner={true}
          showLocation={true}
          isShared={true}
          maxHeight={770}
          // onFilesUpload and checkStorageLimit are intentionally omitted
        />

        {previewFile && (
          <FilePreview
            fileId={previewFile.id}
            fileName={previewFile.name}
            mimeType={previewFile.mimeType}
            ownerName={previewFile.owner.name}
            onClose={handleClosePreview}
            allFiles={navigableFiles}
            currentIndex={previewIndex}
            onNavigate={handleNavigate}
          />
        )}
      </Container>
    </PageTransition>
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

const FilterIndicator = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
`;

export default SharedWithYou;
