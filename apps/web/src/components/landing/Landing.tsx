import React from "react";
import Hero from "./components/hero/Hero";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Overview from "./components/overview/Overview";
import Tryout from "./components/tryout/Tryout";
import Footer from "../shared/footer/Footer";
import Cta from "../shared/cta/Cta";
import Features from "./components/features/Features";
import Description from "./components/description/Description";
import Faq from "./components/faq/Faq";
import { GlobalReset } from "./styles/landing";


const LandingPage: React.FC = () => {
  return (
    <>
      <GlobalReset />
      <Navbar_main/>
      <Hero />
      <Overview />
      <Tryout />
      <Features />
      <Description />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
};

export default LandingPage;
