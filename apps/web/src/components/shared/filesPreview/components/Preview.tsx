import DocumentViewer from "./previews/DocumentPreview";
import CodeEditor from "./previews/CodePreview";
import ImagePreview from "./previews/ImagePreview";
import VideoPreview from "./previews/VideoPreview";
import AudioPreview from "./previews/AudioPreview";
import UnsupportedState from "./previews/UnsupportedState";

interface PreviewRendererProps {
  type: string;
  common: {
    url: string;
    fileName: string;
    fileType: string;
    fileId?: string;
    onClose: () => void;
    onEdit?: () => void;
    onDownload?: () => void;
    onShare?: () => void;
  };
  files?: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  index?: number;
  onNavigate?: (index: number) => void;
}

export default function PreviewRenderer({
  type,
  common,
  files = [],
  index = 0,
  onNavigate,
}: PreviewRendererProps) {
  // radi polovno
  if (type === "document" || type === "office") {
    return (
      <DocumentViewer
        url={common.url}
        fileName={common.fileName}
        onEdit={common.onEdit}
        onDownload={common.onDownload}
      />
    );
  }

  // neradi
  if (type === "code") {
    return (
      <CodeEditor
        url={common.url}
        fileName={common.fileName}
        onEdit={
          common.onEdit
            ? (content) => {
                console.log("Content to save:", content);
              }
            : undefined
        }
        onDownload={common.onDownload}
      />
    );
  }

  // radi
  if (type === "image") {
    return (
      <ImagePreview
        url={common.url}
        fileName={common.fileName}
        fileType={common.fileType}
        onClose={common.onClose}
        onEdit={common.onEdit}
        onDownload={common.onDownload}
        onShare={common.onShare}
        files={files}
        currentIndex={index}
        onNavigate={onNavigate || (() => {})}
      />
    );
  }
  // neradi

  if (type === "video") {
    return <VideoPreview url={common.url} fileName={common.fileName} />;
  }
  // neradi

  if (type === "audio") {
    return <AudioPreview url={common.url} fileName={common.fileName} />;
  }

  return <UnsupportedState fileName={common.fileName} fileType={type} />;
}
