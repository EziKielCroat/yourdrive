import styled from "styled-components";
import { Link } from "@tanstack/react-router";

export const Cont = styled.div<{main: boolean}>`
  flex: 1;
  width: auto;
  aspect-ratio: 7 / 11;
  border-radius: 11.08px;
  ${({main}) => (main ? "border: 1px solid #E8E0F4;" : "border: 3px solid #1F9AFE;")}
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5%;
  box-sizing: border-box;
  min-width: 280px;

  @media (max-width: 1024px) {
    aspect-ratio: auto;
    min-height: 700px;
    max-width: 450px;
    width: 100%;
  }

  @media (max-width: 480px) {
    min-width: 0;
    min-height: 650px;
  }
`;

export const BoxLink = styled(Link)`
  margin-top: auto;
  display: block;
  text-decoration: none;
  color: inherit;
`;

export const PlanTitle = styled.div`
  width: max-content;
  text-align: center;
  color: #2E3038;
  font-size: 28px;
  line-height: 38.5px;
  letter-spacing: 0%;

  @media (max-width: 480px) {
    font-size: 26px;
    line-height: 36px;
  }
`;

export const PlanPrice = styled.div`
  width: max-content;
  margin-top: 2.5%;
  color: #2E3038;
  font-size: 80px;
  line-height: 87.8px;
  letter-spacing: -4.55px;

  @media (max-width: 480px) {
    font-size: 72px;
    line-height: 80px;
    letter-spacing: -4px;
  }
`;

export const TimeText = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 1.5%;
  color: #1F9AFE;
  font-size: 18px;
  line-height: 28.8px;
  letter-spacing: 0%;
  border-bottom: 1px solid #E8E0F4;
  padding-bottom: 3.5%;

  @media (max-width: 480px) {
    font-size: 17px;
    line-height: 26px;
  }
`;

export const CapText = styled.div`
  width: 100%;
  margin-top: 7.5%;
  text-align: center;
  color: #2E3038;
  font-size: 18px;
  line-height: 18px;
  letter-spacing: 0.36px;

  @media (max-width: 480px) {
    font-size: 17px;
  }
`;