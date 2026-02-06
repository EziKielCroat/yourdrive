import React, { useState, useEffect } from "react";
import styled from "styled-components";

interface OfficePreviewProps {
  url: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const OfficePreview: React.FC<OfficePreviewProps> = ({ url, fileName }) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extension = fileName.split(".").pop()?.toLowerCase();
  const isPresentation = ["ppt", "pptx", "odp"].includes(extension || "");
  const isSpreadsheet = ["xls", "xlsx", "ods"].includes(extension || "");
  const isDocument = ["doc", "docx", "odt"].includes(extension || "");

  const getMicrosoftViewerUrl = () => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url,
    )}`;
  };

  const viewerUrl = getMicrosoftViewerUrl();

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(
      "Failed to load document. Try opening it in a new tab or downloading the file.",
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <Container>
      <Toolbar>
        <LeftGroup>
          <FileTypeIndicator
            $type={
              isPresentation
                ? "presentation"
                : isSpreadsheet
                  ? "spreadsheet"
                  : "document"
            }
          >
            {isPresentation ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                  fill="currentColor"
                />
              </svg>
            ) : isSpreadsheet ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                  fill="currentColor"
                />
              </svg>
            )}
            <span>{extension?.toUpperCase()}</span>
          </FileTypeIndicator>
        </LeftGroup>

        <ToolbarGroup>
          {isPresentation && (
            <>
              <PageNav>
                <NavButton
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                      fill="currentColor"
                    />
                  </svg>
                </NavButton>
                <PageDisplay>
                  <PageInput
                    type="number"
                    value={currentPage}
                    onChange={(e) =>
                      setCurrentPage(parseInt(e.target.value) || 1)
                    }
                    min="1"
                  />
                </PageDisplay>
                <NavButton onClick={() => setCurrentPage(currentPage + 1)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                      fill="currentColor"
                    />
                  </svg>
                </NavButton>
              </PageNav>
              <Divider />
            </>
          )}

          <ToolButton onClick={handleZoomOut} title="Zoom out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 13H5v-2h14v2z" fill="currentColor" />
            </svg>
          </ToolButton>
          <ZoomDisplay>{zoom}%</ZoomDisplay>
          <ToolButton onClick={handleZoomIn} title="Zoom in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                fill="currentColor"
              />
            </svg>
          </ToolButton>

          <Divider />

          <ToolButton onClick={handlePrint} title="Print">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
                fill="currentColor"
              />
            </svg>
          </ToolButton>

          <ToolButton
            onClick={() => window.open(url, "_blank")}
            title="Open in new tab"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
                fill="currentColor"
              />
            </svg>
          </ToolButton>
        </ToolbarGroup>
      </Toolbar>

      <ViewerContainer>
        {loading && (
          <LoadingOverlay>
            <LoadingSpinner />
            <LoadingText>Loading document...</LoadingText>
          </LoadingOverlay>
        )}

        {error && (
          <ErrorOverlay>
            <ErrorIcon>⚠</ErrorIcon>
            <ErrorText>{error}</ErrorText>
            <RetryButton
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              Try Again
            </RetryButton>
          </ErrorOverlay>
        )}

        <ViewerFrame
          src={viewerUrl}
          title={fileName}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            width: `${100 / (zoom / 100)}%`,
            height: `${100 / (zoom / 100)}%`,
          }}
        />
      </ViewerContainer>

      <InfoBar>
        <InfoText>
          {isPresentation && "Presentation Mode"}
          {isSpreadsheet && "Spreadsheet View"}
          {isDocument && "Document View"}
        </InfoText>
        <InfoText>Powered by Microsoft Office Online</InfoText>
      </InfoBar>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  flex-shrink: 0;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FileTypeIndicator = styled.div<{
  $type: "presentation" | "spreadsheet" | "document";
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${(props) => {
    if (props.$type === "presentation") return "#fbbc04";
    if (props.$type === "spreadsheet") return "#34a853";
    return "#4285f4";
  }};
  color: white;
  font-size: 13px;
  font-weight: 500;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: #5f6368;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;

const PageDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageInput = styled.input`
  width: 40px;
  padding: 4px 8px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: #1a73e8;
  }
`;

const ToolButton = styled.button`
  background: transparent;
  border: none;
  color: #5f6368;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ZoomDisplay = styled.span`
  font-size: 13px;
  color: #5f6368;
  min-width: 45px;
  text-align: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
`;

const ViewerContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
  background: white;

  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f3f4;
  }

  &::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #c1c3c7;
  }
`;

const ViewerFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: #5f6368;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #d93025;
  text-align: center;
  max-width: 400px;
`;

const RetryButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f1f3f4;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
`;

const InfoText = styled.span`
  font-size: 12px;
  color: #5f6368;
`;

export default OfficePreview;
