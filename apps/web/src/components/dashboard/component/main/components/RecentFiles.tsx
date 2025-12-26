import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../../store/authStore";
import FilesTable, {
  type FileItem,
} from "../../../../shared/files_table/FilesTable";

interface ApiFile {
  id: string;
  original_name: string;
  s3_key: string;
  folder_path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

const RecentFiles: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/files?limit=10&sort=recent", {
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
            })
          );
          setFiles(transformedFiles);
        }
      } catch (err) {
        console.error("Error fetching recent files:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchRecentFiles();
    }
  }, [accessToken, user]);

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

  const handleFileClick = (file: FileItem) => {
    console.log("Open file:", file.name);
    // TODO: Implement file preview/download
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
      event.clientY
    );
    // TODO: Implement context menu
  };

  return (
    <Container>
      <FilesTable
        files={files}
        loading={loading}
        emptyMessage="No recent files"
        emptySubtext="Files you upload or interact with will appear here"
        onFileClick={handleFileClick}
        onFileSelect={handleFileSelect}
        onFileContextMenu={handleFileContextMenu}
        selectedFiles={selectedFiles}
        showOwner={true}
        showLocation={true}
      />
    </Container>
  );
};

const Container = styled.div`
  margin-top: 24px;
`;

export default RecentFiles;
