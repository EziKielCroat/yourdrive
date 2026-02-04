import React from "react";
import { motion } from "framer-motion";
import { HeroContainer, HeroContGrad} from "../../landing/components/hero/styles/hero";
import { CtaCont, Wrap, Text, ButtonWrapper} from "./styles/cta";
import LandingButton from "../landingbutton/LandingButton";

const Cta: React.FC = () => {
  return (
    <CtaCont>
      <Wrap>
        <HeroContGrad></HeroContGrad>
      </Wrap>
      <HeroContainer style={{height:"366px", flexDirection:"column", alignItems:"center", gap:"1rem"}}>
        <Text
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Your files, always in your control.
        </Text>
        <Text 
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{color: "#667799"}}
        >
          Try YourDrive for free today.
        </Text>
        <ButtonWrapper
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LandingButton variant="ghost" size="lg" purp="register">Register Now</LandingButton>
        </ButtonWrapper>
        <div style={{marginBottom:"6%"}}></div>
      </HeroContainer>
    </CtaCont>
  );
};

export default Cta;