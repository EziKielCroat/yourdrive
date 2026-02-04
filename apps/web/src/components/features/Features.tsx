import React from "react";
import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
import Hero from "./components/hero/Hero";
import FeaturesPart from "./components/featuresPart/FeaturesPart";
import ExportPlatform from "./components/exportPlatform/ExportPlatform";
import CardsSection from "./components/cardsSection/CardsSection";

const Features: React.FC = () => {
  return (
    <>
    <Navbar_main/>
    <HeroContGradTop /> 
    
    <Hero />
    <FeaturesPart />
    <ExportPlatform />
    <CardsSection />

    <HeroContGrad style={{transform: "rotate(180deg)"}} />
    <Footer/>
    </>
  );
};

export default Features;
