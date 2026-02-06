import React from "react";
import styled from "styled-components";

const IllustrationContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const UploadIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 200,
}) => (
  <IllustrationContainer style={{ width, height }}>
    <svg width={width} height={height} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="300" height="200" rx="8" fill="#f8f9fa" />

      {/* Drop zone */}
      <rect x="40" y="35" width="220" height="130" rx="10" fill="white" stroke="#1F9AFE" strokeWidth="2" strokeDasharray="8 6" />

      {/* Upload arrow (upward) - clear and centered */}
      <g transform="translate(150, 65)">
        <circle cx="0" cy="0" r="22" fill="#1F9AFE" opacity="0.15" />
        <path d="M0 18V0M0 0L-8 8M0 0L8 8" stroke="#1F9AFE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Small file icons entering from bottom */}
      <g transform="translate(75, 125)">
        <rect x="0" y="0" width="24" height="30" rx="3" fill="#1F9AFE" opacity="0.25" />
        <rect x="4" y="4" width="16" height="4" rx="1" fill="#1F9AFE" />
        <rect x="4" y="12" width="10" height="2" rx="1" fill="#1F9AFE" opacity="0.7" />
        <rect x="4" y="18" width="12" height="2" rx="1" fill="#1F9AFE" opacity="0.7" />
      </g>
      <g transform="translate(138, 130)">
        <rect x="0" y="0" width="24" height="30" rx="3" fill="#1F9AFE" opacity="0.25" />
        <rect x="4" y="4" width="16" height="4" rx="1" fill="#1F9AFE" />
        <rect x="4" y="12" width="10" height="2" rx="1" fill="#1F9AFE" opacity="0.7" />
        <rect x="4" y="18" width="12" height="2" rx="1" fill="#1F9AFE" opacity="0.7" />
      </g>
      <g transform="translate(201, 125)">
        <rect x="0" y="0" width="24" height="30" rx="3" fill="#1F9AFE" opacity="0.25" />
        <rect x="4" y="4" width="16" height="4" rx="1" fill="#1F9AFE" />
        <rect x="4" y="12" width="10" height="2" rx="1" fill="#1F9AFE" opacity="0.7" />
        <rect x="4" y="18" width="12" height="2" rx="1" fill="#1F9AFE" opacity="0.7" />
      </g>

      {/* Text */}
      <text x="150" y="115" fontSize="13" fill="#2E3038" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="500">
        Upload your files
      </text>
    </svg>
  </IllustrationContainer>
);

export const EditIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 200,
}) => (
  <IllustrationContainer style={{ width, height }}>
    <svg width={width} height={height} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="300" height="200" rx="8" fill="#f8f9fa" />

      {/* Document */}
      <rect x="60" y="40" width="180" height="120" rx="4" fill="white" stroke="#1F9AFE" strokeWidth="2" />

      {/* Document lines */}
      <rect x="75" y="60" width="150" height="3" rx="1" fill="#e9ecef" />
      <rect x="75" y="75" width="120" height="3" rx="1" fill="#e9ecef" />
      <rect x="75" y="90" width="140" height="3" rx="1" fill="#e9ecef" />
      <rect x="75" y="105" width="100" height="3" rx="1" fill="#e9ecef" />

      {/* Edit icon */}
      <g transform="translate(200, 70)">
        <path
          d="M15 5L20 10L10 20H5V15L15 5Z"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M12 8L17 13"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Highlighted text */}
      <rect x="75" y="120" width="80" height="8" rx="2" fill="#1F9AFE" opacity="0.3" />

      {/* Text */}
      <text x="150" y="180" fontSize="14" fill="#2E3038" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="500">
        Edit and collaborate
      </text>
    </svg>
  </IllustrationContainer>
);

export const ShareIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 200,
}) => (
  <IllustrationContainer style={{ width, height }}>
    <svg width={width} height={height} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="300" height="200" rx="8" fill="#f8f9fa" />

      {/* Central file */}
      <rect x="120" y="70" width="60" height="60" rx="4" fill="white" stroke="#1F9AFE" strokeWidth="2" />
      <rect x="130" y="80" width="40" height="5" rx="1" fill="#1F9AFE" />
      <rect x="130" y="95" width="30" height="3" rx="1" fill="#1F9AFE" opacity="0.6" />
      <rect x="130" y="105" width="35" height="3" rx="1" fill="#1F9AFE" opacity="0.6" />

      {/* Share arrows */}
      <g transform="translate(150, 130)">
        {/* Left arrow */}
        <path
          d="M-60 0L-80 -10L-80 10L-60 0Z"
          fill="#1F9AFE"
        />
        <line x1="-80" y1="0" x2="-100" y2="0" stroke="#1F9AFE" strokeWidth="2" />

        {/* Right arrow */}
        <path
          d="M60 0L80 -10L80 10L60 0Z"
          fill="#1F9AFE"
        />
        <line x1="80" y1="0" x2="100" y2="0" stroke="#1F9AFE" strokeWidth="2" />

        {/* Top arrow */}
        <path
          d="M0 -60L-10 -80L10 -80L0 -60Z"
          fill="#1F9AFE"
        />
        <line x1="0" y1="-80" x2="0" y2="-100" stroke="#1F9AFE" strokeWidth="2" />
      </g>

      {/* User icons */}
      <circle cx="50" cy="100" r="12" fill="#1F9AFE" opacity="0.2" />
      <circle cx="50" cy="95" r="6" fill="#1F9AFE" />
      <path d="M35 110 Q50 105 65 110" stroke="#1F9AFE" strokeWidth="2" fill="none" />

      <circle cx="250" cy="100" r="12" fill="#1F9AFE" opacity="0.2" />
      <circle cx="250" cy="95" r="6" fill="#1F9AFE" />
      <path d="M235 110 Q250 105 265 110" stroke="#1F9AFE" strokeWidth="2" fill="none" />

      <circle cx="150" cy="30" r="12" fill="#1F9AFE" opacity="0.2" />
      <circle cx="150" cy="25" r="6" fill="#1F9AFE" />
      <path d="M135 35 Q150 30 165 35" stroke="#1F9AFE" strokeWidth="2" fill="none" />

      {/* Text */}
      <text x="150" y="180" fontSize="14" fill="#2E3038" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="500">
        Share securely
      </text>
    </svg>
  </IllustrationContainer>
);
