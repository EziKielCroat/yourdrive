import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

export interface ImagePreviewProps {
  files?: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  url: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  url,
  fileName,
  files = [],
  currentIndex = 0,
  onNavigate,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const slideshowInterval = useRef<NodeJS.Timeout | null>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSlideshow = () => {
    if (!files || files.length <= 1) return;

    if (isPlaying) {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
        slideshowInterval.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      slideshowInterval.current = setInterval(() => {
        if (onNavigate && currentIndex !== undefined) {
          const nextIndex = (currentIndex + 1) % files.length;
          onNavigate(nextIndex);
        }
      }, 3000);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
      });
    };
    img.src = url;
  }, [url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      }
      if (e.key === "ArrowDown" || e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
      if (e.key === "r" || e.key === "R") {
        handleRotate();
      }
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
      if (e.key === "m" || e.key === "M") {
        setShowMetadata(!showMetadata);
      }
      if (e.key === " ") {
        e.preventDefault();
        toggleSlideshow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom, showMetadata, isPlaying]);

  useEffect(() => {
    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
      }
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <ControlsTop>
        <ControlButton onClick={handleZoomOut} title="Zoom out (-)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 13H5v-2h14v2z" fill="currentColor" />
          </svg>
        </ControlButton>
        <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
        <ControlButton onClick={handleZoomIn} title="Zoom in (+)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </ControlButton>
        <Separator />
        <ControlButton onClick={handleRotate} title="Rotate (R)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"
              fill="currentColor"
            />
          </svg>
        </ControlButton>
        <ControlButton onClick={handleReset} title="Reset view">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
              fill="currentColor"
            />
          </svg>
        </ControlButton>
        <Separator />
        <ControlButton onClick={toggleFullscreen} title="Fullscreen (F)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {isFullscreen ? (
              <path
                d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                fill="currentColor"
              />
            ) : (
              <path
                d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                fill="currentColor"
              />
            )}
          </svg>
        </ControlButton>
        <ControlButton
          onClick={() => setShowMetadata(!showMetadata)}
          title="Metadata (M)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              fill="currentColor"
            />
          </svg>
        </ControlButton>
        {files && files.length > 1 && (
          <>
            <Separator />
            <ControlButton onClick={toggleSlideshow} title="Slideshow (Space)">
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              )}
            </ControlButton>
          </>
        )}
      </ControlsTop>

      <ImageContainer
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        $isDragging={isDragging}
        $canDrag={zoom > 1}
      >
        <StyledImage
          ref={imageRef}
          src={url}
          alt={fileName}
          $zoom={zoom}
          $rotation={rotation}
          $positionX={position.x}
          $positionY={position.y}
        />
      </ImageContainer>

      {showMetadata && metadata && (
        <MetadataPanel>
          <MetadataTitle>Image Information</MetadataTitle>
          <MetadataRow>
            <MetadataLabel>Dimensions:</MetadataLabel>
            <MetadataValue>
              {metadata.width} x {metadata.height}
            </MetadataValue>
          </MetadataRow>
          <MetadataRow>
            <MetadataLabel>Aspect Ratio:</MetadataLabel>
            <MetadataValue>{metadata.aspectRatio}</MetadataValue>
          </MetadataRow>
          <MetadataRow>
            <MetadataLabel>File Name:</MetadataLabel>
            <MetadataValue>{fileName}</MetadataValue>
          </MetadataRow>
        </MetadataPanel>
      )}

      <KeyboardHints>
        <Hint>+/- Zoom</Hint>
        <Hint>R Rotate</Hint>
        <Hint>F Fullscreen</Hint>
        <Hint>M Metadata</Hint>
        {files && files.length > 1 && <Hint>Space Slideshow</Hint>}
      </KeyboardHints>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #202124;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ControlsTop = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 24px;
  backdrop-filter: blur(8px);
  z-index: 10;
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ZoomLevel = styled.span`
  color: white;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 4px;
`;

const ImageContainer = styled.div<{ $isDragging: boolean; $canDrag: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) =>
    props.$canDrag ? (props.$isDragging ? "grabbing" : "grab") : "default"};
  overflow: hidden;
`;

const StyledImage = styled.img<{
  $zoom: number;
  $rotation: number;
  $positionX: number;
  $positionY: number;
}>`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transform: scale(${(props) => props.$zoom})
    rotate(${(props) => props.$rotation}deg)
    translate(
      ${(props) => props.$positionX / props.$zoom}px,
      ${(props) => props.$positionY / props.$zoom}px
    );
  transition: transform 0.1s ease-out;
  user-select: none;
  pointer-events: none;
`;

const MetadataPanel = styled.div`
  position: absolute;
  top: 80px;
  right: 16px;
  background: rgba(0, 0, 0, 0.85);
  padding: 16px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  z-index: 10;
  min-width: 250px;
`;

const MetadataTitle = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const MetadataRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const MetadataLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
`;

const MetadataValue = styled.span`
  color: white;
  font-size: 13px;
  text-align: right;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const KeyboardHints = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
`;

const Hint = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
`;

export default ImagePreview;
