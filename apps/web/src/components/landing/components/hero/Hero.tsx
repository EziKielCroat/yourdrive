import React from "react";
import { motion } from "framer-motion";
import { HeroContainer, HeroContGrad, HeroContGradTop, HeroTextCont, GrayHeroText, BlueHeroText, ShortDesc, ButtonCont } from "./styles/hero";
import LandingButton from "../../../shared/landingbutton/LandingButton";

const Hero: React.FC = () => {
  return (
    <>
    <HeroContGradTop/>
    <HeroContainer>
        <HeroTextCont
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <GrayHeroText
            as={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            It's like editing
          </GrayHeroText>
          <GrayHeroText
            as={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            and storing
          </GrayHeroText>
          <BlueHeroText
            as={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            mid-idea.
          </BlueHeroText>
          <ShortDesc
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            From class notes to client decks, YourDrive keeps it private, polished, and in your pocket.
          </ShortDesc>
          <ButtonCont
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <LandingButton variant="primary" size="lg" purp="register">Get Started</LandingButton>
            <LandingButton variant="ghost" size="lg" purp="howitworks">See how it works</LandingButton>
          </ButtonCont>
        </HeroTextCont>
    </HeroContainer>
    <HeroContGrad/>
    </>
  );
};

export default Hero;