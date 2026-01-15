import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import FilesTable, { type FileItem } from "../files_table/FilesTable";
import {
  Download,
  Share2,
  Trash2,
  Star,
  Link2,
  Edit3,
  Info,
  MoreVertical,
  X,
} from "lucide-react";

interface EnhancedFilesTableProps {
  files: FileItem[];
  loading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  onFilePreview?: (file: FileItem) => void;
  showOwner?: boolean;
  showLocation?: boolean;
}

const EnhancedFilesTable: React.FC<EnhancedFilesTableProps> = ({
  files,
  loading,
  emptyMessage,
  emptySubtext,
  onFilePreview,
  showOwner,
  showLocation,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [quickActionsFile, setQuickActionsFile] = useState<string | null>(null);

  const handleFileClick = (file: FileItem) => {
    // Single click - toggle selection
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(file.id)) {
        newSet.delete(file.id);
      } else {
        newSet.add(file.id);
      }
      return newSet;
    });
  };

  const handleFileDoubleClick = (file: FileItem) => {
    // Double click - open preview
    if (onFilePreview) {
      onFilePreview(file);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleSelectAll = () => {
    setSelectedFiles(new Set(files.map((f) => f.id)));
  };

  const handleDownload = () => {
    console.log("Download files:", Array.from(selectedFiles));
  };

  const handleShare = () => {
    console.log("Share files:", Array.from(selectedFiles));
  };

  const handleDelete = () => {
    console.log("Delete files:", Array.from(selectedFiles));
  };

  const handleRename = () => {
    console.log("Rename file:", Array.from(selectedFiles)[0]);
  };

  const handleGetLink = () => {
    console.log("Get link for files:", Array.from(selectedFiles));
  };

  const handleStar = () => {
    console.log("Star files:", Array.from(selectedFiles));
  };

  const handleViewDetails = () => {
    console.log("View details for:", Array.from(selectedFiles)[0]);
  };

  const handleQuickAction = (fileId: string, action: string) => {
    console.log(`Quick action: ${action} on file ${fileId}`);
    setQuickActionsFile(null);
  };

  return (
    <Container>
      {selectedFiles.size > 0 && (
        <SelectionBar>
          <LeftSection>
            <SelectionCount>{selectedFiles.size} selected</SelectionCount>
            <ClearButton onClick={handleClearSelection}>
              <X size={16} />
            </ClearButton>
          </LeftSection>

          <CenterSection>
            <IconButton onClick={handleShare} title="Share">
              <Share2 size={18} />
            </IconButton>

            <IconButton onClick={handleDownload} title="Download">
              <Download size={18} />
            </IconButton>

            {selectedFiles.size === 1 && (
              <IconButton onClick={handleRename} title="Rename">
                <Edit3 size={18} />
              </IconButton>
            )}

            <IconButton onClick={handleGetLink} title="Get link">
              <Link2 size={18} />
            </IconButton>

            {selectedFiles.size === 1 && (
              <IconButton onClick={handleViewDetails} title="View details">
                <Info size={18} />
              </IconButton>
            )}

            <IconButton onClick={handleStar} title="Star">
              <Star size={18} />
            </IconButton>

            <VerticalDivider />

            <IconButton onClick={handleDelete} $danger title="Delete">
              <Trash2 size={18} />
            </IconButton>
          </CenterSection>

          <RightSection>
            <TextButton onClick={handleSelectAll}>Select all</TextButton>
          </RightSection>
        </SelectionBar>
      )}

      <TableWrapper>
        <FilesTable
          files={files}
          loading={loading}
          emptyMessage={emptyMessage}
          emptySubtext={emptySubtext}
          onFileClick={handleFileClick}
          onFileDoubleClick={handleFileDoubleClick}
          selectedFiles={selectedFiles}
          showOwner={showOwner}
          showLocation={showLocation}
          renderRowActions={(file) => (
            <QuickActionsWrapper
              onMouseEnter={() => setHoveredFileId(file.id)}
              onMouseLeave={() => {
                if (quickActionsFile !== file.id) {
                  setHoveredFileId(null);
                }
              }}
            >
              {(hoveredFileId === file.id || quickActionsFile === file.id) && (
                <>
                  <QuickActionsButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickActionsFile(
                        quickActionsFile === file.id ? null : file.id
                      );
                    }}
                    $active={quickActionsFile === file.id}
                  >
                    <MoreVertical size={16} />
                  </QuickActionsButton>

                  {quickActionsFile === file.id && (
                    <QuickActionsMenu
                      onClick={(e) => e.stopPropagation()}
                      onMouseLeave={() => {
                        setQuickActionsFile(null);
                        setHoveredFileId(null);
                      }}
                    >
                      <QuickAction
                        onClick={() => {
                          if (onFilePreview) {
                            onFilePreview(file);
                          }
                          setQuickActionsFile(null);
                        }}
                      >
                        <Info size={16} />
                        Preview
                      </QuickAction>
                      <QuickActionDivider />
                      <QuickAction
                        onClick={() => handleQuickAction(file.id, "share")}
                      >
                        <Share2 size={16} />
                        Share
                      </QuickAction>
                      <QuickAction
                        onClick={() => handleQuickAction(file.id, "download")}
                      >
                        <Download size={16} />
                        Download
                      </QuickAction>
                      <QuickAction
                        onClick={() => handleQuickAction(file.id, "rename")}
                      >
                        <Edit3 size={16} />
                        Rename
                      </QuickAction>
                      <QuickAction
                        onClick={() => handleQuickAction(file.id, "link")}
                      >
                        <Link2 size={16} />
                        Get link
                      </QuickAction>
                      <QuickAction
                        onClick={() => handleQuickAction(file.id, "star")}
                      >
                        <Star size={16} />
                        Add to starred
                      </QuickAction>
                      <QuickActionDivider />
                      <QuickAction
                        $danger
                        onClick={() => handleQuickAction(file.id, "delete")}
                      >
                        <Trash2 size={16} />
                        Delete
                      </QuickAction>
                    </QuickActionsMenu>
                  )}
                </>
              )}
            </QuickActionsWrapper>
          )}
        />
      </TableWrapper>
    </Container>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SelectionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 140px;
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
`;

const RightSection = styled.div`
  min-width: 140px;
  display: flex;
  justify-content: flex-end;
`;

const SelectionCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;

const IconButton = styled.button<{ $danger?: boolean; $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: ${(props) => (props.$active ? "#f1f3f4" : "transparent")};
  border: none;
  border-radius: 50%;
  color: ${(props) => (props.$danger ? "#d93025" : "#5f6368")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#fce8e6" : "#f1f3f4")};
    color: ${(props) => (props.$danger ? "#d93025" : "#202124")};
  }

  &:hover::before {
    content: attr(title);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    background: #202124;
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    animation: ${fadeIn} 0.2s ease forwards 0.5s;
    z-index: 1001;
  }

  &:hover::after {
    content: "";
    position: absolute;
    bottom: calc(100% + 2px);
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #202124;
    pointer-events: none;
    opacity: 0;
    animation: ${fadeIn} 0.2s ease forwards 0.5s;
    z-index: 1001;
  }

  svg {
    flex-shrink: 0;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 24px;
  background: #dadce0;
  margin: 0 8px;
`;

const TextButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #1a73e8;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e8f0fe;
  }
`;

const TableWrapper = styled.div`
  position: relative;
`;

const QuickActionsWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const QuickActionsButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${(props) => (props.$active ? "#f1f3f4" : "transparent")};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease;
  color: #5f6368;

  &:hover {
    background: #f1f3f4;
  }
`;

const QuickActionsMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(60, 64, 67, 0.15),
    0 6px 20px 4px rgba(60, 64, 67, 0.1);
  padding: 8px 0;
  z-index: 1000;
`;

const QuickAction = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: ${(props) => (props.$danger ? "#d93025" : "#202124")};
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;

  &:hover {
    background: ${(props) => (props.$danger ? "#fce8e6" : "#f1f3f4")};
  }

  svg {
    flex-shrink: 0;
    color: ${(props) => (props.$danger ? "#d93025" : "#5f6368")};
  }
`;

const QuickActionDivider = styled.div`
  height: 1px;
  background: #e8eaed;
  margin: 8px 0;
`;

export default EnhancedFilesTable;
