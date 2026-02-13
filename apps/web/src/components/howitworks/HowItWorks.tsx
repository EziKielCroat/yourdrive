import React from "react";
import  Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import HeroSection from "./components/herosection/HeroSection";
import TutorialSection from "./components/tutorialsection/TutorialSection";
import { HeroContGrad } from "../landing/components/hero/styles/hero";
import Tryout from "../landing/components/tryout/Tryout";

const HowItWorks: React.FC = () => {
  return (
    <>
      <Navbar_main />
      <HeroSection />
      <TutorialSection />
      <Tryout />
      <HeroContGrad style={{transform: "rotate(180deg)"}} />
      <Footer />
    </>
  );
};

export default HowItWorks;
