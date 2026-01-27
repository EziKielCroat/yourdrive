import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";
import { useStorageStore } from "../../../../store/storageStore";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import { useFileSearch } from "../../../shared/hooks/useFileSearch";

import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import { useEvent } from "../../../../events/useEvent";
import { eventBus } from "../../../../events/eventBus";

export interface ApiFile {
  id: string;
  original_name: string;
  s3_key: string;
  folder_path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
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

    const formData = new FormData();
    const folderPaths: Record<string, string> = {};

    // Check if files have folder structure
    const hasStructure = Array.from(fileList).some(
      (file) => (file as any).webkitRelativePath,
    );

    Array.from(fileList).forEach((file, index) => {
      const relativePath = (file as any).webkitRelativePath || "";

      if (hasStructure && relativePath) {
        const folderPath =
          relativePath.substring(0, relativePath.lastIndexOf("/")) || "";
        folderPaths[index] = folderPath;
      }

      formData.append("files", file);
    });

    if (hasStructure) {
      formData.append("folderPaths", JSON.stringify(folderPaths));
    }

    try {
      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      addUsage(totalSize);

      await refreshStorage(accessToken);
      eventBus.emit(FILES_REFRESH_EVENT);

      return result;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
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

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

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
        onFileSelect={handleFileSelect}
        selectedFiles={selectedFiles}
        showOwner={false}
        showLocation={true}
        showFolderStructure={true}
        maxHeight={770}
        onFilesUpload={handleFilesUpload}
        checkStorageLimit={checkStorageLimit}
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
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin-top: 0px;
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
