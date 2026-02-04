import styled from "styled-components";

export const ReasonCont = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 100px 32px;
  }

  @media (max-width: 768px) {
    padding: 80px 24px;
  }

  @media (max-width: 480px) {
    padding: 64px 20px;
  }
`;

export const Title = styled.h1`
  font-size: 56px;
  font-weight: 600;
  color: #2E3038;
  text-align: center;
  margin: 0 0 16px 0;
  line-height: 1.1;
  letter-spacing: -0.025em;

  @media (max-width: 1024px) {
    font-size: 48px;
  }

  @media (max-width: 768px) {
    font-size: 40px;
    letter-spacing: -0.02em;
  }

  @media (max-width: 480px) {
    font-size: 32px;
    line-height: 1.12;
  }
`;

export const SubTitle = styled.p`
  font-size: 20px;
  font-weight: 400;
  color: #6B7280;
  text-align: center;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.005em;

  @media (max-width: 768px) {
    font-size: 17px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const InfoWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1.3fr;
  gap: 100px;
  align-items: center;
  margin-top: 24px;

  @media (max-width: 1200px) {
    gap: 80px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 56px;
    margin-top: 32px;
  }

  @media (max-width: 768px) {
    gap: 48px;
    margin-top: 24px;
  }

  @media (max-width: 480px) {
    gap: 40px;
  }
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 20px;

  @media (max-width: 1024px) {
    order: 2;
    padding-right: 0;
    max-width: 700px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    max-width: 600px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 768px) {
    gap: 28px;
  }

  @media (max-width: 480px) {
    gap: 24px;
  }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #2E3038 0%, #1a1d23 100%);
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.06);
  aspect-ratio: 16 / 11;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 32px 64px rgba(0, 0, 0, 0.14),
      0 12px 24px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.08);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 36px;
    background: #2E3038;
    backdrop-filter: blur(20px);
    z-index: 1;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  }

  &::after {
    content: '';
    position: absolute;
    top: 13px;
    left: 16px;
    width: 12px;
    height: 12px;
    background: #FF5F57;
    border-radius: 50%;
    box-shadow: 
      20px 0 0 #FFBD2E,
      40px 0 0 #28CA42;
    z-index: 2;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 1024px) {
    order: 1;
    border-radius: 18px;
  }

  @media (max-width: 768px) {
    border-radius: 16px;
    aspect-ratio: 16 / 10;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 6px 12px rgba(0, 0, 0, 0.08);
    
    &:hover {
      transform: none;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 6px 12px rgba(0, 0, 0, 0.08);
    }
    
    &::before {
      height: 32px;
    }
  }

  @media (max-width: 480px) {
    border-radius: 12px;
    
    &::before {
      height: 28px;
      padding: 0 12px;
    }

    &::after {
      top: 10px;
      left: 12px;
      width: 10px;
      height: 10px;
      box-shadow: 
        16px 0 0 #FFBD2E,
        32px 0 0 #28CA42;
    }
  }
`;

export const ValuesSection = styled.div`
  margin-top: 120px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-top: 100px;
  }

  @media (max-width: 768px) {
    margin-top: 80px;
  }

  @media (max-width: 480px) {
    margin-top: 64px;
  }
`;

export const ValuesSubtitle = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const ValuesTitle = styled.h2`
  font-size: 48px;
  font-weight: 600;
  color: #2E3038;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.025em;

  @media (max-width: 1024px) {
    font-size: 42px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
    letter-spacing: -0.02em;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    line-height: 1.12;
  }
`;

export const Highlight = styled.span`
  color: #0E84FF;
  font-weight: 600;
`;

export const StyledSubTitle = styled(SubTitle)`
  font-size: 20px;
  font-weight: 400;
  color: #6B7280;
  margin-bottom: 64px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 1024px) {
    margin-bottom: 56px;
  }

  @media (max-width: 768px) {
    font-size: 17px;
    margin-bottom: 48px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 40px;
  }
`;

export const MainText = styled.p`
  font-size: 20px;
  font-weight: 400;
  line-height: 1.8;
  color: #6B7280;
  margin: 0 0 32px 0;
  letter-spacing: -0.005em;

  @media (max-width: 1024px) {
    text-align: center;
    font-size: 19px;
    margin: 0 0 28px 0;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    margin: 0 0 24px 0;
    line-height: 1.75;
  }

  @media (max-width: 480px) {
    font-size: 17px;
    margin: 0 0 20px 0;
  }
`;

export const HighlightText = styled.p`
  font-size: 24px;
  font-weight: 500;
  line-height: 1.6;
  color: #2E3038;
  margin: 0;
  letter-spacing: -0.015em;

  @media (max-width: 1024px) {
    text-align: center;
    font-size: 22px;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    line-height: 1.55;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;