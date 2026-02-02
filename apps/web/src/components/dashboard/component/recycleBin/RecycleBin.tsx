import React, { useEffect, useState } from "react";
import styled from "styled-components";

import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import SidebarToggle from "../sidebar/SidebarToggle";

import { useAuthStore } from "../../../../store/authStore";
import axios from "axios";
import toast from "react-hot-toast";

const RecycleBin: React.FC = () => {
  const token = useAuthStore((s) => s.accessToken);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const transformedFiles = files.map((f) => ({
    id: f.file_id,
    name: f.original_name,
    size: f.size,
    mimeType: f.mime_type,
    location: f.folder_path || "Root",
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
      console.log("Fetched recycle bin files:", res.data.files);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Failed to fetch recycle bin:", err);
      toast.error("Failed to load recycle bin");
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
        `/api/files/recycle-bin/restore/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("Restore response:", response.data);

      if (response.data.success) {
        toast.success("File restored successfully");
        await fetchRecycleBin();
      } else {
        toast.error(response.data.error || "Failed to restore file");
      }
    } catch (err: any) {
      console.error("Restore failed:", err);
      toast.error(err?.response?.data?.error || "Failed to restore file");
    }
  };

  const handlePermanentDelete = async (fileId: string) => {
    console.log("Permanently deleting file with ID:", fileId);
    try {
      const response = await axios.post(
        `/api/files/recycle-bin/delete/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("File permanently deleted");
        await fetchRecycleBin();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (err: any) {
      console.error("Permanent delete failed:", err);
      toast.error(err?.response?.data?.error || "Failed to delete file");
    }
  };

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

  return (
    <Container>
      <Header>
        <SidebarToggle />
        <Title>Recycle Bin</Title>
        {files.length > 0 && (
          <FileCount>
            {files.length} {files.length === 1 ? "file" : "files"}
          </FileCount>
        )}
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
        emptySubtext="Delete files to see them here"
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
