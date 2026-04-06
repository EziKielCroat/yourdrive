import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { X, Check } from "lucide-react";
import type { EnhancedFileItem } from "../types/fileActions";

interface RenameModalProps {
  isOpen: boolean;
  file: EnhancedFileItem;
  onClose: () => void;
  onRename: (fileId: string, newName: string) => Promise<void>;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  padding: clamp(16px, 4vw, 24px);
  width: min(400px, calc(100vw - 24px));
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #202124;
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

const ModalBody = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

const FileNameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #dadce0;
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

  &:disabled {
    background: #f8f9fa;
    color: #9aa0a6;
    cursor: not-allowed;
  }
`;

const FileInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 12px;
  color: #5f6368;
`;

const FileNamePreview = styled.div`
  font-family: monospace;
  margin-top: 4px;
  color: #202124;
`;

const ModalFooter = styled.div`
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

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  file,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState(file.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(file.name);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        const extensionIndex = file.name.lastIndexOf(".");
        if (extensionIndex > 0) {
          inputRef.current?.setSelectionRange(0, extensionIndex);
        } else {
          inputRef.current?.select();
        }
      }, 100);
    }
  }, [isOpen, file.name]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (newName.trim() === file.name) {
      onClose();
      return;
    }

    if (!newName.trim()) {
      setError("File name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRename(file.id, newName.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to rename file");
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

  const getFileExtension = () => {
    const lastDot = file.name.lastIndexOf(".");
    return lastDot > 0 ? file.name.substring(lastDot) : "";
  };

  const extension = getFileExtension();
  const nameWithoutExt = extension
    ? newName.replace(new RegExp(`${extension}$`), "")
    : newName;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Rename File</ModalTitle>
            <CloseButton onClick={onClose} type="button">
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <InputLabel htmlFor="fileName">New name</InputLabel>
            <FileNameInput
              ref={inputRef}
              id="fileName"
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              autoComplete="off"
              spellCheck="false"
            />

            <FileInfo>
              <div>Current name: {file.name}</div>
              {extension && (
                <FileNamePreview>
                  {nameWithoutExt}
                  <span style={{ color: "#1a73e8" }}>{extension}</span>
                </FileNamePreview>
              )}
            </FileInfo>

            {error && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "#fce8e6",
                  border: "1px solid #f28b82",
                  borderRadius: "6px",
                  color: "#c5221f",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              $primary
              type="submit"
              disabled={
                isSubmitting || newName.trim() === file.name || !newName.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Renaming...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Rename
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};
