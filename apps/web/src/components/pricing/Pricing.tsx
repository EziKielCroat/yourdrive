import React from "react";
import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import PlanSection from "./components/PlanSection/PlanSection";
import { HeroContGrad} from "../landing/components/hero/styles/hero";

const Pricing: React.FC = () => {
  return (
    <>
    <GlobalReset />
    <Navbar_main/>
    <PlanSection />
    <HeroContGrad style={{transform: "rotate(180deg)"}} />
    <Footer/>
    </>
  );
};

export default Pricing;
