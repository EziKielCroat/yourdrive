import React from 'react';
import * as S from './styles/heroSection.ts';

const HeroSection: React.FC = () => {
  return (
    <S.Container>
      <S.Title>
        How <S.Highlight>YourDrive</S.Highlight> Works
      </S.Title>
      <S.Subtitle>
        From upload to collaboration, it's as simple as three steps.
      </S.Subtitle>
    </S.Container>
  );
};

export default HeroSection;