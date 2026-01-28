import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
`;

export const Title = styled.h1`
  font-family: "Forma DJR Display";
    font-weight: 500;
    font-size: 96px;
    color: #363840;
  margin: 0 0 16px 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 40px;
  }

  @media (max-width: 480px) {
    font-size: 32px;
  }
`;

export const Highlight = styled.span`
  color: #3498db;
  font-weight: 400;
`;

export const Subtitle = styled.p`
  font-size: 18px;
  color: #5a6c7d;
  margin: 0;
  text-align: center;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;