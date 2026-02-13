import React, { useState, useRef, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { MoreVertical, X, Keyboard, Star } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

import FilesTable, { type FileItem } from "../files_table/FilesTable";
import { FileContextMenu } from "./FileContextMenu";
import { RenameModal } from "./modals/RenameModal";
import { DetailsModal } from "./modals/DetailsModal";
import { MoveModal } from "./modals/MoveModal";
import { WatermarkModal } from "./modals/WatermarkModal";
import { OptimizeModal } from "./modals/OptimizeModal";

import { useFileActions } from "./hooks/useFileAction";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

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
}) => {
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<
    Set<string>
  >(new Set());
  const selectedFiles = externalSelectedFiles ?? internalSelectedFiles;

  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [quickActionsFile, setQuickActionsFile] = useState<string | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
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

  const { isPrefixActive, currentKey, shortcutInfo } = useKeyboardShortcuts({
    selectedFiles: selectedFileObjects,
    isRecycleBin,
    isShared,
    currentUser,
    enabled:
      !renameModal.isOpen &&
      !moveModal.isOpen &&
      !watermarkModal.isOpen &&
      !optimizeModal.isOpen &&
      !detailsModal.isOpen,
    onActionExecuted: async (actionId) => {
      await handleActionClick(actionId, selectedFileObjects);
    },
    onSelectAll: handleSelectAll,
    onUnselectAll: handleClearSelection,
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
    [executeAction, selectedFileObjects, onFilePreview, toggleSharingPopup],
  );

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
          next.has(file.id) ? next.delete(file.id) : next.add(file.id);
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

      {isPrefixActive && (
        <ShortcutIndicator>
          <ShortcutText>
            {shortcutInfo
              ? `Press ${shortcutInfo.key.toUpperCase()} → ${shortcutInfo.description}`
              : "Press action key"}
          </ShortcutText>
          {currentKey && (
            <ShortcutKeyDisplay>{currentKey.toUpperCase()}</ShortcutKeyDisplay>
          )}
        </ShortcutIndicator>
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
            <TextButton onClick={handleSelectAll} title="Select all (Ctrl+A)">
              Select all
            </TextButton>
            <IconButton
              onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
              title="View keyboard shortcuts"
              style={{ marginLeft: "8px" }}
            >
              <Keyboard size={18} />
            </IconButton>
          </RightSection>
        </SelectionBar>
      )}

      {showShortcutsHelp && (
        <ShortcutsHelp>
          <ShortcutsHeader>
            <h3>Keyboard Shortcuts</h3>
            <CloseButton onClick={() => setShowShortcutsHelp(false)}>
              <X size={20} />
            </CloseButton>
          </ShortcutsHeader>
          <ShortcutsContent>
            <ShortcutSection>
              <SectionTitle>General</SectionTitle>
              <ShortcutRow>
                <ShortcutKey>Ctrl+A</ShortcutKey>
                <ShortcutDesc>Select all files</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>Esc</ShortcutKey>
                <ShortcutDesc>Clear selection</ShortcutDesc>
              </ShortcutRow>
            </ShortcutSection>

            <ShortcutSection>
              <SectionTitle>File Actions (Alt+K then…)</SectionTitle>
              <ShortcutRow>
                <ShortcutKey>P</ShortcutKey>
                <ShortcutDesc>Preview file</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>R</ShortcutKey>
                <ShortcutDesc>Rename</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>D</ShortcutKey>
                <ShortcutDesc>Duplicate</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>W</ShortcutKey>
                <ShortcutDesc>Download</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>S</ShortcutKey>
                <ShortcutDesc>Share</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>L</ShortcutKey>
                <ShortcutDesc>Get link</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>F</ShortcutKey>
                <ShortcutDesc>Star / Unstar</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>Z</ShortcutKey>
                <ShortcutDesc>Compress</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>E</ShortcutKey>
                <ShortcutDesc>Extract archive</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>X</ShortcutKey>
                <ShortcutDesc>Delete</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>V</ShortcutKey>
                <ShortcutDesc>Move</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>M</ShortcutKey>
                <ShortcutDesc>Watermark</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>O</ShortcutKey>
                <ShortcutDesc>Optimize</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>I</ShortcutKey>
                <ShortcutDesc>Details</ShortcutDesc>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutKey>K</ShortcutKey>
                <ShortcutDesc>Lock / Unlock</ShortcutDesc>
              </ShortcutRow>
            </ShortcutSection>

            {isRecycleBin && (
              <ShortcutSection>
                <SectionTitle>Recycle Bin (Alt+K then…)</SectionTitle>
                <ShortcutRow>
                  <ShortcutKey>U</ShortcutKey>
                  <ShortcutDesc>Restore</ShortcutDesc>
                </ShortcutRow>
                <ShortcutRow>
                  <ShortcutKey>Shift+X</ShortcutKey>
                  <ShortcutDesc>Delete permanently</ShortcutDesc>
                </ShortcutRow>
              </ShortcutSection>
            )}
          </ShortcutsContent>
        </ShortcutsHelp>
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

const ShortcutIndicator = styled.div`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #363840;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10000;
  animation: ${slideDown} 0.3s ease-out;
  font-weight: 500;
  justify-content: center;
`;

const ShortcutText = styled.span`
  font-size: 14px;
  flex: 1;
`;

const ShortcutKeyDisplay = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-family: monospace;
  font-size: 16px;
`;

const SelectionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
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
  align-items: center;
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

const ShortcutsHelp = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
  animation: ${slideDown} 0.3s ease-out;
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 90%;
  max-width: 800px;
`;

const ShortcutsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #202124;
  }
`;

const CloseButton = styled.button`
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

const ShortcutsContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const ShortcutSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ShortcutRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ShortcutKey = styled.kbd`
  min-width: 60px;
  padding: 6px 12px;
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: monospace;
  text-align: center;
  color: #202124;
`;

const ShortcutDesc = styled.span`
  font-size: 14px;
  color: #5f6368;
  flex: 1;
`;
