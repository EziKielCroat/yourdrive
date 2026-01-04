import styled from "styled-components";

export const NavbarContainer = styled.div`
    width: 100%;
    height: 64px;
    display: flex;
    background-color: #ffffffff;
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
  font-family : 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 14px;
  letter-spacing: -0.35px;
  color: #2E3038;

  a {
    
    color: black;
    text-decoration: none;
    
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 0%;
      height: 2px;
      background-color: #0366d6;
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