import React from "react";
import styled from "styled-components";

const IllustrationContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  overflow: hidden;
`;

export const DragDropIllustration: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 900, height = 400 }) => (
  <IllustrationContainer style={{ width, height }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="900" height="400" fill="url(#grad1)" />
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Upload area */}
      <rect
        x="200"
        y="100"
        width="500"
        height="200"
        rx="16"
        fill="white"
        stroke="#1F9AFE"
        strokeWidth="3"
        strokeDasharray="8 8"
        opacity="0.8"
      />

      {/* Cloud upload icon - positioned above text */}
      <g transform="translate(420, 120)">
        <path
          d="M30 25C30 20.5817 26.4183 17 22 17C19.0132 17 16.4175 18.7257 15 21.2048C12.7909 20.4237 10.0791 21.3601 8.5 23.5C6.92086 25.6399 6.92086 28.6101 8.5 30.75C9.07914 31.5 9.75 32.125 10.5 32.625"
          stroke="#1F9AFE"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M15 25L22 18L29 25"
          stroke="#1F9AFE"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M22 18V30"
          stroke="#1F9AFE"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* File icons */}
      <g transform="translate(250, 220)">
        <rect
          x="0"
          y="0"
          width="40"
          height="50"
          rx="4"
          fill="#1F9AFE"
          opacity="0.2"
        />
        <rect x="5" y="5" width="30" height="8" rx="2" fill="#1F9AFE" />
        <rect
          x="5"
          y="18"
          width="20"
          height="3"
          rx="1"
          fill="#1F9AFE"
          opacity="0.6"
        />
        <rect
          x="5"
          y="25"
          width="25"
          height="3"
          rx="1"
          fill="#1F9AFE"
          opacity="0.6"
        />
      </g>

      <g transform="translate(320, 220)">
        <rect
          x="0"
          y="0"
          width="40"
          height="50"
          rx="4"
          fill="#1F9AFE"
          opacity="0.2"
        />
        <rect x="5" y="5" width="30" height="8" rx="2" fill="#1F9AFE" />
        <rect
          x="5"
          y="18"
          width="20"
          height="3"
          rx="1"
          fill="#1F9AFE"
          opacity="0.6"
        />
        <rect
          x="5"
          y="25"
          width="25"
          height="3"
          rx="1"
          fill="#1F9AFE"
          opacity="0.6"
        />
      </g>

      {/* Progress bar */}
      <rect x="250" y="320" width="400" height="8" rx="4" fill="#e9ecef" />
      <rect x="250" y="320" width="280" height="8" rx="4" fill="#1F9AFE" />
      <text
        x="660"
        y="328"
        fontSize="14"
        fill="#6b7280"
        fontFamily="Inter, sans-serif"
      >
        70%
      </text>

      {/* Text */}
      <text
        x="450"
        y="180"
        fontSize="18"
        fill="#2E3038"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="500"
      >
        Drag and drop files here
      </text>
      <text
        x="450"
        y="210"
        fontSize="14"
        fill="#6b7280"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
      >
        or click to browse
      </text>
    </svg>
  </IllustrationContainer>
);

export const ShieldLockIllustration: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 800, height = 300 }) => (
  <IllustrationContainer style={{ width, height }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 800 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient */}
      <rect width="800" height="300" fill="url(#grad2)" />
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Shield - centered and larger */}
      <g transform="translate(300, 30)">
        <path
          d="M50 10L25 20L25 50C25 70 35 90 50 100C65 90 75 70 75 50L75 20L50 10Z"
          fill="none"
          stroke="#1F9AFE"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 10L25 20L25 50C25 70 35 90 50 100C65 90 75 70 75 50L75 20L50 10Z"
          fill="#1F9AFE"
          opacity="0.1"
        />

        {/* Lock inside shield */}
        <g transform="translate(35, 45)">
          <rect
            x="0"
            y="15"
            width="30"
            height="25"
            rx="3"
            fill="none"
            stroke="#1F9AFE"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 15V10C5 6.68629 7.68629 4 11 4H19C22.3137 4 25 6.68629 25 10V15"
            stroke="#1F9AFE"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15" cy="27" r="2" fill="#1F9AFE" />
        </g>
      </g>

      {/* Encryption lines - better positioned */}
      <g transform="translate(150, 160)">
        <path
          d="M0 0L120 0"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <path
          d="M0 15L120 15"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <path
          d="M0 30L120 30"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      </g>

      <g transform="translate(530, 160)">
        <path
          d="M0 0L120 0"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <path
          d="M0 15L120 15"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <path
          d="M0 30L120 30"
          stroke="#1F9AFE"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      </g>

      {/* Text - positioned below shield */}
      <text
        x="400"
        y="220"
        fontSize="20"
        fill="#2E3038"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="600"
      >
        Secure storage
      </text>
      <text
        x="400"
        y="250"
        fontSize="14"
        fill="#6b7280"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
      >
        Access controls and secure infrastructure for your files
      </text>
    </svg>
  </IllustrationContainer>
);

export const SelfHostIllustration: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 900, height = 300 }) => (
  <IllustrationContainer style={{ width, height }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="300" fill="url(#grad3)" />
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Server icon (left) */}
      <g transform="translate(200, 100)">
        <rect
          x="0"
          y="0"
          width="120"
          height="100"
          rx="8"
          fill="white"
          stroke="#1F9AFE"
          strokeWidth="3"
        />
        <rect
          x="10"
          y="15"
          width="100"
          height="8"
          rx="2"
          fill="#1F9AFE"
          opacity="0.3"
        />
        <rect
          x="10"
          y="30"
          width="80"
          height="8"
          rx="2"
          fill="#1F9AFE"
          opacity="0.3"
        />
        <rect
          x="10"
          y="45"
          width="90"
          height="8"
          rx="2"
          fill="#1F9AFE"
          opacity="0.3"
        />
        <circle cx="110" cy="75" r="8" fill="#1F9AFE" />
        <text
          x="60"
          y="95"
          fontSize="12"
          fill="#6b7280"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
        >
          Self-Hosted
        </text>
      </g>

      {/* VS text */}
      <text
        x="450"
        y="160"
        fontSize="24"
        fill="#6b7280"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="600"
      >
        VS
      </text>

      {/* Cloud icon (right) */}
      <g transform="translate(580, 100)">
        <path
          d="M60 30C60 25.5817 56.4183 22 52 22C49.0132 22 46.4175 23.7257 45 26.2048C42.7909 25.4237 40.0791 26.3601 38.5 28.5C36.9209 30.6399 36.9209 33.6101 38.5 35.75C39.0791 36.5 39.75 37.125 40.5 37.625"
          stroke="#1F9AFE"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="45" cy="45" r="15" fill="#1F9AFE" opacity="0.1" />
        <circle cx="60" cy="50" r="12" fill="#1F9AFE" opacity="0.1" />
        <circle cx="75" cy="45" r="15" fill="#1F9AFE" opacity="0.1" />
        <text
          x="60"
          y="95"
          fontSize="12"
          fill="#6b7280"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
        >
          Managed
        </text>
      </g>

      {/* Equal sign below */}
      <text
        x="450"
        y="250"
        fontSize="16"
        fill="#1F9AFE"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="600"
      >
        Same Privacy-First Experience
      </text>
    </svg>
  </IllustrationContainer>
);

export const ShareLinkIllustration: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 900, height = 400 }) => (
  <IllustrationContainer style={{ width, height }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="400" fill="url(#grad4)" />
      <defs>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Dialog box */}
      <rect
        x="200"
        y="80"
        width="500"
        height="240"
        rx="12"
        fill="white"
        stroke="#1F9AFE"
        strokeWidth="2"
      />

      {/* Title */}
      <text
        x="450"
        y="120"
        fontSize="20"
        fill="#2E3038"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="600"
      >
        Share File
      </text>

      {/* Link input */}
      <rect
        x="230"
        y="150"
        width="440"
        height="40"
        rx="6"
        fill="#f8f9fa"
        stroke="#d0d7e7"
        strokeWidth="1"
      />
      <text
        x="250"
        y="175"
        fontSize="14"
        fill="#6b7280"
        fontFamily="Inter, sans-serif"
      >
        https://nexacore.app/shared/abc123...
      </text>
      <rect x="650" y="155" width="10" height="30" rx="2" fill="#1F9AFE" />

      {/* Options */}
      <circle
        cx="250"
        cy="230"
        r="8"
        fill="white"
        stroke="#1F9AFE"
        strokeWidth="2"
      />
      <circle cx="250" cy="230" r="4" fill="#1F9AFE" />
      <text
        x="275"
        y="236"
        fontSize="14"
        fill="#2E3038"
        fontFamily="Inter, sans-serif"
      >
        Password protected
      </text>

      <circle
        cx="250"
        cy="260"
        r="8"
        fill="white"
        stroke="#d0d7e7"
        strokeWidth="2"
      />
      <text
        x="275"
        y="266"
        fontSize="14"
        fill="#2E3038"
        fontFamily="Inter, sans-serif"
      >
        Expires in 7 days
      </text>

      {/* Copy button */}
      <rect x="300" y="290" width="300" height="40" rx="6" fill="#1F9AFE" />
      <text
        x="450"
        y="315"
        fontSize="16"
        fill="white"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="500"
      >
        Copy Link
      </text>
    </svg>
  </IllustrationContainer>
);

export const TeamPermissionsIllustration: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 900, height = 400 }) => (
  <IllustrationContainer style={{ width, height }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="400" fill="url(#grad5)" />
      <defs>
        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Panel */}
      <rect
        x="150"
        y="60"
        width="600"
        height="280"
        rx="12"
        fill="white"
        stroke="#1F9AFE"
        strokeWidth="2"
      />

      {/* Title */}
      <text
        x="450"
        y="100"
        fontSize="20"
        fill="#2E3038"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        fontWeight="600"
      >
        Team Permissions
      </text>

      {/* User rows */}
      <g transform="translate(180, 130)">
        <circle cx="20" cy="20" r="15" fill="#1F9AFE" opacity="0.2" />
        <text
          x="20"
          y="26"
          fontSize="12"
          fill="#1F9AFE"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="600"
        >
          JD
        </text>
        <text
          x="50"
          y="26"
          fontSize="14"
          fill="#2E3038"
          fontFamily="Inter, sans-serif"
        >
          John Doe
        </text>
        <rect
          x="250"
          y="10"
          width="80"
          height="20"
          rx="4"
          fill="#1F9AFE"
          opacity="0.1"
        />
        <text
          x="290"
          y="25"
          fontSize="12"
          fill="#1F9AFE"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="500"
        >
          Owner
        </text>
      </g>

      <g transform="translate(180, 180)">
        <circle cx="20" cy="20" r="15" fill="#1F9AFE" opacity="0.2" />
        <text
          x="20"
          y="26"
          fontSize="12"
          fill="#1F9AFE"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="600"
        >
          JS
        </text>
        <text
          x="50"
          y="26"
          fontSize="14"
          fill="#2E3038"
          fontFamily="Inter, sans-serif"
        >
          Jane Smith
        </text>
        <rect
          x="250"
          y="10"
          width="80"
          height="20"
          rx="4"
          fill="#1F9AFE"
          opacity="0.1"
        />
        <text
          x="290"
          y="25"
          fontSize="12"
          fill="#1F9AFE"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="500"
        >
          Editor
        </text>
      </g>

      <g transform="translate(180, 230)">
        <circle cx="20" cy="20" r="15" fill="#1F9AFE" opacity="0.2" />
        <text
          x="20"
          y="26"
          fontSize="12"
          fill="#1F9AFE"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="600"
        >
          AB
        </text>
        <text
          x="50"
          y="26"
          fontSize="14"
          fill="#2E3038"
          fontFamily="Inter, sans-serif"
        >
          Alex Brown
        </text>
        <rect x="250" y="10" width="80" height="20" rx="4" fill="#e9ecef" />
        <text
          x="290"
          y="25"
          fontSize="12"
          fill="#6b7280"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="500"
        >
          Viewer
        </text>
      </g>
    </svg>
  </IllustrationContainer>
);

export const CodeEditorIllustration: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 900, height = 350 }) => (
  <IllustrationContainer style={{ width, height }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="350" fill="url(#grad6)" />
      <defs>
        <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Editor window */}
      <rect
        x="150"
        y="50"
        width="600"
        height="250"
        rx="8"
        fill="#1e1e1e"
        stroke="#1F9AFE"
        strokeWidth="2"
      />

      {/* Tabs */}
      <rect
        x="160"
        y="60"
        width="100"
        height="30"
        rx="4 4 0 0"
        fill="#2d2d2d"
      />
      <text
        x="210"
        y="80"
        fontSize="12"
        fill="#ffffff"
        fontFamily="monospace"
        textAnchor="middle"
      >
        app.js
      </text>

      {/* Code lines */}
      <g transform="translate(170, 110)">
        <text x="0" y="0" fontSize="14" fill="#569cd6" fontFamily="monospace">
          function
        </text>
        <text x="80" y="0" fontSize="14" fill="#dcdcaa" fontFamily="monospace">
          {" "}
          uploadFile
        </text>
        <text x="180" y="0" fontSize="14" fill="#ffffff" fontFamily="monospace">
          (file) {"{"}
        </text>
      </g>

      <g transform="translate(190, 140)">
        <text x="0" y="0" fontSize="14" fill="#ce9178" fontFamily="monospace">
          {" "}
          return
        </text>
        <text x="70" y="0" fontSize="14" fill="#ffffff" fontFamily="monospace">
          {" "}
          api.post(
        </text>
        <text x="150" y="0" fontSize="14" fill="#ce9178" fontFamily="monospace">
          &apos;/upload&apos;
        </text>
        <text x="220" y="0" fontSize="14" fill="#ffffff" fontFamily="monospace">
          , file);
        </text>
      </g>

      <g transform="translate(170, 170)">
        <text x="0" y="0" fontSize="14" fill="#ffffff" fontFamily="monospace">
          {"}"}
        </text>
      </g>

      {/* Syntax highlighting indicators */}
      <rect x="160" y="200" width="4" height="80" fill="#1F9AFE" />
    </svg>
  </IllustrationContainer>
);
