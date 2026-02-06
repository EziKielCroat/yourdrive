import styled from "styled-components";

export const HeroContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  height: 650px;
  background-color: #dde2ee;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 1400px) {
    height: 600px;
  }

  @media (max-width: 1200px) {
    height: 550px;
  }

  @media (max-width: 968px) {
    height: auto;
    min-height: 500px;
    padding: 100px 20px 60px 20px;
  }

  @media (max-width: 640px) {
    min-height: 450px;
    padding: 90px 20px 40px 20px;
  }
`;

export const HeroTextCont = styled.div`
  width: 640px;
  max-width: 90%;
  height: 60%;
  display: flex;
  flex-direction: column;
  margin-bottom: 7%;

  @media (max-width: 1200px) {
    width: 80%;
    max-width: 600px;
  }

  @media (max-width: 968px) {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin-bottom: 0;
  }
`;

export const GrayHeroText = styled.div`
  flex: 1;
  font-family: "Forma DJR Display", sans-serif;
  font-weight: 500;
  font-size: 96px;
  color: #363840;
  line-height: 1.1;

  @media (max-width: 1400px) {
    font-size: 80px;
  }

  @media (max-width: 1200px) {
    font-size: 70px;
  }

  @media (max-width: 968px) {
    font-size: 56px;
    flex: auto;
  }

  @media (max-width: 640px) {
    font-size: 42px;
  }

  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

export const BlueHeroText = styled.div`
  flex: 1;
  font-family: "Forma DJR Display", sans-serif;
  font-weight: 500;
  font-size: 96px;
  color: #1f9afe;
  line-height: 1.1;

  @media (max-width: 1400px) {
    font-size: 80px;
  }

  @media (max-width: 1200px) {
    font-size: 70px;
  }

  @media (max-width: 968px) {
    font-size: 56px;
    flex: auto;
    margin-bottom: 20px;
  }

  @media (max-width: 640px) {
    font-size: 42px;
  }

  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

export const ShortDesc = styled.div`
  flex: 1;
  font-family:
    "Poppins", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif";
  font-size: 23px;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.5;
  margin-top: 10px;

  @media (max-width: 1200px) {
    font-size: 20px;
  }

  @media (max-width: 968px) {
    font-size: 18px;
    flex: auto;
    margin-top: 0;
    margin-bottom: 30px;
  }

  @media (max-width: 640px) {
    font-size: 16px;
    margin-bottom: 25px;
  }
`;

export const ButtonCont = styled.div`
  display: flex;
  margin-top: 5%;
  gap: 3%;

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 15px;
    margin-top: 0;
  }

  button {
    @media (max-width: 968px) {
      width: 100% !important;
    }
  }
`;

export const HeroContGrad = styled.div`
  width: 100%;
  max-width: 100vw;
  height: 234px;
  background: linear-gradient(
    180deg,
    rgba(221, 226, 238, 1) 0%,
    rgba(221, 226, 238, 0.96) 20%,
    rgba(221, 226, 238, 0.82) 40%,
    rgba(221, 226, 238, 0.58) 60%,
    rgba(221, 226, 238, 0.25) 80%,
    rgba(221, 226, 238, 0.1) 90%,
    rgba(221, 226, 238, 0) 100%
  );

  @media (max-width: 968px) {
    height: 150px;
  }

  @media (max-width: 640px) {
    height: 100px;
  }
`;

export const HeroContGradTop = styled.div`
  width: 100%;
  max-width: 100vw;
  height: 0px;
  background: linear-gradient(
    180deg,
    rgba(221, 226, 238, 1) 0%,
    rgba(221, 226, 238, 0.96) 20%,
    rgba(221, 226, 238, 0.82) 40%,
    rgba(221, 226, 238, 0.58) 60%,
    rgba(221, 226, 238, 0.25) 80%,
    rgba(221, 226, 238, 0.1) 90%,
    rgba(221, 226, 238, 0) 100%
  );

  @media (max-width: 968px) {
    margin-top: 64px;
  }
`;
