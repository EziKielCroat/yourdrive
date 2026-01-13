import React from "react";
import { NavbarContainer, NContLeft, NavLink, NavLinkCont, NContRight } from "./styles/navbar_main";
import Image from "../image/Image";
import LandingButton from "../landingbutton/LandingButton";
import { useAuthStore } from "../../../store/authStore";
import {
  Link,
} from "@tanstack/react-router";

type NavbarMainProps = {
    
};

const Navbar_main: React.FC<NavbarMainProps> = () => {
  const isLoggedIn = () => {
    return useAuthStore.getState().isAuthenticated;
  };

  return (
    <>
    <NavbarContainer>
        <NContLeft>
          <Image src="/logo.svg" alt="Logo" width={135} height={90} />
          <NavLinkCont>
            <NavLink><Link to="/aboutus">About Us</Link></NavLink>
            <NavLink><Link to="/pricing">Pricing</Link></NavLink>
            <NavLink><Link to="/howitworks">How It Works</Link></NavLink>
            <NavLink><Link to="/helpcenter">Help Center</Link></NavLink>
          </NavLinkCont>
        </NContLeft>
        <NContRight>
          {!isLoggedIn() ? (<>
            <LandingButton variant="primary" size="sm" purp="register">Register</LandingButton>
            <LandingButton variant="secondary" size="sm" purp="login">Login</LandingButton>
          </>) : (<>
            <LandingButton variant="secondary" size="sm" purp="dashboard">Dashboard</LandingButton>
          </>)
          }
        </NContRight>
    </NavbarContainer>
    </>
  );
};

export default Navbar_main;
