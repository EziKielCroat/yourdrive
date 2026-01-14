import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface AudioPreviewProps {
  url: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ url, fileName }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!canvas || !analyser || !dataArray) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const gradient = ctx.createLinearGradient(
          0,
          canvas.height - barHeight,
          0,
          canvas.height
        );
        gradient.addColorStop(0, "#1a73e8");
        gradient.addColorStop(1, "#4285f4");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = !audio.loop;
    setIsLooping(!isLooping);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("volumechange", handleVolumeChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const initAudioContext = async () => {
      const audio = audioRef.current;
      const canvas = canvasRef.current;
      if (!audio || !canvas) return;

      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        drawWaveform();
      } catch (error) {
        console.error("Audio context error:", error);
      }
    };

    initAudioContext();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <Container>
      <audio ref={audioRef} src={url} crossOrigin="anonymous" />

      <WaveformContainer>
        <WaveformCanvas ref={canvasRef} width={800} height={200} />
      </WaveformContainer>

      <ControlsSection>
        <ProgressContainer>
          <ProgressBar
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            step="0.1"
          />
          <TimeRow>
            <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
            <TimeDisplay>{formatTime(duration)}</TimeDisplay>
          </TimeRow>
        </ProgressContainer>

        <MainControls>
          <SecondaryButton onClick={skipBackward} title="Skip back 10s">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.10-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.11-.32.04-.29.04-.48v-.97z"
                fill="currentColor"
              />
            </svg>
          </SecondaryButton>

          <PlayButton onClick={togglePlayPause}>
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            )}
          </PlayButton>

          <SecondaryButton onClick={skipForward} title="Skip forward 10s">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"
                fill="currentColor"
              />
            </svg>
          </SecondaryButton>
        </MainControls>

        <BottomControls>
          <LeftGroup>
            <VolumeContainer>
              <IconButton onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </IconButton>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
              />
            </VolumeContainer>

            <SpeedControl>
              <SpeedButton
                onClick={() => changePlaybackRate(0.5)}
                $active={playbackRate === 0.5}
              >
                0.5x
              </SpeedButton>
              <SpeedButton
                onClick={() => changePlaybackRate(1)}
                $active={playbackRate === 1}
              >
                1x
              </SpeedButton>
              <SpeedButton
                onClick={() => changePlaybackRate(1.5)}
                $active={playbackRate === 1.5}
              >
                1.5x
              </SpeedButton>
              <SpeedButton
                onClick={() => changePlaybackRate(2)}
                $active={playbackRate === 2}
              >
                2x
              </SpeedButton>
            </SpeedControl>
          </LeftGroup>

          <RightGroup>
            <IconButton onClick={toggleLoop} title="Loop" $active={isLooping}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
                  fill="currentColor"
                />
              </svg>
            </IconButton>

            <IconButton
              onClick={() => setShowLyrics(!showLyrics)}
              title="Lyrics"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                  fill="currentColor"
                />
              </svg>
            </IconButton>
          </RightGroup>
        </BottomControls>
      </ControlsSection>

      {showLyrics && (
        <LyricsPanel>
          <LyricsTitle>Lyrics</LyricsTitle>
          <LyricsContent>
            <LyricsPlaceholder>
              Lyrics not available for this track.
            </LyricsPlaceholder>
          </LyricsContent>
        </LyricsPanel>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const WaveformContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-bottom: 32px;
`;

const WaveformCanvas = styled.canvas`
  display: block;
  border-radius: 8px;
`;

const FileNameOverlay = styled.div`
  position: absolute;
  top: 32px;
  left: 32px;
  background: rgba(26, 115, 232, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(4px);
`;

const ControlsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const ProgressContainer = styled.div`
  margin-bottom: 24px;
`;

const ProgressBar = styled.input`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const TimeDisplay = styled.span`
  color: #5f6368;
  font-size: 12px;
  font-family: monospace;
`;

const MainControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const PlayButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1a73e8;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);

  &:hover {
    background: #1557b0;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SecondaryButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent;
  color: #5f6368;
  border: 1px solid #e0e0e0;
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

const BottomControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? "#e8f0fe" : "transparent")};
  border: none;
  color: ${(props) => (props.$active ? "#1a73e8" : "#5f6368")};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f1f3f4;
    color: #1a73e8;
  }
`;

const VolumeSlider = styled.input`
  width: 100px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const SpeedControl = styled.div`
  display: flex;
  gap: 4px;
  background: #f1f3f4;
  padding: 4px;
  border-radius: 20px;
`;

const SpeedButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? "white" : "transparent")};
  border: none;
  color: ${(props) => (props.$active ? "#1a73e8" : "#5f6368")};
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 4px rgba(0,0,0,0.1)" : "none"};

  &:hover {
    background: white;
    color: #1a73e8;
  }
`;

const LyricsPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 800px;
  margin-top: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const LyricsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #202124;
`;

const LyricsContent = styled.div`
  color: #5f6368;
  font-size: 14px;
  line-height: 1.8;
  max-height: 300px;
  overflow-y: auto;
`;

const LyricsPlaceholder = styled.div`
  text-align: center;
  padding: 40px;
  color: #80868b;
  font-style: italic;
`;

export default AudioPreview;
