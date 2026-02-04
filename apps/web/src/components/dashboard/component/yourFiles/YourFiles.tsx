import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";
import { useStorageStore } from "../../../../store/storageStore";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import SidebarToggle from "../sidebar/SidebarToggle";
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
  is_folder?: boolean;
  type?: "file" | "folder";
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
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      addUsage(totalSize);

      await refreshStorage();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const filesData = await response.json();

      if (!filesData.success || !Array.isArray(filesData.files)) {
        console.warn("Unexpected response shape:", filesData);
        setFiles([]);
        return;
      }

      console.log(filesData.files);

      const transformedFiles: FileItem[] = filesData.files.map((file: any) => ({
        id: String(file.id),

        name: file.name || file.original_name || "Untitled",

        type: file.type || "file",

        mimeType: file.mimeType || file.mime_type || "application/octet-stream",

        lastInteraction: file.createdAt
          ? formatDate(file.createdAt)
          : "Unknown",

        lastInteractionType: "uploaded",

        location:
          file.folderPath && file.folderPath.trim() !== ""
            ? file.folderPath
            : "Your Files",

        owner: {
          name: "You",
          isYou: true,
        },

        size: Number(file.size) || 0,

        url: file.s3Key,
      }));

      console.log("Transformed files:", transformedFiles);
      setFiles(transformedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
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
        <SidebarToggle />
        <Title>Your Files</Title>
        {files.length > 0 && (
          <FileCount>
            {files.length} {files.length === 1 ? "item" : "items"}
          </FileCount>
        )}
      </Header>

      {hasActiveFilters && (
        <FilterIndicator>
          Showing {filteredFiles.length} of {files.length} items
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

      {previewFile && previewFile.type === "file" && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={handleClosePreview}
          allFiles={navigableFiles.filter((f) => f.type === "file")}
          currentIndex={navigableFiles
            .filter((f) => f.type === "file")
            .findIndex((f) => f.id === previewFile.id)}
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
  gap: 12px;
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
