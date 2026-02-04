import React from 'react';
import { motion } from 'framer-motion';
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroTitle>
            Store. Share.<br />
            Control.
          </HeroTitle>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HeroSubtitle>
            Your files, your rules. A privacy-first cloud storage platform built for 
            speed, simplicity, and complete control. No tracking, no data mining—just 
            secure file management the way it should be.
          </HeroSubtitle>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <LandingButton variant="primary" size="lg" purp="register">
            Get Started
          </LandingButton>
        </motion.div>
      </HeroContainer>
    </HeroSection>
  );
};

export default Hero;