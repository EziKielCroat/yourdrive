import React from "react";
import styled from "styled-components";
import FileIcon from "../icons/file";
import FolderSmallIcon from "../icons/smallFolder";

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  mimeType?: string;
  lastInteraction: string;
  lastInteractionType: "uploaded" | "edited" | "viewed" | "shared";
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
}

interface FilesTableProps {
  files: FileItem[];
  loading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  onFileClick?: (file: FileItem) => void;
  onFileSelect?: (file: FileItem, selected: boolean) => void;
  onFileContextMenu?: (file: FileItem, event: React.MouseEvent) => void;
  selectedFiles?: Set<string>;
  showOwner?: boolean;
  showLocation?: boolean;
  fileInteraction?: boolean;
}

const FilesTable: React.FC<FilesTableProps> = ({
  files,
  loading = false,
  emptyMessage = "No files yet",
  emptySubtext = "Upload files to get started",
  onFileClick,
  onFileSelect,
  onFileContextMenu,
  selectedFiles = new Set(),
  showOwner = true,
  showLocation = true,
  fileInteraction = false,
}) => {
  const formatInteraction = (file: FileItem): string => {
    const actionMap = {
      uploaded: "You uploaded",
      edited: "You edited",
      viewed: "You opened",
      shared: "Shared with you",
    };
    return `${actionMap[file.lastInteractionType]} · ${file.lastInteraction}`;
  };

  const handleRowClick = (file: FileItem) => {
    onFileClick?.(file);
  };

  const handleCheckboxChange = (
    file: FileItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    onFileSelect?.(file, e.target.checked);
  };

  const handleContextMenu = (file: FileItem, e: React.MouseEvent) => {
    e.preventDefault();
    onFileContextMenu?.(file, e);
  };

  if (loading) {
    return (
      <TableContainer>
        <LoadingState>
          <LoadingSpinner />
          <span>Loading files...</span>
        </LoadingState>
      </TableContainer>
    );
  }

  if (files.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <EmptyText>{emptyMessage}</EmptyText>
          <EmptySubtext>{emptySubtext}</EmptySubtext>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {fileInteraction && (
              <TableHeader style={{ width: "40px" }}></TableHeader>
            )}
            <TableHeader>Name</TableHeader>
            <TableHeader>Last Interaction</TableHeader>
            {showLocation && <TableHeader>Location</TableHeader>}
            {showOwner && <TableHeader>Owner</TableHeader>}
          </TableRow>
        </TableHead>
      </Table>
      <ScrollableArea>
        <Table>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                onClick={() => handleRowClick(file)}
                onContextMenu={(e) => handleContextMenu(file, e)}
                $selected={selectedFiles.has(file.id)}
              >
                {fileInteraction && (
                  <TableCell style={{ width: "40px" }}>
                    <Checkbox
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={(e) => handleCheckboxChange(file, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <NameCell>
                    <FileIconWrapper>
                      {file.type === "folder" ? (
                        <FolderSmallIcon color="#5f6368" />
                      ) : (
                        <FileIcon />
                      )}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableArea>
    </TableContainer>
  );
};

const ScrollableArea = styled.div`
  max-height: 750px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #c2c2c2;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const TableHead = styled.thead``;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $selected?: boolean }>`
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? "#e8f0fe" : "transparent")};
  transition: background-color 0.15s;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "#e8f0fe" : "rgba(201, 201, 201, 0.1)"};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #5f6368;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  background: #f8f9fa;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #202124;
  vertical-align: middle;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1a73e8;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const FileIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const FileName = styled.span`
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #5f6368;
  font-size: 14px;
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

const EmptyState = styled.div`
  padding: 48px;
  text-align: center;
`;

const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
`;

const EmptySubtext = styled.div`
  font-size: 13px;
  color: #80868b;
  margin-top: 4px;
`;

export default FilesTable;
