import React from 'react';
import {
  ExportSection,
  ExportContainer,
  SectionHeader,
  SectionLabel,
  SectionTitle,
  SectionDescription,
  PreviewContainer,
  PreviewImage,
  ExportGrid,
  ExportCard,
  ExportIcon,
  ExportTitle,
  ExportDescription
} from './styles/exportPlatform';

const ExportPlatform: React.FC = () => {
  const exportOptions = [
    {
      icon: '🎬',
      title: 'Video',
      description: 'Export videos as .MP4, .MOV and more for all your platforms.'
    },
    {
      icon: '🖼️',
      title: 'GIF',
      description: 'Turn your animations and exports into shareable, lightweight .GIF, .PNG images.'
    },
    {
      icon: '📦',
      title: 'Lottie',
      description: 'Export to Lottie format for seamless integration into mobile and web.'
    },
    {
      icon: '📐',
      title: '4k, 120fps',
      description: 'Export with crystal clear quality in 4k resolution, up to 120 frames per second.'
    },
    {
      icon: '🎯',
      title: 'Transparent videos',
      description: 'Export videos with transparent backgrounds (.MOV and .WebM).'
    },
    {
      icon: '🖼️',
      title: 'Frame-by-frame exports',
      description: 'Export sequences of images (PNG and JPG) at seamless resolutions, ideal for email and workflows.'
    },
    {
      icon: '⚡',
      title: 'Fast renders',
      description: 'Export at insane-fast speeds with lightning-fast exports.'
    },
    {
      icon: '🔁',
      title: 'Looping options',
      description: 'Easily set looping preferences for your animated content.'
    },
    {
      icon: '📱',
      title: 'Platform-ready videos',
      description: 'Standard optimized videos, ready to share on any platform.'
    }
  ];

  return (
    <ExportSection>
      <ExportContainer>
        <SectionHeader>
          <SectionLabel>Export</SectionLabel>
          <SectionTitle>Export for any platform</SectionTitle>
          <SectionDescription>
            Quickly export animations in any format, from high-quality
            videos to world-class GIFs and lightweight Lottie files.
          </SectionDescription>
        </SectionHeader>

        <PreviewContainer>
          <PreviewImage src="/images/export-preview.png" alt="Export Preview" />
        </PreviewContainer>

        <ExportGrid>
          {exportOptions.map((option, index) => (
            <ExportCard key={index}>
              <ExportIcon>{option.icon}</ExportIcon>
              <ExportTitle>{option.title}</ExportTitle>
              <ExportDescription>{option.description}</ExportDescription>
            </ExportCard>
          ))}
        </ExportGrid>
      </ExportContainer>
    </ExportSection>
  );
};

export default ExportPlatform;