import React, { useState, useRef, useCallback, useMemo, useLayoutEffect, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { MoreVerticalIcon as MoreVertical, XIcon as X, StarIcon as Star } from "../icons/index";
import { useRouter } from "@tanstack/react-router";

import FilesTable, { type FileItem } from "../files_table/FilesTable";
import { FileContextMenu } from "./FileContextMenu";
import { RenameModal } from "./modals/RenameModal";
import { DetailsModal } from "./modals/DetailsModal";
import { MoveModal } from "./modals/MoveModal";
import { WatermarkModal } from "./modals/WatermarkModal";
import { OptimizeModal } from "./modals/OptimizeModal";

import { useFileActions } from "./hooks/useFileAction";

import type {
  EnhancedFileItem,
  FileActionId,
  FileActionDefinition,
} from "./types/fileActions";
import SharePopup from "../popups/share/SharePopup";
import { usePopupStore } from "../popups/popup.store";

interface EnhancedFilesTableProps {
  files: EnhancedFileItem[];
  loading?: boolean;
  onFilePreview?: (file: FileItem | EnhancedFileItem) => void;
  onFileSelect?: (file: FileItem | EnhancedFileItem, selected: boolean) => void;
  selectedFiles?: Set<string>;
  showOwner?: boolean;
  showLocation?: boolean;
  isRecycleBin?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  maxHeight?: number;
  isShared?: boolean;
  onFilesUpload?: (files: FileList) => Promise<void>;
  checkStorageLimit?: (totalSize: number) => boolean;
  showFolderStructure?: boolean;
  currentUser?: string;
  onRefresh?: () => void;
  onRestoreFile?: (fileId: string) => Promise<void>;
  onDeletePermanently?: (fileId: string) => Promise<void>;
  /** Called once on mount with a stable handle to execute any file action. */
  onActionHandlerReady?: (
    handler: (actionId: FileActionId, files?: EnhancedFileItem[]) => Promise<void>,
  ) => void;
}

const EnhancedFilesTable: React.FC<EnhancedFilesTableProps> = ({
  files,
  loading,
  onFilePreview,
  onFileSelect,
  selectedFiles: externalSelectedFiles,
  showOwner,
  showLocation,
  isRecycleBin = false,
  emptyMessage,
  emptySubtext,
  maxHeight = 770,
  isShared = false,
  onFilesUpload,
  checkStorageLimit,
  showFolderStructure,
  currentUser,
  onRefresh,
  onRestoreFile,
  onDeletePermanently,
  onActionHandlerReady,
}) => {
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<
    Set<string>
  >(new Set());
  const selectedFiles = externalSelectedFiles ?? internalSelectedFiles;

  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [quickActionsFile, setQuickActionsFile] = useState<string | null>(null);
  const isSharingPopupOpen = usePopupStore((state) => state.isSharingPopupOpen);

  const [shareFile, setShareFile] = useState<EnhancedFileItem | null>(null);

  const toggleSharingPopup = usePopupStore((state) => state.toggleSharingPopup);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    selectedFiles: EnhancedFileItem[];
  }>({ visible: false, x: 0, y: 0, selectedFiles: [] });

  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean;
    file: EnhancedFileItem | null;
  }>({ isOpen: false, file: null });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    file: EnhancedFileItem | null;
  }>({ isOpen: false, file: null });
  const [moveModal, setMoveModal] = useState<{
    isOpen: boolean;
    files: EnhancedFileItem[];
  }>({ isOpen: false, files: [] });
  const [watermarkModal, setWatermarkModal] = useState<{
    isOpen: boolean;
    files: EnhancedFileItem[];
  }>({ isOpen: false, files: [] });
  const [optimizeModal, setOptimizeModal] = useState<{
    isOpen: boolean;
    file: EnhancedFileItem | null;
  }>({ isOpen: false, file: null });

  const tableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const selectedFileObjects = useMemo(
    () => files.filter((f) => selectedFiles.has(f.id)),
    [files, selectedFiles],
  );

  const handleClearSelection = useCallback(() => {
    if (onFileSelect) {
      selectedFiles.forEach((id) => {
        const file = files.find((f) => f.id === id);
        if (file) onFileSelect?.(file as EnhancedFileItem, false);
      });
    } else {
      setInternalSelectedFiles(new Set());
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [files, onFileSelect, selectedFiles]);

  const handleSelectAll = useCallback(() => {
    if (onFileSelect) {
      files.forEach((file) => onFileSelect?.(file, true));
    } else {
      setInternalSelectedFiles(new Set(files.map((f) => f.id)));
    }
  }, [files, onFileSelect]);

  const {
    executeAction,
    isExecuting,
    getSelectionBarActions,
    getQuickMenuActions,
  } = useFileActions({
    onSuccess: () => {
      handleClearSelection();
      onRefresh?.();
    },
    onError: (error: Error) => {
      console.error("Action failed:", error);
    },
    currentUser,
    onOpenRenameModal: (file) => setRenameModal({ isOpen: true, file }),
    onOpenMoveModal: (files) => setMoveModal({ isOpen: true, files }),
    onOpenDetailsModal: (file) => setDetailsModal({ isOpen: true, file }),
    onOpenWatermarkModal: (files) => setWatermarkModal({ isOpen: true, files }),
    onOpenOptimizeModal: (file) => setOptimizeModal({ isOpen: true, file }),
    onRestoreFile,
    onDeletePermanently,
  });

  const selectionBarActions = useMemo(
    () => getSelectionBarActions(selectedFileObjects, isRecycleBin, isShared),
    [getSelectionBarActions, selectedFileObjects, isRecycleBin, isShared],
  );

  const handleActionClick = useCallback(
    async (actionId: FileActionId, filesToActOn?: EnhancedFileItem[]) => {
      const targetFiles = filesToActOn ?? selectedFileObjects;
      if (targetFiles.length === 0) return;

      const filesAsFileItems = targetFiles as EnhancedFileItem[];

      switch (actionId) {
        case "share":
          setShareFile(targetFiles[0]);
          toggleSharingPopup();
          return;

        case "rename":
          setRenameModal({ isOpen: true, file: targetFiles[0] });
          return;
        case "move":
          setMoveModal({ isOpen: true, files: targetFiles });
          return;
        case "details":
          setDetailsModal({ isOpen: true, file: targetFiles[0] });
          return;
        case "watermark":
          setWatermarkModal({ isOpen: true, files: targetFiles });
          return;
        case "optimize":
          setOptimizeModal({ isOpen: true, file: targetFiles[0] });
          return;
        case "preview":
          if (targetFiles[0])
            onFilePreview?.(targetFiles[0] as unknown as FileItem);
          return;
        case "edit":
          if (targetFiles[0]) {
            router.navigate({
              to: "/edit/$fileId",
              params: { fileId: targetFiles[0].id },
            });
          }
          return;
      }

      await executeAction(actionId, filesAsFileItems);
    },
    [executeAction, selectedFileObjects, onFilePreview, toggleSharingPopup, router],
  );

  // Keep a ref that always points to the latest handleActionClick so the
  // stable wrapper handed to onActionHandlerReady never goes stale.
  const handleActionClickRef = useRef(handleActionClick);
  useLayoutEffect(() => {
    handleActionClickRef.current = handleActionClick;
  });

  useEffect(() => {
    if (!onActionHandlerReady) return;
    onActionHandlerReady((...args) => handleActionClickRef.current(...args));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRename = useCallback(
    async (fileId: string, newName: string) => {
      await executeAction("rename", [{ id: fileId } as EnhancedFileItem], {
        newName,
      });
      setRenameModal({ isOpen: false, file: null });
    },
    [executeAction],
  );

  const handleMove = useCallback(
    async (_fileIds: string[], targetFolderPath: string) => {
      await executeAction(
        "move",
        moveModal.files,
        { targetFolderPath },
      );
      setMoveModal({ isOpen: false, files: [] });
    },
    [executeAction, moveModal.files],
  );

  const handleWatermark = useCallback(
    async (
      watermarkFiles: EnhancedFileItem[],
      options: { text?: string; position?: string; opacity?: number },
    ) => {
      await executeAction("watermark", watermarkFiles, { watermark: options });
      setWatermarkModal({ isOpen: false, files: [] });
    },
    [executeAction],
  );

  const handleOptimize = useCallback(
    async (
      file: EnhancedFileItem,
      options: { quality?: number; format?: string },
    ) => {
      await executeAction("optimize", [file], { optimize: options });
      setOptimizeModal({ isOpen: false, file: null });
    },
    [executeAction],
  );

  const handleContextMenu = useCallback(
    (file: FileItem, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const enhanced = file as unknown as EnhancedFileItem;
      const isSelected = selectedFiles.has(enhanced.id);

      if (!isSelected) {
        handleClearSelection();
        if (onFileSelect) {
          onFileSelect?.(enhanced, true);
        } else {
          setInternalSelectedFiles(new Set([enhanced.id]));
        }
      }

      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        selectedFiles: isSelected ? selectedFileObjects : [enhanced],
      });
    },
    [selectedFiles, selectedFileObjects, handleClearSelection, onFileSelect],
  );

  const handleFileClick = useCallback(
    (file: FileItem) => {
      if (file.type === "folder") return;

      if (onFileSelect) {
        onFileSelect?.(file as EnhancedFileItem, !selectedFiles.has(file.id));
      } else {
        setInternalSelectedFiles((prev) => {
          const next = new Set(prev);
          if (next.has(file.id)) next.delete(file.id);
          else next.add(file.id);
          return next;
        });
      }
    },
    [onFileSelect, selectedFiles],
  );

  const handleFileDoubleClick = useCallback(
    (file: FileItem) => {
      onFilePreview?.(file);
    },
    [onFilePreview],
  );

  const renderRowActions = useCallback(
    (file: FileItem) => {
      const actions =         getQuickMenuActions(
        file as unknown as EnhancedFileItem,
        isRecycleBin,
        isShared,
      );

      return (
        <QuickActionsWrapper
          onMouseEnter={() => setHoveredFileId(file.id)}
          onMouseLeave={() => setHoveredFileId(null)}
        >
          {(hoveredFileId === file.id || quickActionsFile === file.id) && (
            <>
              <QuickActionsButton
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickActionsFile(
                    quickActionsFile === file.id ? null : file.id,
                  );
                }}
                $active={quickActionsFile === file.id}
              >
                <MoreVertical size={16} />
              </QuickActionsButton>

              {quickActionsFile === file.id && (
                <QuickActionsMenu onClick={(e) => e.stopPropagation()}>
                  {actions.map((item, index) => {
                    if (item === "divider") {
                      return <QuickActionDivider key={`divider-${index}`} />;
                    }

                    const action = item as FileActionDefinition;
                    const isStar = action.id === "star";
                    const isUnstar = action.id === "unstar";

                    return (
                      <QuickAction
                        key={action.id}
                        $danger={action.danger}
                        onClick={() => {
                          handleActionClick(action.id, [
                            file as unknown as EnhancedFileItem,
                          ]);
                          setQuickActionsFile(null);
                        }}
                        disabled={isExecuting}
                      >
                        {isStar || isUnstar ? (
                          <Star
                            size={16}
                            fill={isUnstar ? "#fbbc04" : "none"}
                            stroke={isUnstar ? "#fbbc04" : "currentColor"}
                          />
                        ) : (
                          <action.icon size={16} />
                        )}
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <QuickShortcut>
                            {action.shortcut.split(" ").slice(1).join("+")}
                          </QuickShortcut>
                        )}
                      </QuickAction>
                    );
                  })}
                </QuickActionsMenu>
              )}
            </>
          )}
        </QuickActionsWrapper>
      );
    },
    [
      getQuickMenuActions,
      isRecycleBin,
      isShared,
      quickActionsFile,
      hoveredFileId,
      handleActionClick,
      isExecuting,
    ],
  );

  return (
    <Container ref={tableRef}>
      <FileContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        selectedFiles={contextMenu.selectedFiles}
        isRecycleBin={isRecycleBin}
        isShared={isShared}
        currentUser={currentUser}
        onAction={handleActionClick}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
      />

      {renameModal.isOpen && renameModal.file && (
        <RenameModal
          isOpen={renameModal.isOpen}
          file={renameModal.file}
          onClose={() => setRenameModal({ isOpen: false, file: null })}
          onRename={handleRename}
        />
      )}

      {detailsModal.isOpen && detailsModal.file && (
        <DetailsModal
          isOpen={detailsModal.isOpen}
          file={detailsModal.file}
          onClose={() => setDetailsModal({ isOpen: false, file: null })}
          onDownload={(file) => handleActionClick("download", [file])}
          onShare={(file) => handleActionClick("share", [file])}
          onDelete={(file) => handleActionClick("delete", [file])}
          onToggleStar={(file) =>
            handleActionClick(file.isStarred ? "unstar" : "star", [file])
          }
          onToggleLock={(file) =>
            handleActionClick(file.isLocked ? "unlock" : "lock", [file])
          }
        />
      )}

      {moveModal.isOpen && moveModal.files.length > 0 && (
        <MoveModal
          isOpen={moveModal.isOpen}
          files={moveModal.files}
          onClose={() => setMoveModal({ isOpen: false, files: [] })}
          onMove={handleMove}
        />
      )}

      {watermarkModal.isOpen && watermarkModal.files.length > 0 && (
        <WatermarkModal
          isOpen={watermarkModal.isOpen}
          files={watermarkModal.files}
          onClose={() => setWatermarkModal({ isOpen: false, files: [] })}
          onApply={handleWatermark}
        />
      )}

      {optimizeModal.isOpen && optimizeModal.file && (
        <OptimizeModal
          isOpen={optimizeModal.isOpen}
          file={optimizeModal.file}
          onClose={() => setOptimizeModal({ isOpen: false, file: null })}
          onOptimize={handleOptimize}
        />
      )}

      {selectedFiles.size > 0 && (
        <SelectionBar>
          <LeftSection>
            <SelectionCount>{selectedFiles.size} selected</SelectionCount>
            <ClearButton
              onClick={handleClearSelection}
              title="Clear selection (Esc)"
            >
              <X size={16} />
            </ClearButton>
          </LeftSection>

          <CenterSection>
            {selectionBarActions.map((item, index) => {
              if (item === "divider") {
                return <VerticalDivider key={`divider-${index}`} />;
              }

              const action = item as FileActionDefinition;
              const isStar = action.id === "star";
              const isUnstar = action.id === "unstar";

              return (
                <IconButton
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  title={
                    action.shortcut
                      ? `${action.label} (${action.shortcut})`
                      : action.label
                  }
                  $danger={action.danger}
                  disabled={isExecuting}
                >
                  {isStar || isUnstar ? (
                    <Star
                      size={18}
                      fill={isUnstar ? "#fbbc04" : "none"}
                      stroke={isUnstar ? "#fbbc04" : "currentColor"}
                    />
                  ) : (
                    <action.icon size={18} />
                  )}
                </IconButton>
              );
            })}
          </CenterSection>

          <RightSection>
            <TextButton onClick={handleSelectAll} title="Select all">
              Select all
            </TextButton>
          </RightSection>
        </SelectionBar>
      )}

      <TableWrapper>
        <FilesTable
          files={files as FileItem[]}
          loading={loading}
          onFileClick={handleFileClick}
          onFileDoubleClick={handleFileDoubleClick}
          onFileSelect={onFileSelect ? (file, selected) => onFileSelect(file as EnhancedFileItem, selected) : undefined}
          onFilePreview={onFilePreview}
          selectedFiles={selectedFiles}
          showOwner={showOwner}
          showLocation={showLocation}
          emptyMessage={emptyMessage}
          emptySubtext={emptySubtext}
          maxHeight={maxHeight}
          onFilesUpload={onFilesUpload}
          checkStorageLimit={checkStorageLimit}
          showFolderStructure={showFolderStructure}
          onFileContextMenu={handleContextMenu}
          renderRowActions={renderRowActions}
        />
      </TableWrapper>

      {isSharingPopupOpen && shareFile && (
        <SharePopup
          fileId={shareFile.id}
          fileName={shareFile.name}
          onClose={() => {
            toggleSharingPopup();
            setShareFile(null);
          }}
        />
      )}
    </Container>
  );
};

export default EnhancedFilesTable;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0);     }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

const SelectionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  row-gap: 10px;
  column-gap: 8px;
  justify-content: space-between;
  padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 20px);
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;

  @media (min-width: 900px) {
    flex-wrap: nowrap;
    row-gap: 0;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 0 1 auto;
  order: 1;

  @media (min-width: 900px) {
    gap: 12px;
    min-width: 120px;
    flex: 0 0 auto;
  }
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  flex: 1 1 100%;
  min-width: 0;
  max-width: 100%;
  order: 3;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  padding: 4px 0 6px;
  scrollbar-width: thin;
  scrollbar-color: #dadce0 transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 3px;
  }

  @media (min-width: 900px) {
    order: 2;
    flex: 1 1 auto;
    padding: 0;
    justify-content: center;
    gap: 6px;
    /* When many actions, still scroll instead of breaking layout */
    overflow-x: auto;
  }
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 0 1 auto;
  order: 2;
  margin-left: auto;

  @media (min-width: 900px) {
    order: 3;
    margin-left: 0;
    min-width: 120px;
    flex: 0 0 auto;
    gap: 8px;
  }
`;

const SelectionCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
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

const IconButton = styled.button<{ $danger?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: ${(p) => (p.$danger ? "#d93025" : "#5f6368")};
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover:not(:disabled) {
    background: ${(p) => (p.$danger ? "#fce8e6" : "#f1f3f4")};
    color: ${(p) => (p.$danger ? "#d93025" : "#202124")};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  svg {
    flex-shrink: 0;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 24px;
  flex-shrink: 0;
  background: #dadce0;
  margin: 0 4px;

  @media (min-width: 900px) {
    margin: 0 8px;
  }
`;

const TextButton = styled.button`
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;

  @media (min-width: 900px) {
    padding: 8px 16px;
    font-size: 14px;
  }
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
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
  background: ${(p) => (p.$active ? "#f1f3f4" : "transparent")};
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
  min-width: 220px;
  background: #fff;
  border-radius: 12px;
  box-shadow:
    0 2px 8px rgba(60, 64, 67, 0.15),
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
  color: ${(p) => (p.$danger ? "#d93025" : "#202124")};
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
  &:hover:not(:disabled) {
    background: ${(p) => (p.$danger ? "#fce8e6" : "#f1f3f4")};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  svg {
    flex-shrink: 0;
    color: ${(p) => (p.$danger ? "#d93025" : "#5f6368")};
  }
  span {
    flex: 1;
  }
`;

const QuickShortcut = styled.span`
  font-size: 11px;
  color: #5f6368;
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
`;

const QuickActionDivider = styled.div`
  height: 1px;
  background: #e8eaed;
  margin: 8px 0;
`;

