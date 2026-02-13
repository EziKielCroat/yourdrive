import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { X, Folder, ChevronRight, Home, Search, Check } from "lucide-react";
import type { EnhancedFileItem } from "../types/fileActions";
import api from "../../../../lib/axios";

export interface MoveFolderOption {
  id: string;
  name: string;
  path: string;
}

interface MoveModalProps {
  isOpen: boolean;
  files: EnhancedFileItem[];
  onClose: () => void;
  onMove: (fileIds: string[], targetFolderPath: string) => Promise<void>;
  folders?: MoveFolderOption[];
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e8eaed;
`;

const ModalTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #202124;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #5f6368;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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

const SearchBar = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e8eaed;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  padding-left: 40px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: #9aa0a6;
`;

const FolderList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const FolderItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 24px;
  background: ${(props) => (props.$selected ? "#e8f0fe" : "transparent")};
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$selected ? "#e8f0fe" : "#f8f9fa")};
  }
`;

const FolderIcon = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${(props) => (props.$selected ? "#1a73e8" : "#f1f3f4")};
  border-radius: 8px;
  color: ${(props) => (props.$selected ? "white" : "#5f6368")};
`;

const FolderInfo = styled.div`
  flex: 1;
`;

const FolderName = styled.div<{ $selected?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.$selected ? "#1a73e8" : "#202124")};
`;

const FolderPath = styled.div`
  font-size: 12px;
  color: #9aa0a6;
  margin-top: 2px;
`;

const SelectedIndicator = styled.div`
  color: #1a73e8;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaed;
  font-size: 13px;
  color: #5f6368;
`;

const BreadcrumbItem = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  color: ${(props) => (props.$active ? "#202124" : "#5f6368")};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;

  &:hover {
    background: #f1f3f4;
  }
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e8eaed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) =>
    props.$primary
      ? `
    background: #1a73e8;
    color: white;
    &:hover {
      background: #0d62d9;
    }
    &:disabled {
      background: #8ab4f8;
      cursor: not-allowed;
    }
  `
      : props.$danger
        ? `
    background: #d93025;
    color: white;
    &:hover {
      background: #c5221f;
    }
  `
        : `
    background: #f1f3f4;
    color: #202124;
    &:hover {
      background: #e8eaed;
    }
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #9aa0a6;
`;

const ErrorMessage = styled.div`
  margin: 12px 24px;
  padding: 10px;
  background: #fce8e6;
  border: 1px solid #f28b82;
  border-radius: 6px;
  color: #c5221f;
  font-size: 13px;
`;

const ROOT_OPTION: MoveFolderOption = { id: "root", name: "Your Files", path: "" };

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  files,
  onClose,
  onMove,
  folders: foldersProp,
}) => {
  const [folders, setFolders] = useState<MoveFolderOption[]>([ROOT_OPTION]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [filteredFolders, setFilteredFolders] = useState<MoveFolderOption[]>([]);

  const fetchFolders = useCallback(async () => {
    setFoldersLoading(true);
    try {
      const res = await api.get("/files/folders");
      const data = res.data;
      if (data.success && Array.isArray(data.folders)) {
        const list: MoveFolderOption[] = [
          ROOT_OPTION,
          ...data.folders.map((f: { path: string; name: string }) => ({
            id: f.path,
            name: f.name,
            path: f.path,
          })),
        ];
        setFolders(list);
      } else {
        setFolders([ROOT_OPTION]);
      }
    } catch {
      setFolders([ROOT_OPTION]);
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderPath("root");
      setSearchQuery("");
      setError(null);
      setCurrentPath("");
      if (foldersProp && foldersProp.length > 0) {
        setFolders([ROOT_OPTION, ...foldersProp]);
      } else {
        fetchFolders();
      }
    }
  }, [isOpen, fetchFolders, foldersProp]);

  useEffect(() => {
    const list = foldersProp && foldersProp.length > 0 ? [ROOT_OPTION, ...foldersProp] : folders;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = list.filter(
        (folder) =>
          folder.name.toLowerCase().includes(query) ||
          (folder.path && folder.path.toLowerCase().includes(query)),
      );
      setFilteredFolders(filtered);
    } else {
      setFilteredFolders(list);
    }
  }, [searchQuery, folders, foldersProp]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const targetPath = selectedFolderPath === "root" ? "" : selectedFolderPath;
      await onMove(
        files.map((f) => f.id),
        targetPath,
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to move files");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getSelectedFolderName = () => {
    if (selectedFolderPath === "" || selectedFolderPath === "root") return "Your Files";
    const folder = filteredFolders.find((f) => f.path === selectedFolderPath);
    return folder?.name || selectedFolderPath || "Select folder";
  };

  const pathSegments = currentPath ? currentPath.split("/").filter(Boolean) : [];
  const displayedFolders = filteredFolders;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            Move {files.length} item{files.length > 1 ? "s" : ""}
          </ModalTitle>
          <ModalSubtitle>
            Select a destination folder for{" "}
            {files.length === 1 ? files[0].name : "these items"}
          </ModalSubtitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <SearchBar>
          <div style={{ position: "relative" }}>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
        </SearchBar>

        <Breadcrumbs>
          <BreadcrumbItem onClick={() => setCurrentPath("/")}>
            <Home size={14} />
          </BreadcrumbItem>
          {pathSegments.map((segment, index) => {
            const path = "/" + pathSegments.slice(0, index + 1).join("/");
            return (
              <React.Fragment key={path}>
                <ChevronRight size={14} />
                <BreadcrumbItem
                  $active={index === pathSegments.length - 1}
                  onClick={() => setCurrentPath(path)}
                >
                  {segment}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </Breadcrumbs>

        <FolderList>
          {foldersLoading ? (
            <EmptyState>
              <p>Loading folders...</p>
            </EmptyState>
          ) : displayedFolders.length > 0 ? (
            displayedFolders.map((folder) => {
              const value = folder.id === "root" ? "root" : folder.path;
              const isSelected = selectedFolderPath === value;
              return (
                <FolderItem
                  key={folder.id}
                  $selected={isSelected}
                  onClick={() => setSelectedFolderPath(value)}
                >
                  <FolderIcon $selected={isSelected}>
                    <Folder size={16} />
                  </FolderIcon>
                  <FolderInfo>
                    <FolderName $selected={isSelected}>
                      {folder.name}
                    </FolderName>
                    <FolderPath>{folder.path || "—"}</FolderPath>
                  </FolderInfo>
                  {isSelected && (
                    <SelectedIndicator>
                      <Check size={16} />
                    </SelectedIndicator>
                  )}
                </FolderItem>
              );
            })
          ) : (
            <EmptyState>
              <Folder size={32} />
              <p style={{ marginTop: "12px" }}>
                {searchQuery ? "No folders found" : "No subfolders"}
              </p>
            </EmptyState>
          )}
        </FolderList>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ModalFooter>
          <Button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            $primary
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Moving...
              </>
            ) : (
              <>Move to {getSelectedFolderName()}</>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
