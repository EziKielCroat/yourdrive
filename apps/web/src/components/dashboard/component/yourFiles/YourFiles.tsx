import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";
import { useStorageStore } from "../../../../store/storageStore";
import { useUserUiPreferencesStore } from "../../../../store/userUiPreferencesStore";
import { useRouter } from "@tanstack/react-router";
import api from "../../../../lib/axios";
import {
  uploadDashboardFileList,
  getUploadErrorMessage,
} from "../../../../lib/fileUpload";

import { type FileItem } from "../../../shared/files_table/FilesTable";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import SidebarToggle from "../sidebar/SidebarToggle";
import { useFileSearch } from "../../../shared/hooks/useFileSearch";

import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import { useEvent } from "../../../../events/useEvent";
import { eventBus } from "../../../../events/eventBus";

import PageTransition from "../../../shared/PageTransition";
import { CommandPalette } from "../../../shared/fileEditor/CommandPalette";
import type { Command } from "../../../shared/fileEditor/CommandPalette";
import { getEditorVars } from "../../../shared/fileEditor/editor.tokens";
import { ROUTES } from "../../../../router/router";

import type { EnhancedFileItem, FileActionId } from "../../../shared/enhancedFileTable/types/fileActions";

import {
  TerminalIcon as Terminal,
  UploadIcon as Upload,
  RefreshCwIcon as RefreshCw,
  StarIcon as Star,
  Share2Icon as Share2,
  Trash2Icon as Trash2,
  SettingsIcon as Settings,
  HomeIcon as Home,
  ClockIcon as Clock,
  DownloadIcon as Download,
  EyeIcon as Eye,
  Edit3Icon as Edit3,
  TypeIcon as Type,
  MoveIcon as Move,
  CopyIcon as Copy,
  LinkIcon as Link,
  InfoIcon as Info,
  LockIcon as Lock,
  CheckCircleIcon as CheckCircle,
  XIcon as X,
} from "../../../shared/icons/index";

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
  const user = useAuthStore((s) => s.user);
  const addUsage = useStorageStore((s) => s.addUsage);
  const refreshStorage = useStorageStore((s) => s.refreshStorage);
  const resolvedTheme = useUserUiPreferencesStore((s) => s.resolvedTheme);
  const router = useRouter();

  const [files, setFiles] = useState<FileItem[]>([]);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [cmdOpen, setCmdOpen] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const actionHandlerRef = useRef<
    ((actionId: FileActionId, files?: EnhancedFileItem[]) => Promise<void>) | null
  >(null);

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

    const hasStructure = Array.from(fileList).some(
      (file) => (file as File & { webkitRelativePath?: string }).webkitRelativePath,
    );

    try {
      await uploadDashboardFileList(fileList, (file) => {
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || "";
        if (hasStructure && relativePath) {
          return relativePath.substring(0, relativePath.lastIndexOf("/")) || "";
        }
        return "";
      });

      addUsage(totalSize);

      await refreshStorage();
      eventBus.emit(FILES_REFRESH_EVENT);
    } catch (err) {
      console.error("Upload error:", err);
      alert(getUploadErrorMessage(err));
      throw err;
    }
  };

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/files");
      const filesData = response.data;

      if (!filesData.success || !Array.isArray(filesData.files)) {
        console.warn("Unexpected response shape:", filesData);
        setFiles([]);
        return;
      }

      const transformedFiles: FileItem[] = filesData.files.map((file: any) => ({
        id: String(file.id),

        name: file.name || file.original_name || "Untitled",

        type: file.type || "file",

        mimeType: file.mimeType || file.mime_type || "application/octet-stream",

        lastInteraction: file.updatedAt
          ? formatDate(file.updatedAt)
          : file.createdAt
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

        createdAt: file.createdAt ?? file.created_at,
        updatedAt: file.updatedAt ?? file.updated_at,
      }));

      setFiles(transformedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [user]);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchFiles();
  });

  // ── Global Ctrl+K shortcut ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Command palette commands ─────────────────────────────────
  const selectedFileObjects = useMemo(
    () => filteredFiles.filter((f) => selectedFiles.has(f.id)) as EnhancedFileItem[],
    [filteredFiles, selectedFiles],
  );

  const execAction = useCallback(
    (actionId: FileActionId) => {
      actionHandlerRef.current?.(actionId, selectedFileObjects);
    },
    [selectedFileObjects],
  );

  const isSingle = selectedFiles.size === 1;
  const hasSelection = selectedFiles.size > 0;
  const singleFile = isSingle ? selectedFileObjects[0] : null;
  const isTextFile = singleFile
    ? ["text/", "application/json", "application/xml", "application/javascript"].some(
        (t) => (singleFile.mimeType ?? "").includes(t),
      )
    : false;
  const isStarred = hasSelection && selectedFileObjects.every((f) => f.isStarred);

  const paletteCommands = useMemo<Command[]>(() => {
    const cmds: Command[] = [];

    // ── Selection actions (only when files are selected) ──────
    if (hasSelection) {
      cmds.push({
        id: "download",
        label: selectedFiles.size === 1 ? "Download file" : `Download ${selectedFiles.size} files`,
        icon: <Download size={14} />,
        group: "Selection",
        action: () => execAction("download"),
      });

      if (isSingle && singleFile && !singleFile.isFolder) {
        cmds.push({
          id: "preview",
          label: "Preview file",
          icon: <Eye size={14} />,
          group: "Selection",
          action: () => execAction("preview"),
        });
      }

      if (isSingle && isTextFile) {
        cmds.push({
          id: "edit",
          label: "Edit file",
          icon: <Edit3 size={14} />,
          group: "Selection",
          action: () => execAction("edit"),
        });
      }

      if (isSingle) {
        cmds.push({
          id: "rename",
          label: "Rename",
          icon: <Type size={14} />,
          group: "Selection",
          action: () => execAction("rename"),
        });
      }

      cmds.push({
        id: "move",
        label: selectedFiles.size === 1 ? "Move file" : `Move ${selectedFiles.size} files`,
        icon: <Move size={14} />,
        group: "Selection",
        action: () => execAction("move"),
      });

      cmds.push({
        id: "share",
        label: "Share",
        icon: <Share2 size={14} />,
        group: "Selection",
        action: () => execAction("share"),
      });

      cmds.push({
        id: "get-link",
        label: "Copy link",
        icon: <Link size={14} />,
        group: "Selection",
        action: () => execAction("getLink"),
      });

      cmds.push({
        id: "duplicate",
        label: selectedFiles.size === 1 ? "Duplicate file" : `Duplicate ${selectedFiles.size} files`,
        icon: <Copy size={14} />,
        group: "Selection",
        action: () => execAction("duplicate"),
      });

      cmds.push({
        id: "star-toggle",
        label: isStarred ? "Remove from Favorites" : "Add to Favorites",
        icon: <Star size={14} />,
        group: "Selection",
        action: () => execAction(isStarred ? "unstar" : "star"),
      });

      if (isSingle) {
        cmds.push({
          id: "details",
          label: "File details",
          icon: <Info size={14} />,
          group: "Selection",
          action: () => execAction("details"),
        });
      }

      cmds.push({
        id: "lock-toggle",
        label: selectedFileObjects.every((f) => f.isLocked) ? "Unlock" : "Lock",
        icon: <Lock size={14} />,
        group: "Selection",
        action: () =>
          execAction(selectedFileObjects.every((f) => f.isLocked) ? "unlock" : "lock"),
      });

      cmds.push({
        id: "delete",
        label: selectedFiles.size === 1 ? "Delete file" : `Delete ${selectedFiles.size} files`,
        icon: <Trash2 size={14} />,
        group: "Selection",
        action: () => execAction("delete"),
      });

      cmds.push({
        id: "clear-selection",
        label: `Clear selection (${selectedFiles.size} selected)`,
        icon: <X size={14} />,
        group: "Selection",
        action: () => {
          filteredFiles.forEach((f) => handleFileSelect(f as FileItem, false));
          setSelectedFiles(new Set());
        },
      });
    }

    // ── Always-available actions ──────────────────────────────
    cmds.push({
      id: "select-all",
      label: "Select all files",
      icon: <CheckCircle size={14} />,
      group: "Files",
      action: () => {
        filteredFiles.forEach((f) => handleFileSelect(f as FileItem, true));
      },
    });

    cmds.push({
      id: "upload-file",
      label: "Upload files",
      icon: <Upload size={14} />,
      group: "Files",
      action: () => uploadInputRef.current?.click(),
    });

    cmds.push({
      id: "refresh",
      label: "Refresh",
      icon: <RefreshCw size={14} />,
      group: "Files",
      action: fetchFiles,
    });

    // ── Navigation ────────────────────────────────────────────
    cmds.push(
      {
        id: "go-home",
        label: "Go to Home",
        icon: <Home size={14} />,
        group: "Navigate",
        action: () => router.navigate({ to: ROUTES.DASHBOARD }),
      },
      {
        id: "go-favorites",
        label: "Go to Favorites",
        icon: <Star size={14} />,
        group: "Navigate",
        action: () => router.navigate({ to: ROUTES.FAVORITED }),
      },
      {
        id: "go-shared",
        label: "Go to Shared with you",
        icon: <Share2 size={14} />,
        group: "Navigate",
        action: () => router.navigate({ to: ROUTES.SHARED_WITH_YOU }),
      },
      {
        id: "go-recent",
        label: "Go to Recently edited",
        icon: <Clock size={14} />,
        group: "Navigate",
        action: () => router.navigate({ to: ROUTES.RECENTLY_EDITED }),
      },
      {
        id: "go-trash",
        label: "Go to Recycle bin",
        icon: <Trash2 size={14} />,
        group: "Navigate",
        action: () => router.navigate({ to: ROUTES.RECYCLE_BIN }),
      },
      {
        id: "go-settings",
        label: "Open Settings",
        icon: <Settings size={14} />,
        group: "Navigate",
        action: () => router.navigate({ to: ROUTES.SETTINGS }),
      },
    );

    return cmds;
  }, [
    hasSelection,
    isSingle,
    isStarred,
    isTextFile,
    singleFile,
    selectedFiles.size,
    selectedFileObjects,
    execAction,
    router,
    fetchFiles,
    filteredFiles,
  ]);

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

  return (
    <PageTransition>
      <Container>
        <Header>
          <SidebarToggle />
          <Title>Your Files</Title>
          {files.length > 0 && (
            <FileCount>
              {files.length} {files.length === 1 ? "item" : "items"}
            </FileCount>
          )}
          <HeaderSpacer />
          <CommandsBtn onClick={() => setCmdOpen(true)} title="Open command palette (Ctrl+K)">
            <Terminal size={13} />
            <CmdBtnLabel>Commands</CmdBtnLabel>
            <CmdKbd>K</CmdKbd>
          </CommandsBtn>
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
          files={filteredFiles as EnhancedFileItem[]}
          loading={loading}
          emptyMessage={getEmptyMessage(hasActiveFilters)}
          emptySubtext={getEmptySubtext(hasActiveFilters)}
          onFilePreview={(f) => handleFilePreview(f as FileItem)}
          onFileSelect={(f, sel) => handleFileSelect(f as FileItem, sel)}
          selectedFiles={selectedFiles}
          showOwner={false}
          showLocation={true}
          showFolderStructure={true}
          maxHeight={770}
          onFilesUpload={handleFilesUpload}
          checkStorageLimit={checkStorageLimit}
          onRefresh={fetchFiles}
          onActionHandlerReady={(handler) => {
            actionHandlerRef.current = handler;
          }}
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

        {/* Hidden upload input triggered by command palette */}
        <input
          ref={uploadInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) handleFilesUpload(e.target.files);
            e.target.value = "";
          }}
        />

        {/* Command palette — wrapped in a themed container so CSS vars cascade */}
        <PaletteThemeWrap style={getEditorVars(resolvedTheme)}>
          <CommandPalette
            isOpen={cmdOpen}
            onClose={() => setCmdOpen(false)}
            commands={paletteCommands}
          />
        </PaletteThemeWrap>
      </Container>
    </PageTransition>
  );
};

// ── Styled components ─────────────────────────────────────────────────────────

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: clamp(12px, 3vw, 16px);
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: clamp(16px, 4vw, 24px);
  min-width: 0;
`;

const Title = styled.h1`
  margin-top: 0px;
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 500;
  color: #202124;
  margin: 0;
  line-height: 1.2;
  min-width: 0;
`;

const FileCount = styled.div`
  font-size: clamp(13px, 2.5vw, 14px);
  color: #5f6368;
  white-space: nowrap;
`;

const HeaderSpacer = styled.div`
  flex: 1;
`;

const CommandsBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.8);
  color: #5f6368;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease,
    box-shadow 0.12s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.20);
    color: #202124;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &:active {
    background: #f1f3f4;
  }
`;

const CmdBtnLabel = styled.span`
  @media (max-width: 520px) {
    display: none;
  }
`;

const CmdKbd = styled.kbd`
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.10);
  color: #9aa0a6;
  letter-spacing: 0.02em;

  @media (max-width: 520px) {
    display: none;
  }
`;

const FilterIndicator = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
`;

/**
 * Provides the `--ed-*` CSS custom properties to the CommandPalette subtree.
 * The palette itself uses `position: fixed` but still inherits CSS vars from
 * its DOM parent through the cascade.
 */
const PaletteThemeWrap = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;

  /* Re-enable pointer events for the palette itself */
  & > * {
    pointer-events: auto;
  }
`;

export default YourFiles;
