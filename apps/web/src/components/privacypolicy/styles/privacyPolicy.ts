import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  background: linear-gradient(180deg, #DDE2EE 0%, #ffffff 50%);
  overflow-x: hidden;
  box-sizing: border-box;
`;

export const HeroSection = styled.section`
  width: 100%;
  max-width: 100%;
  padding: 80px 5% 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 60px 4% 50px;
  }

  @media (max-width: 480px) {
    padding: 50px 1rem 40px;
  }
`;

export const PageTitle = styled.h1`
  font-size: 56px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
  max-width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    font-size: 48px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 32px;
    padding: 0 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 28px;
  }
`;

export const EffectiveDate = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 5% 100px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 40px 4% 80px;
  }

  @media (max-width: 480px) {
    padding: 30px 1rem 60px;
  }
`;

export const IntroSection = styled.section`
  margin-bottom: 56px;
  padding-bottom: 32px;
  border-bottom: 2px solid #DDE2EE;

  @media (max-width: 768px) {
    margin-bottom: 48px;
    padding-bottom: 28px;
  }

  @media (max-width: 480px) {
    margin-bottom: 40px;
    padding-bottom: 24px;
  }
`;

export const MainSection = styled.section`
  margin-bottom: 56px;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }

  @media (max-width: 480px) {
    margin-bottom: 40px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 24px 0;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 22px;
    margin-bottom: 18px;
  }
`;

export const SubsectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2E3038;
  margin: 32px 0 16px 0;

  @media (max-width: 768px) {
    font-size: 19px;
    margin: 28px 0 14px 0;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin: 24px 0 12px 0;
  }
`;

export const Paragraph = styled.p`
  font-size: 16px;
  line-height: 1.75;
  color: #4b5563;
  margin: 0 0 20px 0;
  text-align: justify;
  max-width: 100%;
  word-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.7;
    text-align: left;
  }
`;

export const BulletList = styled.ul`
  margin: 20px 0;
  padding-left: 24px;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding-left: 20px;
    margin: 16px 0;
  }
`;

export const BulletItem = styled.li`
  font-size: 16px;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 12px;
  word-wrap: break-word;

  &::marker {
    color: #1F9AFE;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 10px;
  }
`;

export const HighlightBox = styled.div`
  background: #e0f2fe;
  border-left: 4px solid #1F9AFE;
  padding: 24px 28px;
  margin: 48px 0;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  color: #2E3038;
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;

  strong {
    color: #1F9AFE;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 20px 24px;
    margin: 40px 0;
  }

  @media (max-width: 480px) {
    padding: 18px 20px;
    margin: 32px 0;
    font-size: 14px;
  }
`;