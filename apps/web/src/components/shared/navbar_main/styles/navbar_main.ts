import styled from "styled-components";

export const NavbarContainer = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  background-color: #ffffff;
  position: relative;
  z-index: 1000;

  @media (max-width: 968px) {
    height: 64px;
    justify-content: space-between;
  }
`;

export const NContLeft = styled.div`
  width: 35%;
  height: 64px;
  margin-left: 15%;
  display: flex;
  align-items: center;

  @media (max-width: 1400px) {
    margin-left: 8%;
    width: 38%;
  }

  @media (max-width: 1200px) {
    margin-left: 5%;
    width: 42%;
  }

  @media (max-width: 968px) {
    margin-left: 0;
    width: 100%;
    justify-content: center;
    padding-left: 60px;
    padding-right: 60px;
  }
`;

export const NavLinkCont = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1200px) {
    gap: 4px;
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

export const NavLink = styled.div`
  width: auto;
  margin: auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -0.35px;
  color: #2E3038;

  @media (max-width: 1400px) {
    font-size: 15px;
  }

  @media (max-width: 1200px) {
    font-size: 14px;
  }

  a {
    color: #2E3038;
    text-decoration: none;
    position: relative;
    padding: 10px 14px;
    white-space: nowrap;

    @media (max-width: 1200px) {
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
  width: 45%;
  height: 64px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5%;
  gap: 1rem;

  @media (max-width: 1400px) {
    margin-right: 4%;
    gap: 0.8rem;
  }

  @media (max-width: 1200px) {
    margin-right: 5%;
    width: auto;
  }

  @media (max-width: 968px) {
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
  margin-right: 20px;
  z-index: 1001;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);

  &:focus {
    outline: none;
  }

  @media (max-width: 968px) {
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

  @media (max-width: 968px) {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    height: calc(100vh - 64px);
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 968px) {
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

    &:hover {
      color: #1F9AFE;
    }

    &:active {
      color: #0d7dd4;
    }
  }
`;

export const MobileButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;

  button {
    width: 100%;
  }
`;