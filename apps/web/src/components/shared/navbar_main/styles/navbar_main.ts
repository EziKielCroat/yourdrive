import styled from "styled-components";

export const NavbarContainer = styled.div`
    width: 100%;
    height: 64px;
    display: flex;
`;

export const ImgCont = styled.div`
    width: "135px", 
    height: "64px", 
    overflow: "hidden",
`;

export const NContLeft = styled.div`
    width: 35%;
    height: 64px;
    margin-left: 15%;
    display: flex;
    align-items: center;
    overflow: "hidden",
`;
export const NavLink = styled.div`
  width: auto;
  margin: auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-style: normal;
  line-height: 1.5;
  font-weight: 400;

  a {
    
    color: black;
    text-decoration: none;
    
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0%;
      height: 2px;
      background-color: black;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 95%;
    }
  }
`;
export const NavLinkCont = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
`;


export const NContRight = styled.div`
    width: 45%;
    height: 64px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 5%;
    gap: 1rem;
`;