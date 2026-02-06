import React from "react";
import styled from "styled-components";

const IllustrationWrapper = styled.div`
  width: 100%;
  max-width: 406px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  overflow: hidden;
`;

export const PrivacyFirstIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 406,
  height = 280,
}) => (
  <IllustrationWrapper style={{ width, height }}>
    <svg width="100%" height="100%" viewBox="0 0 406 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="406" height="280" fill="url(#pvGrad)" />
      <defs>
        <linearGradient id="pvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>
      {/* Shield with lock - privacy / security */}
      <g transform="translate(153, 60)">
        <path
          d="M50 8L20 24V60C20 95 35 125 50 142C65 125 80 95 80 60V24L50 8Z"
          fill="none"
          stroke="#1F9AFE"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 8L20 24V60C20 95 35 125 50 142C65 125 80 95 80 60V24L50 8Z"
          fill="#1F9AFE"
          opacity="0.08"
        />
        <rect x="32" y="55" width="36" height="28" rx="4" fill="none" stroke="#1F9AFE" strokeWidth="3" />
        <path d="M38 55V48C38 42 43 37 50 37C57 37 62 42 62 48V55" stroke="#1F9AFE" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      {/* "Private" checkmark feel - small doc with lock */}
      <g transform="translate(175, 200)">
        <rect x="0" y="0" width="56" height="40" rx="4" fill="white" stroke="#1F9AFE" strokeWidth="2" opacity="0.9" />
        <rect x="8" y="8" width="12" height="8" rx="2" fill="#1F9AFE" opacity="0.3" />
        <path d="M18 18L26 26L38 14" stroke="#1F9AFE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  </IllustrationWrapper>
);

export const CrossDeviceIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 406,
  height = 280,
}) => (
  <IllustrationWrapper style={{ width, height }}>
    <svg width="100%" height="100%" viewBox="0 0 406 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="406" height="280" fill="url(#cdGrad)" />
      <defs>
        <linearGradient id="cdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>
      {/* Laptop */}
      <g transform="translate(80, 80)">
        <rect x="0" y="0" width="120" height="75" rx="6" fill="white" stroke="#1F9AFE" strokeWidth="2" />
        <rect x="8" y="8" width="104" height="50" rx="2" fill="#f1f5f9" />
        <rect x="35" y="75" width="50" height="6" rx="2" fill="#cbd5e1" />
        <rect x="25" y="81" width="70" height="4" rx="2" fill="#94a3b8" />
      </g>
      {/* Phone */}
      <g transform="translate(200, 100)">
        <rect x="0" y="0" width="44" height="80" rx="8" fill="white" stroke="#1F9AFE" strokeWidth="2" />
        <rect x="6" y="10" width="32" height="55" rx="4" fill="#f1f5f9" />
        <circle cx="22" cy="72" r="3" fill="#94a3b8" />
      </g>
      {/* Tablet */}
      <g transform="translate(270, 70)">
        <rect x="0" y="0" width="90" height="60" rx="6" fill="white" stroke="#1F9AFE" strokeWidth="2" />
        <rect x="6" y="6" width="78" height="42" rx="2" fill="#f1f5f9" />
      </g>
      {/* Sync/cloud arcs between devices */}
      <path d="M200 140 Q260 100 320 130" stroke="#1F9AFE" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.6" />
      <path d="M200 160 Q260 200 320 170" stroke="#1F9AFE" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.6" />
    </svg>
  </IllustrationWrapper>
);

export const ReliabilityIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 406,
  height = 280,
}) => (
  <IllustrationWrapper style={{ width, height }}>
    <svg width="100%" height="100%" viewBox="0 0 406 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="406" height="280" fill="url(#relGrad)" />
      <defs>
        <linearGradient id="relGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>
      {/* Server stack - always on */}
      <g transform="translate(123, 50)">
        <rect x="0" y="0" width="160" height="42" rx="6" fill="white" stroke="#1F9AFE" strokeWidth="2" />
        <rect x="0" y="48" width="160" height="42" rx="6" fill="white" stroke="#1F9AFE" strokeWidth="2" />
        <rect x="0" y="96" width="160" height="42" rx="6" fill="white" stroke="#1F9AFE" strokeWidth="2" />
        <circle cx="20" cy="21" r="4" fill="#22c55e" />
        <circle cx="20" cy="69" r="4" fill="#22c55e" />
        <circle cx="20" cy="117" r="4" fill="#22c55e" />
        <rect x="40" y="14" width="80" height="14" rx="2" fill="#e2e8f0" />
        <rect x="40" y="62" width="90" height="14" rx="2" fill="#e2e8f0" />
        <rect x="40" y="110" width="70" height="14" rx="2" fill="#e2e8f0" />
      </g>
      {/* Checkmark / available */}
      <g transform="translate(320, 180)">
        <circle cx="40" cy="40" r="36" fill="#1F9AFE" opacity="0.15" stroke="#1F9AFE" strokeWidth="3" />
        <path d="M28 40L36 48L52 32" stroke="#1F9AFE" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  </IllustrationWrapper>
);
