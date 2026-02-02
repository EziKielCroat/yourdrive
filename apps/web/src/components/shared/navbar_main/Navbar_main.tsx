import React, { useState, useEffect } from "react";
import {
  NavbarContainer,
  NContLeft,
  NavLink,
  NavLinkCont,
  NContRight,
  HamburgerButton,
  HamburgerLine,
  MobileMenu,
  MobileNavLink,
  MobileButtonsContainer,
  Overlay
} from "./styles/navbar_main";
import Image from "../image/Image";
import LandingButton from "../landingbutton/LandingButton";
import { useAuthStore } from "../../../store/authStore";
import { Link } from "@tanstack/react-router";

type NavbarMainProps = {};

const Navbar_main: React.FC<NavbarMainProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = () => {
    return useAuthStore.getState().isAuthenticated;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <NavbarContainer>
        <NContLeft>
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={closeMobileMenu}
          >
            <Image src="/logo.svg" alt="Logo" width={135} height={90} />
          </Link>
          
          <NavLinkCont>
            <NavLink>
              <Link to="/aboutus">About Us</Link>
            </NavLink>
            <NavLink>
              <Link to="/pricing">Pricing</Link>
            </NavLink>
            <NavLink>
              <Link to="/howitworks">How It Works</Link>
            </NavLink>
            <NavLink>
              <Link to="/helpcenter">Help Center</Link>
            </NavLink>
          </NavLinkCont>
        </NContLeft>

        <NContRight>
          {!isLoggedIn() ? (
            <>
              <LandingButton variant="primary" size="sm" purp="register">
                Register
              </LandingButton>
              <LandingButton variant="secondary" size="sm" purp="login">
                Login
              </LandingButton>
            </>
          ) : (
            <>
              <LandingButton variant="secondary" size="sm" purp="dashboard">
                Dashboard
              </LandingButton>
            </>
          )}
        </NContRight>

        <HamburgerButton onClick={toggleMobileMenu} $isOpen={isMobileMenuOpen}>
          <HamburgerLine $isOpen={isMobileMenuOpen} />
          <HamburgerLine $isOpen={isMobileMenuOpen} />
          <HamburgerLine $isOpen={isMobileMenuOpen} />
        </HamburgerButton>
      </NavbarContainer>

      {isMobileMenuOpen && <Overlay onClick={closeMobileMenu} />}

      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavLink onClick={closeMobileMenu}>
          <Link to="/aboutus">About Us</Link>
        </MobileNavLink>
        <MobileNavLink onClick={closeMobileMenu}>
          <Link to="/pricing">Pricing</Link>
        </MobileNavLink>
        <MobileNavLink onClick={closeMobileMenu}>
          <Link to="/howitworks">How It Works</Link>
        </MobileNavLink>
        <MobileNavLink onClick={closeMobileMenu}>
          <Link to="/helpcenter">Help Center</Link>
        </MobileNavLink>

        <MobileButtonsContainer>
          {!isLoggedIn() ? (
            <>
              <LandingButton variant="primary" size="md" purp="register">
                Register
              </LandingButton>
              <LandingButton variant="secondary" size="md" purp="login">
                Login
              </LandingButton>
            </>
          ) : (
            <>
              <LandingButton variant="secondary" size="md" purp="dashboard">
                Dashboard
              </LandingButton>
            </>
          )}
        </MobileButtonsContainer>
      </MobileMenu>
    </>
  );
};

export default Navbar_main;