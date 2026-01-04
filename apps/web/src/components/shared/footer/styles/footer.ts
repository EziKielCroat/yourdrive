import styled from "styled-components";

export const BackGround = styled.div`
    width: 100%;
    height: 500px;
    background-color: #DDE2EE;
    display: flex;
    justify-content: center;
`;
export const FooterCont = styled.div`
    position: relative;
    width: 67%;
    height: 500px;
    display: flex;
    background-color: #DDE2EE;
    flex-direction: column;
`;
export const WrapperOne = styled.div`
    height: 100%;
    width: 100%;
    height: 50%;
    display: flex;
`;
export const ItemBox = styled.div`
    height: 100%;
    margin-left: 5%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 1rem;
    
`;
export const Title = styled.div`
    width: max-content;
`;
export const Link = styled.a`
  font-family : 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: -0.4px;
  color: #2E3038;
  text-decoration: none;
`;
export const SystemInfCont = styled.div`
    width: max-content;
    margin-left: 2%;

`;
export const IconWrapper = styled.div`
    margin-top: 2%;
    margin-left: 2%;
    display: flex;
    gap: 1.5rem;
`;
export const IconText = styled.div`
    margin-left: 2%;
    margin-top: 2%;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: -0.3px;
    color: #777A88;
`;
export const BottomCont = styled.div`
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-top: 1.5%;
    padding-bottom: 1.5%;
    margin-left: 2%;
    border-top: 3px #D0D7E7;
    border-style: solid;
    border-bottom: 0px;
    border-right: 0px;
    border-left: 0px;
    
    display: flex;
    justify-content: space-between;

`;
export const RightsText = styled.div`
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: -0.35px;
    color: #777A88;
`;
export const SocialsWrapper = styled.div`
    width: max-content;
    display: flex;
    gap: 0.8rem;
`;