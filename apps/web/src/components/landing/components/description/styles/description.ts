import styled, { createGlobalStyle } from "styled-components";

export const DescCont = styled.div`
  margin: auto;
  margin-top: 160px;
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
export const Title = styled.div`
  
`;
export const BlackText = styled.div`
  font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 72px;
    line-height: 90px;
    letter-spacing: -2.88px;
    color: #2E3038;
`;
export const Desc = styled.div`
  color: #5E616E;
  margin-top: 30px;
  font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
  width: 35%;
  text-align: center;

`;
export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
  align-items: center;
`;
export const WrapText = styled.div`
  display: flex;
  width: fit-content;
`;
export const ImageWrapper = styled.div`
  margin-top: 30px;
`;