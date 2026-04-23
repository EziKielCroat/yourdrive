import styled from "styled-components";

export const NavbarContainer = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  position: relative;
  z-index: 1000;
  padding: 0 5%;

  @media (max-width: 1280px) {
    padding: 0 4%;
  }

  @media (max-width: 1100px) {
    position: fixed;
    top: 0;
    left: 0;
    padding: 0 20px;
  }
`;

export const NContLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;

  @media (max-width: 1100px) {
    flex: 1;
    justify-content: center;
  }
`;

export const NavLinkCont = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  gap: 2px;

  @media (max-width: 1280px) {
    gap: 0;
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;

export const NavLink = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.3px;
  color: #2E3038;
  white-space: nowrap;

  @media (max-width: 1280px) {
    font-size: 14px;
  }

  a {
    color: #2E3038;
    text-decoration: none;
    position: relative;
    padding: 10px 13px;
    white-space: nowrap;

    @media (max-width: 1280px) {
      padding: 8px 10px;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0%;
      height: 2px;
      background-color: #1F9AFE;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 60%;
    }
  }
`;

export const NContRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 1280px) {
    gap: 0.6rem;
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;

export const HamburgerButton = styled.button<{ $isOpen: boolean }>`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  flex-shrink: 0;

  &:focus {
    outline: none;
  }

  @media (max-width: 1100px) {
    display: flex;
  }
`;

export const HamburgerLine = styled.div<{ $isOpen: boolean }>`
  width: 30px;
  height: 3px;
  background-color: #2E3038;
  border-radius: 10px;
  transition: all 0.3s ease;
  transform-origin: center;

  &:nth-child(1) {
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(45deg) translateY(10px)' : 'rotate(0)'};
  }

  &:nth-child(2) {
    opacity: ${({ $isOpen }) => ($isOpen ? '0' : '1')};
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(-20px)' : 'translateX(0)')};
  }

  &:nth-child(3) {
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(-45deg) translateY(-10px)' : 'rotate(0)'};
  }
`;

export const Overlay = styled.div`
  display: none;

  @media (max-width: 1100px) {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 64px);
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 1100px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 64px;
    right: 0;
    width: 280px;
    max-width: 85%;
    height: calc(100vh - 64px);
    background-color: #ffffff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    transform: ${({ $isOpen }) =>
      $isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s ease;
    z-index: 999;
    padding: 24px 0;
    overflow-y: auto;
  }
`;

export const MobileNavLink = styled.div`
  width: 100%;
  padding: 16px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 17px;
  line-height: 24px;
  color: #2E3038;
  border-bottom: 1px solid #f0f0f0;

  a {
    color: #2E3038;
    text-decoration: none;
    display: block;
    width: 100%;

    &:hover { color: #1F9AFE; }
    &:active { color: #0d7dd4; }
  }
`;

export const MobileButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;

  button {
    width: 100%;
    min-height: 50px !important;
    font-size: 16px !important;
    padding: 12px 24px !important;
  }
`;
