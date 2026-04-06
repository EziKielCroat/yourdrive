import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../../store/authStore";
import { useStorageStore } from "../../../../../store/storageStore";
import FilesTable, {
  type FileItem,
} from "../../../../shared/files_table/FilesTable";
import { useFileSearch } from "../../../../shared/hooks/useFileSearch";
import FilePreview from "../../../../shared/filesPreview/FilesPreview";

import { FILES_REFRESH_EVENT } from "../../../../../events/fileEvents";
import { useEvent } from "../../../../../events/useEvent";
import { eventBus } from "../../../../../events/eventBus";
import api from "../../../../../lib/axios";
import {
  uploadDashboardFileList,
  getUploadErrorMessage,
} from "../../../../../lib/fileUpload";

interface ApiFile {
  id: string;
  original_name?: string;
  name?: string;
  s3_key: string;
  folder_path?: string;
  size?: number;
  mime_type?: string;
  mimeType?: string;
  created_at?: string;
  createdAt?: string;
  last_edited_at?: string;
  is_shared?: boolean;
  owner_name?: string;
  owner_email?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
};

const getEmptyMessage = (hasActiveFilters: boolean): string => {
  if (hasActiveFilters) {
    return "No files match your filters";
  }
  return "No recent files";
};

const getEmptySubtext = (hasActiveFilters: boolean): string => {
  if (hasActiveFilters) {
    return "Try adjusting your search or filter criteria";
  }
  return "Files you upload or interact with will appear here";
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-GB");
};

const RecentFiles: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const addUsage = useStorageStore((s) => s.addUsage);
  const refreshStorage = useStorageStore((s) => s.refreshStorage);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const { filteredFiles, hasActiveFilters, activeFilterCount } =
    useFileSearch(files);

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

  const handleFileContextMenu = (file: FileItem, event: React.MouseEvent) => {
    console.log(
      "Context menu for:",
      file.name,
      "at",
      event.clientX,
      event.clientY,
    );
  };

  const checkStorageLimit = (totalSize: number): boolean => {
    const { totalBytes, usedBytes } = useStorageStore.getState();
    const availableBytes = totalBytes - usedBytes;

    if (totalSize > availableBytes) {
      alert(
        `Not enough storage space. You need ${formatBytes(
          totalSize,
        )} but only have ${formatBytes(availableBytes)} available.`,
      );
      return false;
    }
    return true;
  };

  const handleFilesUpload = async (fileList: FileList): Promise<void> => {
    if (!fileList.length) return;

    const totalSize = Array.from(fileList).reduce(
      (sum, file) => sum + file.size,
      0,
    );

    if (!checkStorageLimit(totalSize)) {
      return;
    }

    const hasStructure = Array.from(fileList).some(
      (file) => (file as File & { webkitRelativePath?: string }).webkitRelativePath,
    );

    try {
      await uploadDashboardFileList(fileList, (file) => {
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || "";
        if (hasStructure && relativePath) {
          return relativePath.substring(0, relativePath.lastIndexOf("/")) || "";
        }
        return "";
      });

      addUsage(totalSize);

      try {
        await refreshStorage();
      } catch (storageErr) {
        console.warn("Storage refresh failed after upload:", storageErr);
      }

      eventBus.emit(FILES_REFRESH_EVENT);
    } catch (err) {
      console.error("Upload error:", err);
      alert(getUploadErrorMessage(err));
      throw err;
    }
  };

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/files/recent?limit=10&scope=activity");
      const data = response.data;

      if (data.success && data.files) {
        const transformedFiles: FileItem[] = data.files.map(
          (file: ApiFile) => ({
            id: String(file.id),
            name: file.original_name || file.name || "Untitled",
            type: "file",
            mimeType:
              file.mime_type || file.mimeType || "application/octet-stream",
            lastInteraction: formatDate(
              file.last_edited_at || file.created_at || file.createdAt,
            ),
            lastInteractionType: file.is_shared ? "shared" : "uploaded",
            location:
              file.is_shared
                ? "Shared with you"
                : file.folder_path && file.folder_path.trim() !== ""
                  ? file.folder_path
                  : "Your Files",
            owner: file.is_shared
              ? {
                  name: file.owner_name || file.owner_email || "Someone",
                  isYou: false,
                }
              : {
                  name: user?.firstName || user?.email || "You",
                  isYou: true,
                },
            size: Number(file.size) || 0,
            url: file.s3_key,
          }),
        );
        setFiles(transformedFiles);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching recent files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on user change only
  }, [user]);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchRecentFiles();
  });

  return (
    <Container>
      {hasActiveFilters && (
        <FilterIndicator>
          Showing {filteredFiles.length} of {files.length} files
          {activeFilterCount > 0 &&
            ` (${activeFilterCount} filter${
              activeFilterCount > 1 ? "s" : ""
            } active)`}
        </FilterIndicator>
      )}
      <FilesTable
        files={filteredFiles}
        loading={loading}
        emptyMessage={getEmptyMessage(hasActiveFilters)}
        emptySubtext={getEmptySubtext(hasActiveFilters)}
        onFilePreview={handleFilePreview}
        onFileSelect={handleFileSelect}
        onFileContextMenu={handleFileContextMenu}
        selectedFiles={selectedFiles}
        showOwner={true}
        showLocation={true}
        singleClickMode="preview"
        maxHeight={650}
        onFilesUpload={handleFilesUpload}
        checkStorageLimit={checkStorageLimit}
        showFolderStructure={false}
      />
      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={handleClosePreview}
          allFiles={navigableFiles}
          currentIndex={previewIndex}
          onNavigate={handleNavigate}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  margin-top: 24px;
  width: 100%;
  min-width: 0;
`;

const FilterIndicator = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
`;

export default RecentFiles;
