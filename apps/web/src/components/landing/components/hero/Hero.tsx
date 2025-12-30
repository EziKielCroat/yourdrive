import React from "react";
import { HeroContainer, HeroContGrad, TestniDiv, HeroContGradTop, HeroTextCont, GrayHeroText, BlueHeroText, ShortDesc, ButtonCont } from "./styles/hero";
import LandingButton from "../../../shared/landingbutton/LandingButton";

const Hero: React.FC = () => {
  return (
    <>
    <HeroContGradTop/>
    <HeroContainer>
        <HeroTextCont>
          <GrayHeroText>It's like editing</GrayHeroText>
          <GrayHeroText>and storing</GrayHeroText>
          <BlueHeroText>mid-idea.</BlueHeroText>
          <ShortDesc>
            From class notes to client decks, YourDrive keeps it private, polished, and in your pocket.
          </ShortDesc>
          <ButtonCont>
            <LandingButton variant="primary" size="lg" purp="register" width={"44%"}>Get Started</LandingButton>
            <LandingButton variant="ghost" size="lg" purp="howitworks" width={"44%"}>See how it works</LandingButton>
          </ButtonCont>
        </HeroTextCont>
    </HeroContainer>
    <HeroContGrad/>
    <TestniDiv/>
    </>
  );
};

export default Hero;
