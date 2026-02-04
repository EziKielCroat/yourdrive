import styled from 'styled-components';

export const HeroSection = styled.section`
  width: 100%;
  min-height: 67vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #DDE2EE 0%, #ffffff 100%);
  
`;

export const HeroContainer = styled.div`
  max-width: 900px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: 0 auto;
`;

export const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
`;

export const BadgeText = styled.span`
  color: #2E3038;
  font-weight: 400;
`;

export const BadgeLink = styled.a`
  color: #1F9AFE;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #0d7dd4;
  }
`;

export const HeroTitle = styled.h1`
  font-size: 68px;
  font-weight: 600;
  color: #2E3038;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.02em;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 42px;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 17px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0 auto;
  max-width: 680px;
  font-weight: 400;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 15px;
    padding: 0 20px;
  }
`;

export const CTAButton = styled.button`
  background: #1F9AFE;
  color: white;
  font-size: 15px;
  font-weight: 500;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 10px auto 0;
  display: block;

  &:hover {
    background: #0d7dd4;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;