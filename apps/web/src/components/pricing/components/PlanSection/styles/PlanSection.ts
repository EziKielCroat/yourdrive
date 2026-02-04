import styled from "styled-components";

export const Cont = styled.div`
  width: 100%;
  max-width: 1600px;
  min-height: 1000px;
  height: auto;
  margin: 0 auto;
  margin-top: 2%;
  padding: 0 12%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 1400px) {
    padding: 0 8%;
  }

  @media (max-width: 1200px) {
    padding: 0 6%;
    min-height: auto;
  }

  @media (max-width: 1024px) {
    padding: 0 5%;
    margin-top: 4%;
  }

  @media (max-width: 768px) {
    padding: 0 4%;
    margin-top: 6%;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
    margin-top: 8%;
  }
`;

export const BlueTitle = styled.div`
  color: #1F9AFE;
  font-size: 22.16px;
  line-height: 30px;
  letter-spacing: 0%;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 20px;
    line-height: 28px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    line-height: 26px;
  }
`;

export const Title = styled.div`
  color: #2E3038;
  font-family: "Forma DJR Display";
  font-weight: 500;
  font-size: 64px;
  line-height: 72px;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0 1rem;
  box-sizing: border-box;

  br {
    @media (max-width: 768px) {
      display: none;
    }
  }

  @media (max-width: 1024px) {
    font-size: 56px;
    line-height: 64px;
  }

  @media (max-width: 768px) {
    font-size: 42px;
    line-height: 52px;
  }

  @media (max-width: 640px) {
    font-size: 36px;
    line-height: 46px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    line-height: 38px;
    padding: 0 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 24px;
    line-height: 34px;
  }
`;

export const SwitchCont = styled.div`
  width: auto;
  max-width: 100%;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  align-items: center;
  margin-top: 2rem;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 1rem;
    margin-top: 1.5rem;
  }
`;

export const PlanWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  gap: 2.5rem;
  margin-top: 5%;
  justify-content: center;
  align-items: stretch;
  box-sizing: border-box;

  @media (max-width: 1400px) {
    gap: 2rem;
  }

  @media (max-width: 1200px) {
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 2rem;
    max-width: 500px;
    margin: 5% auto 0;
  }

  @media (max-width: 768px) {
    gap: 1.5rem;
    max-width: 450px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    gap: 1.25rem;
  }
`;

export const Option = styled.div`
  color: #2E3038;
  font-size: 18px;
  line-height: 28px;
  letter-spacing: 0%;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 24px;
  }
`;