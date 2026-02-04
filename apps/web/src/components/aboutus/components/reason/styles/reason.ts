import styled from "styled-components";

export const Title = styled.div`
  width: 100%;
  max-width: 100%;
  margin-top: 5%;
  text-align: center;
  color: #2E3038;
  font-size: 40px;
  line-height: 50px;
  letter-spacing: -1.6px;
  font-weight: 500;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    font-size: 36px;
    line-height: 46px;
    letter-spacing: -1.4px;
  }

  @media (max-width: 768px) {
    font-size: 32px;
    line-height: 42px;
    letter-spacing: -1.2px;
    margin-top: 8%;
  }

  @media (max-width: 640px) {
    font-size: 28px;
    line-height: 38px;
    letter-spacing: -1px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    line-height: 34px;
    letter-spacing: -0.8px;
    margin-top: 10%;
  }

  @media (max-width: 360px) {
    font-size: 22px;
    line-height: 30px;
  }
`;

export const ReasonCont = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 7.5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 1400px) {
    max-width: 1400px;
  }

  @media (max-width: 1024px) {
    padding: 0 5%;
  }

  @media (max-width: 768px) {
    padding: 0 4%;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

export const SubTitle = styled.div`
  width: 100%;
  max-width: 100%;
  margin-top: 1%;
  text-align: center;
  color: #94A0B8;
  font-size: 20px;
  letter-spacing: -0.96px;
  font-weight: 500;
  padding: 2.5% 1rem;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    font-size: 19px;
    letter-spacing: -0.8px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    letter-spacing: -0.7px;
    padding: 2% 1rem;
  }

  @media (max-width: 640px) {
    font-size: 17px;
    letter-spacing: -0.6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    letter-spacing: -0.5px;
    padding: 3% 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 15px;
  }
`;

export const InfoWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-top: 2%;
  box-sizing: border-box;

  @media (max-width: 1400px) {
    gap: 2.5rem;
  }

  @media (max-width: 1200px) {
    gap: 2rem;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 2.5rem;
  }

  @media (max-width: 768px) {
    gap: 2rem;
    margin-top: 3%;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
    margin-top: 4%;
  }
`;

export const TextWrapper = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  box-sizing: border-box;
  flex-shrink: 1;

  @media (max-width: 1024px) {
    max-width: 100%;
    text-align: center;
  }

  @media (max-width: 768px) {
    gap: 0.875rem;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

export const ImageWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;

  img {
    width: 100%;
    height: auto;
    max-width: 100%;
    object-fit: contain;
  }

  @media (max-width: 1400px) {
    max-width: 800px;
  }

  @media (max-width: 1200px) {
    max-width: 700px;
  }

  @media (max-width: 1024px) {
    max-width: 650px;
  }

  @media (max-width: 768px) {
    max-width: 550px;
  }

  @media (max-width: 640px) {
    max-width: 100%;
  }
`;