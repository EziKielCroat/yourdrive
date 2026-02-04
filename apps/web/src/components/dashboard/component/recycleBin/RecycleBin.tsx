import React, { useEffect, useState } from "react";
import styled from "styled-components";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import SidebarToggle from "../sidebar/SidebarToggle";
import { useAuthStore } from "../../../../store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDate } from "../yourFiles/YourFiles";

const RecycleBin: React.FC = () => {
  const token = useAuthStore((s) => s.accessToken);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const transformedFiles = files.map((f) => ({
    id: f.id.toString(),
    name: f.name ?? f.original_name,
    type: "file",
    size: Number(f.size) || 0,
    mimeType: f.mimeType ?? f.mime_type,
    isFolder: false,
    location: f.location ?? f.folder_path ?? "Root",
    deletedAt: f.deletedAt ?? f.deleted_at,
    lastInteraction: f.created_at ? formatDate(f.created_at) : "Unknown",
    lastInteractionType: "deleted",
  }));

  const navigableFiles =
    selectedFiles.size > 0
      ? transformedFiles.filter((f) => selectedFiles.has(f.id))
      : transformedFiles;

  const fetchRecycleBin = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/files/recycle-bin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files || []);
    } catch (err: any) {
      console.error("Failed to fetch deleted files:", err);
      toast.error(err?.response?.data?.error || "Failed to load recycle bin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRecycleBin();
  }, [token]);

  const handlePreview = (file: any) => {
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

  const handleFileSelect = (file: any, selected: boolean) => {
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

  const handleRestore = async (fileId: string) => {
    try {
      const response = await axios.post(
        "/api/file-actions/restore",
        { fileIds: [fileId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("File restored successfully");
        setFiles((prev) => prev.filter((f) => f.file_id.toString() !== fileId));
        setSelectedFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      } else {
        toast.error(response.data.error || "Failed to restore file");
      }
    } catch (err: any) {
      console.error("Restore failed:", err);
      toast.error(err?.response?.data?.error || "Failed to restore file");
    }
  };

  const handlePermanentDelete = async (fileId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this file? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await axios.post(
        "/api/file-actions/delete-permanently",
        { fileIds: [fileId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("File permanently deleted");
        setFiles((prev) => prev.filter((f) => f.file_id.toString() !== fileId));
        setSelectedFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      } else {
        toast.error(response.data.error || "Failed to delete file");
      }
    } catch (err: any) {
      console.error("Permanent delete failed:", err);
      toast.error(err?.response?.data?.error || "Failed to delete file");
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedFiles.size === 0) return;

    try {
      const response = await axios.post(
        "/api/file-actions/restore",
        { fileIds: Array.from(selectedFiles) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success(`${selectedFiles.size} file(s) restored`);
        await fetchRecycleBin();
        setSelectedFiles(new Set());
      } else {
        toast.error(response.data.error || "Failed to restore files");
      }
    } catch (err: any) {
      console.error("Batch restore failed:", err);
      toast.error(err?.response?.data?.error || "Failed to restore files");
    }
  };

  const handlePermanentDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    const confirmMessage = `Are you sure you want to permanently delete ${selectedFiles.size} file(s)? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await axios.post(
        "/api/file-actions/delete-permanently",
        { fileIds: Array.from(selectedFiles) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success(`${selectedFiles.size} file(s) permanently deleted`);
        await fetchRecycleBin();
        setSelectedFiles(new Set());
      } else {
        toast.error(response.data.error || "Failed to delete files");
      }
    } catch (err: any) {
      console.error("Batch delete failed:", err);
      toast.error(err?.response?.data?.error || "Failed to delete files");
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (files.length === 0) {
      toast.error("Recycle bin is already empty");
      return;
    }

    const confirmMessage = `Are you sure you want to permanently delete all ${files.length} file(s) in the recycle bin? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const allFileIds = files.map((f) => f.id.toString());
      const response = await axios.post(
        "/api/file-actions/delete-permanently",
        { fileIds: allFileIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Recycle bin emptied successfully");
        setFiles([]);
        setSelectedFiles(new Set());
      } else {
        toast.error(response.data.error || "Failed to empty recycle bin");
      }
    } catch (err: any) {
      console.error("Empty recycle bin failed:", err);
      toast.error(err?.response?.data?.error || "Failed to empty recycle bin");
    }
  };

  const formatFileCount = () => {
    const total = files.length;
    const selected = selectedFiles.size;
    if (selected > 0) {
      return `${selected} of ${total} selected`;
    }
    return `${total} ${total === 1 ? "file" : "files"}`;
  };

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

  return (
    <Container>
      <Header>
        <SidebarToggle />
        <Title>Recycle Bin</Title>
        {files.length > 0 && <FileCount>{formatFileCount()}</FileCount>}
        <ActionButtons>
          {selectedFiles.size > 0 ? (
            <>
              <ActionButton onClick={handleRestoreSelected}>
                Restore Selected
              </ActionButton>
              <ActionButton
                onClick={handlePermanentDeleteSelected}
                variant="danger"
              >
                Delete Selected
              </ActionButton>
            </>
          ) : (
            transformedFiles.length > 0 && (
              <ActionButton onClick={handleEmptyRecycleBin} variant="danger">
                Empty Recycle Bin
              </ActionButton>
            )
          )}
        </ActionButtons>
      </Header>

      <EnhancedFilesTable
        files={transformedFiles}
        loading={loading}
        showOwner={false}
        showLocation={true}
        isRecycleBin={true}
        onRestoreFile={handleRestore}
        onDeletePermanently={handlePermanentDelete}
        onFilePreview={handlePreview}
        onFileSelect={handleFileSelect}
        selectedFiles={selectedFiles}
        emptyMessage="Recycle Bin is empty"
        emptySubtext="Deleted files will appear here"
        maxHeight={770}
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

export default RecycleBin;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: #202124;
  margin: 0;
  margin-right: 16px;
`;

const FileCount = styled.div`
  font-size: 14px;
  color: #5f6368;
  background: #f1f3f4;
  padding: 4px 12px;
  border-radius: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-left: auto;
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    margin-top: 12px;
  }
`;

const ActionButton = styled.button<{ variant?: "default" | "danger" }>`
  padding: 8px 16px;
  background: ${(props) =>
    props.variant === "danger" ? "#dc3545" : "#0d6efd"};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#c82333" : "#0b5ed7"};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;
