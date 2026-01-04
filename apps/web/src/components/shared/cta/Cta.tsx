import React from "react";
import { HeroContainer, HeroContGrad} from "../../landing/components/hero/styles/hero";
import { CtaCont, Wrap, Text} from "./styles/cta";
import LandingButton from "../landingbutton/LandingButton";

const Cta: React.FC = () => {
  return (
    <CtaCont>
      <Wrap>
        <HeroContGrad></HeroContGrad>
      </Wrap>
      <HeroContainer style={{height:"366px", flexDirection:"column", alignItems:"center", gap:"1rem"}}>
        <Text>Your files, always in your control.</Text>
        <Text style={{color: "#667799"}}>Try YourDrive for free today.</Text>
        <LandingButton variant="ghost" size="lg" purp="register" width={"20%"}>Register Now</LandingButton>
        <div style={{marginBottom:"6%"}}></div>
      </HeroContainer>
    </CtaCont>
  );
};

export default Cta;
