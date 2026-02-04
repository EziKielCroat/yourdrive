import React from "react";
import { 
  HeroContGrad, 
  HeroContainer, 
  HeroContGradTop, 
  GrayHeroText 
} from "../../../landing/components/hero/styles/hero";
import { InfoText, ButtonCont } from "./styles/heading";
import LandingButton from "../../../shared/landingbutton/LandingButton";
import styled from "styled-components";

const HeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const StyledGrayHeroText = styled(GrayHeroText)`
  margin: 0;
  margin-top: 15%;
  flex: 0;
  text-align: center;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 12%;
    padding: 0 1.5rem;
  }

  @media (max-width: 480px) {
    margin-top: 10%;
    padding: 0 1rem;
  }
`;

const ResponsiveButtonWrapper = styled.div`
  width: 44%;
  min-width: 140px;

  @media (max-width: 640px) {
    width: 100%;
    max-width: 320px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const Heading: React.FC = () => {
  return (
    <>
      <HeroContGradTop /> 
      <HeroContainer>
        <HeadingWrapper>
          <StyledGrayHeroText>About our Mission</StyledGrayHeroText>
          <InfoText>Built for the way you work, learn, and create.</InfoText>
          <ButtonCont>
            <ResponsiveButtonWrapper>
              <LandingButton 
                variant="primary" 
                size="lg" 
                purp="register" 
                width="100%"
              >
                Get Started
              </LandingButton>
            </ResponsiveButtonWrapper>
            <ResponsiveButtonWrapper>
              <LandingButton 
                variant="ghost" 
                size="lg" 
                purp="howitworks" 
                width="100%"
              >
                See how it works
              </LandingButton>
            </ResponsiveButtonWrapper>
          </ButtonCont>
        </HeadingWrapper>
      </HeroContainer>
      <HeroContGrad />
    </>
  );
};

export default Heading;