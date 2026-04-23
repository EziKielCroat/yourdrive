import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  SaveIcon as Save,
  SparklesIcon as Sparkles,
  CopyIcon as Copy,
  Trash2Icon as Trash2,
  AlignLeftIcon as AlignLeft,
  SearchIcon as Search,
  HashIcon as Hash,
} from "../icons/index";
import { T } from "./editor.tokens";

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  group?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const execute = useCallback(
    (cmd: Command) => {
      onClose();
      setTimeout(() => cmd.action(), 60);
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[activeIdx];
        if (cmd) execute(cmd);
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [isOpen, filtered, activeIdx, execute, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const groups: Record<string, Command[]> = {};
  filtered.forEach((c) => {
    const g = c.group ?? "Actions";
    if (!groups[g]) groups[g] = [];
    groups[g].push(c);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <Palette
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <InputRow>
              <SearchIcon>
                <Search size={15} strokeWidth={2} />
              </SearchIcon>
              <PaletteInput
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands…"
                aria-label="Search commands"
              />
              <KbdHint>ESC</KbdHint>
            </InputRow>

            <CommandList ref={listRef}>
              {filtered.length === 0 && (
                <EmptyMsg>No commands found for "{query}"</EmptyMsg>
              )}
              {Object.entries(groups).map(([group, cmds]) => {
                let globalIdx = filtered.indexOf(cmds[0]);
                return (
                  <React.Fragment key={group}>
                    <GroupLabel>{group}</GroupLabel>
                    {cmds.map((cmd) => {
                      const idx = globalIdx++;
                      const isActive = idx === activeIdx;
                      return (
                        <CommandItem
                          key={cmd.id}
                          data-idx={idx}
                          $active={isActive}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => execute(cmd)}
                        >
                          <CmdIcon $active={isActive}>{cmd.icon}</CmdIcon>
                          <CmdLabel>{cmd.label}</CmdLabel>
                          {cmd.shortcut && <CmdShortcut>{cmd.shortcut}</CmdShortcut>}
                        </CommandItem>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </CommandList>

            <PaletteFooter>
              <FooterHint><Kbd>↑↓</Kbd> navigate</FooterHint>
              <FooterHint><Kbd>↵</Kbd> run</FooterHint>
              <FooterHint><Kbd>ESC</Kbd> close</FooterHint>
            </PaletteFooter>
          </Palette>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export function useEditorCommands({
  onSave,
  onToggleAi,
  onCopyAll,
  onSelectAll,
  onWordCount,
  content,
}: {
  onSave: () => void;
  onToggleAi: () => void;
  onCopyAll: () => void;
  onSelectAll: () => void;
  onWordCount: () => void;
  content: string;
}): Command[] {
  return [
    {
      id: "save",
      label: "Save file",
      shortcut: "Ctrl+S",
      icon: <Save size={14} />,
      group: "File",
      action: onSave,
    },
    {
      id: "copy-all",
      label: "Copy all content",
      shortcut: "Ctrl+Shift+C",
      icon: <Copy size={14} />,
      group: "File",
      action: onCopyAll,
    },
    {
      id: "select-all",
      label: "Select all",
      shortcut: "Ctrl+A",
      icon: <AlignLeft size={14} />,
      group: "Edit",
      action: onSelectAll,
    },
    {
      id: "word-count",
      label: `Word count: ${content.trim().split(/\s+/).filter(Boolean).length} words`,
      icon: <Hash size={14} />,
      group: "Edit",
      action: onWordCount,
    },
    {
      id: "toggle-ai",
      label: "Toggle AI assistant",
      shortcut: "Ctrl+\\",
      icon: <Sparkles size={14} />,
      group: "AI",
      action: onToggleAi,
    },
    {
      id: "clear",
      label: "Clear editor content",
      icon: <Trash2 size={14} />,
      group: "Danger",
      action: () => {
        if (window.confirm("Clear all content? This cannot be undone.")) {
          /* cleared via action chain in FileEditor */
        }
      },
    },
  ];
}

// ── Styled components ──────────────────────────────────────────────────────

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: ${T.bgOverlay};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  z-index: ${T.zPalette};
`;

const Palette = styled(motion.div)`
  width: 560px;
  max-width: calc(100vw - 32px);
  background: ${T.bgSurface};
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rLg};
  box-shadow: ${T.shadowElevated};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid ${T.borderFaint};
`;

const SearchIcon = styled.span`
  color: ${T.textMuted};
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const PaletteInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: ${T.fontUI};
  font-size: 14px;
  color: ${T.textPrimary};

  &::placeholder {
    color: ${T.textMuted};
  }
`;

const KbdHint = styled.kbd`
  font-family: ${T.fontUI};
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: ${T.rSm};
  background: ${T.bgHover};
  border: 1px solid ${T.borderFaint};
  color: ${T.textMuted};
  flex-shrink: 0;
`;

const CommandList = styled.div`
  max-height: 340px;
  overflow-y: auto;
  padding: 6px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${T.borderSubtle}; border-radius: 4px; }
`;

const GroupLabel = styled.div`
  font-family: ${T.fontUI};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${T.textMuted};
  padding: 8px 10px 4px;
`;

const CommandItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${T.rMd};
  cursor: pointer;
  background: ${(p) => (p.$active ? T.bgHover : "transparent")};
  transition: background ${T.tFast};
`;

const CmdIcon = styled.span<{ $active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: ${T.rMd};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(p) => (p.$active ? T.accentFaint : T.bgElevated)};
  color: ${(p) => (p.$active ? T.accentHover : T.textSecondary)};
  transition: background ${T.tFast}, color ${T.tFast};
`;

const CmdLabel = styled.span`
  flex: 1;
  font-family: ${T.fontUI};
  font-size: 13.5px;
  color: ${T.textPrimary};
`;

const CmdShortcut = styled.kbd`
  font-family: ${T.fontUI};
  font-size: 11px;
  padding: 2px 7px;
  border-radius: ${T.rSm};
  background: ${T.bgHover};
  border: 1px solid ${T.borderFaint};
  color: ${T.textMuted};
  flex-shrink: 0;
`;

const EmptyMsg = styled.div`
  font-family: ${T.fontUI};
  font-size: 13px;
  color: ${T.textMuted};
  padding: 20px 16px;
  text-align: center;
`;

const PaletteFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid ${T.borderFaint};
`;

const FooterHint = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: ${T.fontUI};
  font-size: 11px;
  color: ${T.textMuted};
`;

const Kbd = styled.kbd`
  font-family: ${T.fontMono};
  font-size: 10px;
  padding: 1px 5px;
  border-radius: ${T.rSm};
  background: ${T.bgHover};
  border: 1px solid ${T.borderFaint};
  color: ${T.textSecondary};
`;

export default CommandPalette;
