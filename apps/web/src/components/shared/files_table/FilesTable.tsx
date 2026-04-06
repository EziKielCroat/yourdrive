import React, { useState, useRef, useMemo } from "react";
import styled from "styled-components";
import { useUserUiPreferencesStore } from "../../../store/userUiPreferencesStore";
import FileTypeIcon from "./FileTypeIcon";
import FolderSmallIcon from "../icons/smallFolder";
import { Upload, ChevronRight, ChevronDown, Folder } from "lucide-react";

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  mimeType?: string;
  lastInteraction: string;
  lastInteractionType:
    | "uploaded"
    | "edited"
    | "viewed"
    | "shared"
    | "deleted"
    | "favorited";
  location: string;
  owner: {
    name: string;
    avatar?: string;
    isYou?: boolean;
  };
  size?: number;
  selected?: boolean;
  starred?: boolean;
  trashed?: boolean;
  url: string;
}

interface FolderNode {
  name: string;
  path: string;
  files: FileItem[];
  folders: FileItem[];
  subfolders: Map<string, FolderNode>;
  isExpanded: boolean;
}

interface FilesTableProps {
  files: FileItem[];
  loading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  onFileClick?: (file: FileItem) => void;
  onFileDoubleClick?: (file: FileItem) => void;
  onFilePreview?: (file: FileItem) => void;
  onFileSelect?: (file: FileItem, selected: boolean) => void;
  onFileContextMenu?: (file: FileItem, event: React.MouseEvent) => void;
  selectedFiles?: Set<string>;
  showOwner?: boolean;
  showLocation?: boolean;
  renderRowActions?: (file: FileItem) => React.ReactNode;
  singleClickMode?: "preview" | "select";
  maxHeight?: number;
  onFilesUpload?: (files: FileList) => Promise<void>;
  checkStorageLimit?: (totalSize: number) => boolean;
  showFolderStructure?: boolean;
}

const FilesTable: React.FC<FilesTableProps> = ({
  files,
  loading = false,
  emptyMessage = "No files yet",
  emptySubtext = "Upload files to get started",
  onFileClick,
  onFileDoubleClick,
  onFilePreview,
  onFileSelect: _onFileSelect,
  onFileContextMenu,
  selectedFiles = new Set(),
  showOwner = true,
  showLocation = true,
  renderRowActions,
  singleClickMode = "select",
  maxHeight = 650,
  onFilesUpload,
  checkStorageLimit,
  showFolderStructure = false,
}) => {
  const fileView = useUserUiPreferencesStore((s) => s.appearance?.fileView);
  const tableDensityStyle = useMemo(
    () =>
      ({
        ["--file-cell-pad" as string]:
          fileView === "compact" ? "6px 10px" : "10px 16px",
        ["--file-header-pad" as string]:
          fileView === "compact" ? "8px 12px" : "12px 16px",
      }) as React.CSSProperties,
    [fileView],
  );

  const [isDragging, setIsDragging] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const dragCounter = useRef(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Separate folders and files
  const { folders, regularFiles } = useMemo(() => {
    const folders = files.filter((f) => f.type === "folder");
    const regularFiles = files.filter((f) => f.type === "file");
    return { folders, regularFiles };
  }, [files]);

  const folderStructure = useMemo(() => {
    if (!showFolderStructure) return null;

    const root: FolderNode = {
      name: "root",
      path: "",
      files: [],
      folders: [],
      subfolders: new Map(),
      isExpanded: true,
    };

    // Add all folders to structure
    folders.forEach((folder) => {
      const path = folder.location || folder.name;
      const parts = path.split("/").filter(Boolean);
      let current = root;

      parts.forEach((part, index) => {
        if (!current.subfolders.has(part)) {
          current.subfolders.set(part, {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            files: [],
            folders: [],
            subfolders: new Map(),
            isExpanded: expandedFolders.has(
              parts.slice(0, index + 1).join("/"),
            ),
          });
        }
        current = current.subfolders.get(part)!;
      });
    });

    // Add files to their respective folders
    regularFiles.forEach((file) => {
      const path = file.location || "";

      if (!path || path === "Your Files") {
        root.files.push(file);
        return;
      }

      const parts = path.split("/").filter(Boolean);
      let current = root;

      parts.forEach((part, index) => {
        if (!current.subfolders.has(part)) {
          current.subfolders.set(part, {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            files: [],
            folders: [],
            subfolders: new Map(),
            isExpanded: expandedFolders.has(
              parts.slice(0, index + 1).join("/"),
            ),
          });
        }
        current = current.subfolders.get(part)!;

        if (index === parts.length - 1) {
          current.files.push(file);
        }
      });
    });

    return root;
  }, [regularFiles, folders, showFolderStructure, expandedFolders]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const formatInteraction = (file: FileItem): string => {
    if (file.type === "folder") {
      return `Created · ${file.lastInteraction}`;
    }
    const actionMap = {
      uploaded: "You uploaded",
      edited: "You edited",
      viewed: "You opened",
      shared: "Shared with you",
      deleted: "You deleted",
      favorited: "You favorited",
    };
    return `${actionMap[file.lastInteractionType]} · ${file.lastInteraction}`;
  };

  const handleRowClick = (file: FileItem) => {
    if (file.type === "folder") {
      toggleFolder(file.location || file.name);
      return;
    }

    if (singleClickMode === "preview") {
      onFilePreview?.(file);
    } else {
      onFileClick?.(file);
    }
  };

  const handleRowDoubleClick = (file: FileItem) => {
    if (file.type === "folder") {
      return;
    }

    if (singleClickMode === "select") {
      onFilePreview?.(file);
    }
    onFileDoubleClick?.(file);
  };

  const handleContextMenu = (file: FileItem, e: React.MouseEvent) => {
    e.preventDefault();
    onFileContextMenu?.(file, e);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (!onFilesUpload) return;

    const items = Array.from(e.dataTransfer.items);
    const droppedFiles: File[] = [];

    for (const item of items) {
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          await processEntry(entry, droppedFiles);
        } else {
          const file = item.getAsFile();
          if (file) droppedFiles.push(file);
        }
      }
    }

    if (droppedFiles.length === 0) return;

    if (checkStorageLimit) {
      const totalSize = droppedFiles.reduce((sum, file) => sum + file.size, 0);
      if (!checkStorageLimit(totalSize)) return;
    }

    const fileList = createFileList(droppedFiles);
    try {
      await onFilesUpload(fileList);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const processEntry = async (
    entry: any,
    droppedFiles: File[],
    path: string = "",
  ): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => {
        entry.file((f: File) => {
          Object.defineProperty(f, "webkitRelativePath", {
            value: path + f.name,
            writable: false,
          });
          resolve(f);
        });
      });
      droppedFiles.push(file);
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise<any[]>((resolve) => {
        dirReader.readEntries((e: any[]) => resolve(e));
      });
      for (const childEntry of entries) {
        await processEntry(childEntry, droppedFiles, `${path}${entry.name}/`);
      }
    }
  };

  const createFileList = (droppedFiles: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    droppedFiles.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const countTotalItems = (node: FolderNode): number => {
    let count = node.files.length;
    Array.from(node.subfolders.values()).forEach((subfolder) => {
      count += countTotalItems(subfolder);
    });
    return count;
  };

  const renderFolderNode = (
    node: FolderNode,
    level: number = 0,
  ): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Render subfolders first
    Array.from(node.subfolders.values()).forEach((subfolder) => {
      const isExpanded = expandedFolders.has(subfolder.path);
      const itemCount = countTotalItems(subfolder);

      // Folder row
      elements.push(
        <FolderRow
          key={`folder-${subfolder.path}`}
          onClick={() => toggleFolder(subfolder.path)}
          $level={level}
        >
          <TableCell>
            <NameCell>
              <FolderIndent $level={level} />
              <FolderToggle>
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </FolderToggle>
              <FileIconWrapper $compact>
                <Folder size={18} color="#5f6368" />
              </FileIconWrapper>
              <FileName $folder>{subfolder.name}</FileName>
              <ItemCount>{itemCount} items</ItemCount>
            </NameCell>
          </TableCell>
          <TableCell>
            <InteractionText />
          </TableCell>
          {showLocation && <TableCell></TableCell>}
          {showOwner && <TableCell></TableCell>}
          {renderRowActions && (
            <TableCell style={{ width: "60px" }}></TableCell>
          )}
        </FolderRow>,
      );

      // Render folder contents if expanded
      if (isExpanded) {
        elements.push(...renderFolderNode(subfolder, level + 1));
      }
    });

    // Render files in this folder
    node.files.forEach((file) => {
      elements.push(
        <TableRow
          key={file.id}
          onClick={() => handleRowClick(file)}
          onDoubleClick={() => handleRowDoubleClick(file)}
          onContextMenu={(e) => handleContextMenu(file, e)}
          $selected={selectedFiles.has(file.id)}
          $level={level}
          tabIndex={0}
        >
          <TableCell>
            <NameCell>
              <FolderIndent $level={level} />
              <FileIconWrapper $compact>
                <FileTypeIcon fileName={file.name} size={18} />
              </FileIconWrapper>
              <FileName title={file.name}>{file.name}</FileName>
            </NameCell>
          </TableCell>
          <TableCell>
            <InteractionText>{formatInteraction(file)}</InteractionText>
          </TableCell>
          {showLocation && (
            <TableCell>
              <LocationCell>
                <FolderSmallIcon color="#5f6368" size={14} />
                <LocationText>{file.location}</LocationText>
              </LocationCell>
            </TableCell>
          )}
          {showOwner && (
            <TableCell>
              <OwnerCell>
                {file.owner.avatar ? (
                  <OwnerAvatar src={file.owner.avatar} alt={file.owner.name} />
                ) : (
                  <OwnerAvatarPlaceholder>
                    {file.owner.name.charAt(0).toUpperCase()}
                  </OwnerAvatarPlaceholder>
                )}
                {file.owner.isYou && <OwnerName>me</OwnerName>}
              </OwnerCell>
            </TableCell>
          )}
          {renderRowActions && (
            <TableCell
              style={{ width: "60px", padding: "8px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {renderRowActions(file)}
            </TableCell>
          )}
        </TableRow>,
      );
    });

    return elements;
  };

  if (loading) {
    return (
      <TableContainer style={tableDensityStyle}>
        <LoadingState>
          <LoadingSpinner />
          <span>Loading files...</span>
        </LoadingState>
      </TableContainer>
    );
  }

  if (files.length === 0) {
    return (
      <TableContainer
        style={tableDensityStyle}
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <EmptyState $isDragging={isDragging}>
          {isDragging ? (
            <DragOverlayContent>
              <UploadIconWrapper>
                <Upload size={48} />
              </UploadIconWrapper>
              <EmptyText>Drop files or folders here</EmptyText>
              <EmptySubtext>Release to upload</EmptySubtext>
            </DragOverlayContent>
          ) : (
            <>
              <EmptyText>{emptyMessage}</EmptyText>
              <EmptySubtext>{emptySubtext}</EmptySubtext>
              {onFilesUpload && (
                <DragHint>or drag and drop files here</DragHint>
              )}
            </>
          )}
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      style={tableDensityStyle}
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <DragOverlay>
          <DragOverlayContent>
            <UploadIconWrapper>
              <Upload size={48} />
            </UploadIconWrapper>
            <DragText>Drop files or folders to upload</DragText>
            <DragSubtext>All files will be uploaded to Your Files</DragSubtext>
          </DragOverlayContent>
        </DragOverlay>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Last Interaction</TableHeader>
            {showLocation && <TableHeader>Location</TableHeader>}
            {showOwner && <TableHeader>Owner</TableHeader>}
            {renderRowActions && (
              <TableHeader style={{ width: "60px" }}></TableHeader>
            )}
          </TableRow>
        </TableHead>
      </Table>

      <ScrollContainer $maxHeight={maxHeight}>
        <ScrollableArea>
          <Table>
            <TableBody>
              {showFolderStructure && folderStructure ? (
                renderFolderNode(folderStructure)
              ) : (
                <>
                  {/* Render folders first */}
                  {folders.map((folder) => (
                    <TableRow
                      key={folder.id}
                      onClick={() => handleRowClick(folder)}
                      onContextMenu={(e) => handleContextMenu(folder, e)}
                      $selected={selectedFiles.has(folder.id)}
                      tabIndex={0}
                    >
                      <TableCell>
                        <NameCell>
                          <FileIconWrapper>
                            <Folder size={20} color="#5f6368" />
                          </FileIconWrapper>
                          <FileName title={folder.name}>{folder.name}</FileName>
                        </NameCell>
                      </TableCell>
                      <TableCell>
                        <InteractionText>
                          {formatInteraction(folder)}
                        </InteractionText>
                      </TableCell>
                      {showLocation && (
                        <TableCell>
                          <LocationCell>
                            <FolderSmallIcon color="#5f6368" size={16} />
                            <LocationText>{folder.location}</LocationText>
                          </LocationCell>
                        </TableCell>
                      )}
                      {showOwner && (
                        <TableCell>
                          <OwnerCell>
                            {folder.owner.avatar ? (
                              <OwnerAvatar
                                src={folder.owner.avatar}
                                alt={folder.owner.name}
                              />
                            ) : (
                              <OwnerAvatarPlaceholder>
                                {folder.owner.name.charAt(0).toUpperCase()}
                              </OwnerAvatarPlaceholder>
                            )}
                            {folder.owner.isYou && <OwnerName>me</OwnerName>}
                          </OwnerCell>
                        </TableCell>
                      )}
                      {renderRowActions && (
                        <TableCell
                          style={{ width: "60px", padding: "8px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderRowActions(folder)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

                  {/* Then render files */}
                  {regularFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      onClick={() => handleRowClick(file)}
                      onDoubleClick={() => handleRowDoubleClick(file)}
                      onContextMenu={(e) => handleContextMenu(file, e)}
                      $selected={selectedFiles.has(file.id)}
                      tabIndex={0}
                    >
                      <TableCell>
                        <NameCell>
                          <FileIconWrapper>
                            <FileTypeIcon fileName={file.name} size={20} />
                          </FileIconWrapper>
                          <FileName title={file.name}>{file.name}</FileName>
                        </NameCell>
                      </TableCell>
                      <TableCell>
                        <InteractionText>
                          {formatInteraction(file)}
                        </InteractionText>
                      </TableCell>
                      {showLocation && (
                        <TableCell>
                          <LocationCell>
                            <FolderSmallIcon color="#5f6368" size={16} />
                            <LocationText>{file.location}</LocationText>
                          </LocationCell>
                        </TableCell>
                      )}
                      {showOwner && (
                        <TableCell>
                          <OwnerCell>
                            {file.owner.avatar ? (
                              <OwnerAvatar
                                src={file.owner.avatar}
                                alt={file.owner.name}
                              />
                            ) : (
                              <OwnerAvatarPlaceholder>
                                {file.owner.name.charAt(0).toUpperCase()}
                              </OwnerAvatarPlaceholder>
                            )}
                            {file.owner.isYou && <OwnerName>me</OwnerName>}
                          </OwnerCell>
                        </TableCell>
                      )}
                      {renderRowActions && (
                        <TableCell
                          style={{ width: "60px", padding: "8px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderRowActions(file)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </ScrollableArea>
        <BottomFade />
      </ScrollContainer>
    </TableContainer>
  );
};

// Styled components remain the same as before...
const TableContainer = styled.div`
  position: relative;
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
`;

const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 115, 232, 0.08);
  border: 2px dashed #1a73e8;
  border-radius: 8px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  backdrop-filter: blur(2px);
`;

const DragOverlayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const UploadIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a73e8;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2);
`;

const DragText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1a73e8;
`;

const DragSubtext = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

const ScrollContainer = styled.div<{ $maxHeight: number }>`
  position: relative;
  height: ${({ $maxHeight }) => $maxHeight}px;
  overflow: hidden;
`;

const ScrollableArea = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #bdc1c6;
  }
`;

const BottomFade = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 250, 0) 0%,
    rgba(248, 249, 250, 0.5) 30%,
    rgba(248, 249, 250, 0.8) 60%,
    rgba(248, 249, 250, 1) 100%
  );
  z-index: 10;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  @media (max-width: 768px) {
    table-layout: auto;
    font-size: 12px;
  }
`;

const TableHead = styled.thead`
  @media (max-width: 768px) {
    display: table-header-group;
  }
`;
const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $selected?: boolean; $level?: number }>`
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? "#e8f0fe" : "transparent")};
  transition: background-color 0.15s;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "#e8f0fe" : "rgba(201, 201, 201, 0.1)"};
  }

  &:focus {
    outline: none;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    display: table-row;
    padding: 0;
  }
`;

const FolderRow = styled(TableRow)<{ $level: number }>`
  font-weight: 500;
  height: 36px;

  &:hover {
    background: rgba(201, 201, 201, 0.15);
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: var(--file-header-pad, 12px 16px);
  font-size: 12px;
  font-weight: 500;
  color: #5f6368;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  background: #f8f9fa;
`;

const TableCell = styled.td`
  padding: var(--file-cell-pad, 10px 16px);
  font-size: 14px;
  color: #202124;
  vertical-align: middle;

  @media (max-width: 768px) {
    display: table-cell;
    padding: 8px 6px;
    font-size: 12px;
  }
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const FolderIndent = styled.div<{ $level: number }>`
  width: ${({ $level }) => $level * 16}px;
  flex-shrink: 0;
`;

const FolderToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #5f6368;
  margin-right: 2px;
`;

const FileIconWrapper = styled.div<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? "24px" : "32px")};
  height: ${({ $compact }) => ($compact ? "24px" : "32px")};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FileName = styled.span<{ $folder?: boolean }>`
  font-weight: ${({ $folder }) => ($folder ? "500" : "400")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${({ $folder }) => ($folder ? "13px" : "14px")};
`;

const ItemCount = styled.span`
  font-size: 12px;
  color: #80868b;
  font-weight: 400;
  margin-left: 6px;
  white-space: nowrap;
`;

const InteractionText = styled.span`
  color: #5f6368;
  font-size: 13px;
`;

const LocationCell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LocationText = styled.span`
  color: #5f6368;
  font-size: 13px;
`;

const OwnerCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OwnerAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const OwnerAvatarPlaceholder = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1a73e8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
`;

const OwnerName = styled.span`
  color: #5f6368;
  font-size: 13px;
`;

const LoadingState = styled.div`
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #5f6368;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div<{ $isDragging?: boolean }>`
  padding: 48px;
  text-align: center;
  transition: all 0.2s ease;
  border: 2px dashed
    ${({ $isDragging }) => ($isDragging ? "#1a73e8" : "transparent")};
  border-radius: 8px;
  background: ${({ $isDragging }) =>
    $isDragging ? "rgba(26, 115, 232, 0.04)" : "transparent"};
`;

const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
`;

const EmptySubtext = styled.div`
  margin-top: 4px;
  font-size: 13px;
  color: #80868b;
`;

const DragHint = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #1a73e8;
  font-weight: 500;
`;

export default FilesTable;
