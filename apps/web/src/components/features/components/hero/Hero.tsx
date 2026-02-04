import React from 'react';
import {
  HeroSection,
  HeroContainer,
  HeroTitle,
  HeroSubtitle,
} from './styles/hero';
import LandingButton from '../../../shared/landingbutton/LandingButton';

const Hero: React.FC = () => {
  return (
    <HeroSection>
      <HeroContainer>
        <HeroTitle>
          Store. Share.<br />
          Edit.
        </HeroTitle>
        
        <HeroSubtitle>
          From designs to animations to handoff, Jitter bundles every
          step of your motion design workflow so that your team can
          focus on what matters — creating.
        </HeroSubtitle>
        
        <LandingButton variant="primary" size="lg" purp="register">Get Started</LandingButton>
      </HeroContainer>
    </HeroSection>
  );
};

export default Hero;