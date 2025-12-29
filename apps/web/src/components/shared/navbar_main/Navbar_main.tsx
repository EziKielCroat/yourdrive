import React from "react";
import { NavbarContainer, NContLeft, NavLink, NavLinkCont, NContRight } from "./styles/navbar_main";
import Image from "../image/Image";
import LandingButton from "../landingbutton/LandingButton";
import { useAuthStore } from "../../../store/authStore";


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
            <NavLink><a href="/aboutus">About Us</a></NavLink>
            <NavLink><a href="/pricing">Pricing</a></NavLink>
            <NavLink><a href="/howitworks">How It Works</a></NavLink>
            <NavLink><a href="/helpcenter">Help Center</a></NavLink>
          </NavLinkCont>
        </NContLeft>
        <NContRight>
          {!isLoggedIn() ? (<>
            <LandingButton variant="primary" size="sm">Register</LandingButton>
            <LandingButton variant="secondary" size="sm">Login</LandingButton>
          </>) : (<>
            <LandingButton variant="secondary" size="sm">Dashboard</LandingButton>
          </>)
          }
        </NContRight>
    </NavbarContainer>
    </>
  );
};

export default Navbar_main;
