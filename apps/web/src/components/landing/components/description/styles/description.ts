import styled from "styled-components";

export const DescCont = styled.div`
  margin: 160px auto 0;
  width: 80%;
  max-width: calc(100vw - 40px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 1400px) {
    margin-top: 120px;
    width: 85%;
  }

  @media (max-width: 1200px) {
    margin-top: 100px;
    width: 90%;
  }

  @media (max-width: 968px) {
    margin-top: 80px;
    width: 95%;
  }

  @media (max-width: 640px) {
    margin-top: 60px;
    width: 100%;
    padding: 0 20px;
  }
`;

export const Title = styled.div`
  text-align: center;
  width: 100%;
`;

export const BlackText = styled.div`
  font-family : 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 72px;
  line-height: 90px;
  letter-spacing: -2.88px;
  color: #2E3038;
  text-align: center;

  @media (max-width: 1400px) {
    font-size: 64px;
    line-height: 80px;
    letter-spacing: -2.56px;
  }

  @media (max-width: 1200px) {
    font-size: 56px;
    line-height: 70px;
    letter-spacing: -2.24px;
  }

  @media (max-width: 968px) {
    font-size: 42px;
    line-height: 54px;
    letter-spacing: -1.68px;
  }

  @media (max-width: 640px) {
    font-size: 32px;
    line-height: 42px;
    letter-spacing: -1.28px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    line-height: 38px;
    letter-spacing: -1.12px;
  }
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

  @media (max-width: 1400px) {
    width: 45%;
    font-size: 19px;
    line-height: 26px;
  }

  @media (max-width: 1200px) {
    width: 55%;
    font-size: 18px;
    line-height: 25px;
  }

  @media (max-width: 968px) {
    width: 70%;
    font-size: 17px;
    line-height: 24px;
    margin-top: 25px;
  }

  @media (max-width: 640px) {
    width: 90%;
    font-size: 16px;
    line-height: 23px;
    margin-top: 20px;
  }
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
  align-items: center;
  margin: 0 auto;
`;

export const WrapText = styled.div`
  display: flex;
  width: fit-content;
`;

export const ImageWrapper = styled.div`
  margin-top: 30px;
  width: 100%;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  @media (max-width: 968px) {
    margin-top: 25px;
  }

  @media (max-width: 640px) {
    margin-top: 20px;
  }
`;