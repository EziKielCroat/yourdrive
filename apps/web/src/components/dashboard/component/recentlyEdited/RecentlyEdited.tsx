import React, { useEffect, useState } from "react";
import styled from "styled-components";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import { Clock } from "lucide-react";
import SidebarToggle from "../sidebar/SidebarToggle";
import PageTransition from "../../../shared/PageTransition";
import api from "../../../../lib/axios";
import { useEvent } from "../../../../events/useEvent";
import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";

const RecentlyEdited: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState<7 | 30 | 90>(30);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const transformedFiles = files.map((f) => ({
    id: f.id,
    name: f.original_name,
    size: f.size,
    mimeType: f.mime_type,
    location: f.folder_path || "Root",
    modifiedTime: formatRelativeTime(f.last_edited_at),
    editCount: f.edit_count,
    createdAt: f.created_at,
    updatedAt: f.updated_at ?? f.last_edited_at,
  }));

  const navigableFiles =
    selectedFiles.size > 0
      ? transformedFiles.filter((f) => selectedFiles.has(f.id))
      : transformedFiles;

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/files/recent?days=${timeFilter}&limit=100`);
      const data = res.data;
      if (data.success && data.files) {
        setFiles(data.files);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Failed to fetch recent files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, [timeFilter]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchRecentFiles();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [timeFilter]);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchRecentFiles();
  });

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

  return (
    <PageTransition>
      <Container>
        <Header>
          <SidebarToggle />
          <TitleSection>
            <Title>Recently Edited</Title>
          </TitleSection>

          {!loading && files.length > 0 ? (
            <Controls>
              <FilterButtons>
                <FilterButton
                  $active={timeFilter === 7}
                  onClick={() => setTimeFilter(7)}
                >
                  Last 7 days
                </FilterButton>
                <FilterButton
                  $active={timeFilter === 30}
                  onClick={() => setTimeFilter(30)}
                >
                  Last 30 days
                </FilterButton>
                <FilterButton
                  $active={timeFilter === 90}
                  onClick={() => setTimeFilter(90)}
                >
                  Last 90 days
                </FilterButton>
              </FilterButtons>

              {files.length > 0 && (
                <FileCount>
                  {files.length} {files.length === 1 ? "file" : "files"}
                </FileCount>
              )}
            </Controls>
          ) : (
            <></>
          )}
        </Header>

        {!loading && files.length === 0 ? (
          <EmptyState>
            <Clock size={48} />
            <EmptyTitle>No recent activity</EmptyTitle>
            <EmptyText>
              Files you edit will appear here. Try editing a document to see it
              in this list.
            </EmptyText>
          </EmptyState>
        ) : (
          <EnhancedFilesTable
            files={transformedFiles}
            loading={loading}
            showOwner={false}
            showLocation={true}
            onFilePreview={handlePreview}
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            emptyMessage="No recent activity"
            emptySubtext="Files you edit will appear here"
            maxHeight={770}
          />
        )}

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
    </PageTransition>
  );
};

export default RecentlyEdited;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #202124;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  background: #f1f3f4;
  padding: 4px;
  border-radius: 8px;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background: ${(props) => (props.$active ? "#fff" : "transparent")};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "500" : "400")};
  color: ${(props) => (props.$active ? "#1a73e8" : "#5f6368")};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: "Inter", sans-serif;
  box-shadow: ${(props) =>
    props.$active ? "0 1px 2px rgba(0,0,0,0.1)" : "none"};

  &:hover {
    background: ${(props) =>
      props.$active ? "#fff" : "rgba(255,255,255,0.5)"};
  }
`;

const FileCount = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: #5f6368;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: #202124;
  margin: 16px 0 8px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #5f6368;
  max-width: 400px;
  margin: 0;
`;
