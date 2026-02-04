import styled from "styled-components";

export const InfoText = styled.div`
  width: 100%;
  max-width: 800px;
  text-align: center;
  color: #94A0B8;
  font-size: 24px;
  line-height: 33px;
  letter-spacing: -0.6px;
  padding: 0 1rem;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    font-size: 22px;
    line-height: 30px;
    max-width: 700px;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    line-height: 28px;
    letter-spacing: -0.4px;
    max-width: 600px;
    padding: 0 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    line-height: 26px;
    letter-spacing: -0.3px;
    padding: 0 1rem;
  }

  @media (max-width: 360px) {
    font-size: 16px;
    line-height: 24px;
  }
`;

export const ButtonCont = styled.div`
  width: 100%;
  max-width: 600px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2% auto 17%;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    max-width: 550px;
    gap: 0.875rem;
  }

  @media (max-width: 768px) {
    max-width: 500px;
    gap: 0.75rem;
    margin: 3% auto 15%;
    padding: 0 1.5rem;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.875rem;
    max-width: 400px;
    margin: 4% auto 12%;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    gap: 0.75rem;
    padding: 0 1rem;
    margin: 5% auto 10%;
  }

  @media (max-width: 360px) {
    gap: 0.625rem;
    margin: 6% auto 8%;
  }
`;