import {
  Header as StyledHeader,
  LeftSection,
  FileName,
  FileCounter,
  ActionBar,
  NavButton,
  ActionButton,
  CloseButton,
  Divider,
} from "../styles/filePreview.styles";

import ShareIcon from "../../icons/share";
import EditIcon from "../../icons/edit";

export interface HeaderProps {
  fileId?: string;
  url?: string;
  fileName: string;
  mimeType?: string;
  fileType?: string;
  files: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onDownload?: () => void;
  handleShare?: () => void;
  onRename?: () => void;
  onNavigate?: (index: number) => void;
  handleFavorite?: () => void;
  isFavorited?: boolean;
  handleDownload?: () => void;
  setShowInfo: (show: boolean) => void;
  showInfo?: boolean;
}

export const Header = ({
  fileName,
  files,
  currentIndex,
  onNavigate,
  onRename,
  handleShare,
  onClose,
  handleFavorite,
  isFavorited,
  handleDownload,
  setShowInfo,
  showInfo,
}: HeaderProps) => {
  return (
    <StyledHeader>
      <LeftSection>
        <FileName>{fileName}</FileName>
        {files.length > 1 && (
          <FileCounter>
            {currentIndex + 1} / {files.length}
          </FileCounter>
        )}
      </LeftSection>

      <ActionBar>
        {files.length > 1 && (
          <>
            <NavButton
              onClick={() => onNavigate && onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              title="Previous file (Left arrow)"
            >
              ←
            </NavButton>
            <NavButton
              onClick={() => onNavigate && onNavigate(currentIndex + 1)}
              disabled={currentIndex === files.length - 1}
              title="Next file (Right arrow)"
            >
              →
            </NavButton>
            <Divider />
          </>
        )}

        <ActionButton onClick={handleFavorite} title="Favorite">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d={
                isFavorited
                  ? "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  : "M12 17.5l-5.878 3.09 1.123-6.545L2.489 9.41l6.572-.955L12 2.5l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L12 17.5z"
              }
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isFavorited ? "currentColor" : "none"}
            />
          </svg>
        </ActionButton>

        {onRename && (
          <ActionButton onClick={onRename} title="Rename">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 10-2.621-2.621z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 15v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
        )}

        <ActionButton onClick={handleDownload} title="Download">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3v13m0 0l-4-4m4 4l4-4M5 20h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ActionButton>

        <ActionButton onClick={handleShare} title="Share">
          <ShareIcon height={20} width={20} color="currentColor" />
        </ActionButton>

        <ActionButton onClick={handleDownload} title="Edit">
          <EditIcon height={20} width={20} color="currentColor" />
        </ActionButton>

        <Divider />

        <CloseButton onClick={onClose} title="Close (Esc)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </CloseButton>
      </ActionBar>
    </StyledHeader>
  );
};
