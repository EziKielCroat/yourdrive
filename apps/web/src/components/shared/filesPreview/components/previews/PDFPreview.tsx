import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PDFPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  headers?: Record<string, string>;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  headers: _headers,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, _setNumPages] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Safety net: if the browser never fires onLoad/onError on the iframe,
  // stop showing the spinner after a few seconds so the user can at least
  // interact with the built-in PDF viewer or use the open/download buttons.
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    const iframe = iframeRef.current;
    if (!isFullscreen && iframe?.requestFullscreen) {
      iframe.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(
      "Failed to load PDF. The file may be corrupted or the server rejected the request.",
    );
    onError?.("Failed to load PDF");
    setLoading(false);
  };

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to preview PDF</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download PDF
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <PDFContainer>
        {loading && (
          <LoadingOverlay>
            <Spinner />
            <p>Loading PDF...</p>
          </LoadingOverlay>
        )}
        <PDFIframe
          ref={iframeRef}
          src={url}
          title={fileName}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        />
      </PDFContainer>

      <Controls>
        <ControlGroup>
          <ControlButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut size={16} />
          </ControlButton>
          <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
          <ControlButton onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomIn size={16} />
          </ControlButton>
        </ControlGroup>

        <ControlGroup>
          {numPages && (
            <>
              <ControlButton
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft size={16} />
              </ControlButton>
              <PageInfo>
                Page{" "}
                <PageInput
                  type="number"
                  min="1"
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) =>
                    setPageNumber(
                      Math.min(
                        numPages,
                        Math.max(1, parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                />
                of {numPages}
              </PageInfo>
              <ControlButton
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight size={16} />
              </ControlButton>
            </>
          )}
        </ControlGroup>

        <ControlGroup>
          <ControlButton onClick={handleRotate}>
            <RotateCw size={16} />
          </ControlButton>
          <ControlButton onClick={handleReset}>Reset</ControlButton>
          <ControlButton onClick={handlePrint}>
            <Printer size={16} />
          </ControlButton>
          <ControlButton onClick={toggleFullscreen}>
            <Maximize2 size={16} />
          </ControlButton>
          {onDownload && (
            <ControlButton onClick={onDownload}>
              <Download size={16} />
            </ControlButton>
          )}
        </ControlGroup>
      </Controls>

      <Instructions>
        Note: PDF preview uses browser's built-in viewer. Some features may vary
        by browser.
      </Instructions>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(245, 245, 245, 0.9);
  z-index: 1;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  gap: 16px;
  background: white;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #1a73e8;
    color: white;
    
    &:hover {
      background: #0d62d9;
    }
  `
      : `
    background: white;
    color: #202124;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f8f9fa;
    }
  `}
`;

const PDFContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const PDFIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-top: 1px solid #dadce0;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dadce0;
  border-radius: 4px;
  color: #202124;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f1f3f4;
    border-color: #c4c7c5;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ZoomLevel = styled.span`
  font-size: 14px;
  min-width: 60px;
  text-align: center;
  font-weight: 500;
  color: #202124;
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5f6368;
`;

const PageInput = styled.input`
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const Instructions = styled.div`
  padding: 8px 20px;
  background: #fff8e1;
  border-top: 1px solid #ffecb3;
  font-size: 12px;
  color: #5f6368;
  text-align: center;
`;

export default PDFPreview;
