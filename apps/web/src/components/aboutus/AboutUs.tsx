import React from "react";
import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad } from "../landing/components/hero/styles/hero";
import Heading from "./components/heading/Heading";
import Reason from "./components/reason/Reason";
import CoreValues from "./components/coreValues/CoreValues";

const AboutUs: React.FC = () => {
  return (
    <>
    <Navbar_main/>
    <Heading />
    <Reason></Reason>
    <CoreValues />
    <HeroContGrad style={{transform: "rotate(180deg)"}} />
    <Footer/>
    </>
  );
};

export default AboutUs;
