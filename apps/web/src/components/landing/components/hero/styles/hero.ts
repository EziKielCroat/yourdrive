import styled from "styled-components";

export const HeroContainer = styled.div`
    width: 100%;
    height: 650px;
    background-color: #DDE2EE;
    display: flex;
    align-items: center;
    justify-content: center;
`;
export const HeroTextCont = styled.div`
    width: 640px;
    height: 60%;
    display: flex;
    flex-direction: column;
    margin-bottom: 7%;
`;
export const GrayHeroText = styled.div`
    flex: 1;
    font-family: "Forma DJR Display";
    font-weight: 500;
    font-size: 96px;
    color: #363840;
`;
export const BlueHeroText = styled.div`
    flex: 1;
    font-family: "Forma DJR Display";
    font-weight: 500;
    font-size: 96px;
    color: #1F9AFE;
`;
export const ShortDesc = styled.div`
    flex: 1;
    font-family: "Poppins", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif";
    font-size: 23px;
    color: rgba(0, 0, 0, 0.70);
`;
export const ButtonCont = styled.div`
    display: flex;
    margin-top: 5%;
    gap: 3%;
`;
export const HeroContGrad = styled.div`
    width: 100%;
    height: 234px;

    background: linear-gradient(
    180deg,
    rgba(221,226,238,1) 0%,
    rgba(221,226,238,0.96) 20%,
    rgba(221,226,238,0.82) 40%,
    rgba(221,226,238,0.58) 60%,
    rgba(221,226,238,0.25) 80%,
    rgba(221,226,238,0.10) 90%,
    rgba(221,226,238,0) 100%
    );
    
`;
export const HeroContGradTop = styled.div`
    width: 100%;
    height: 5px;

    background: linear-gradient(
    180deg,
    rgba(221,226,238,0) 0%,
    rgba(221,226,238,0.10) 20%,
    rgba(221,226,238,0.25) 40%,
    rgba(221,226,238,0.58) 60%,
    rgba(221,226,238,0.82) 80%,
    rgba(221,226,238,0.96) 90%,
    rgba(221,226,238,1) 100%
    
    );
    
`;
