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

export const WarningBox = styled.div`
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 24px 28px;
  margin-bottom: 48px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #92400e;
  font-weight: 500;
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 20px 24px;
    margin-bottom: 40px;
  }

  @media (max-width: 480px) {
    padding: 18px 20px;
    margin-bottom: 32px;
    font-size: 13px;
  }
`;

export const ArticleSection = styled.section`
  margin-bottom: 56px;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }

  @media (max-width: 480px) {
    margin-bottom: 40px;
  }
`;

export const ArticleTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 32px 0;
  letter-spacing: -0.01em;
  padding-bottom: 16px;
  border-bottom: 2px solid #DDE2EE;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 28px;
    padding-bottom: 14px;
  }

  @media (max-width: 480px) {
    font-size: 22px;
    margin-bottom: 24px;
    padding-bottom: 12px;
  }
`;

export const SubsectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2E3038;
  margin: 32px 0 16px 0;

  @media (max-width: 768px) {
    font-size: 17px;
    margin: 28px 0 14px 0;
  }

  @media (max-width: 480px) {
    font-size: 16px;
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

export const DefinitionList = styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    margin: 20px 0;
    gap: 16px;
  }
`;

export const DefinitionTerm = styled.dt`
  font-size: 16px;
  font-weight: 600;
  color: #1F9AFE;
  margin: 0 0 8px 0;
  word-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 6px;
  }
`;

export const DefinitionDescription = styled.dd`
  font-size: 16px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0 0 0 20px;
  text-align: justify;
  max-width: 100%;
  word-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.65;
    margin-left: 16px;
    text-align: left;
  }
`;

export const LastUpdated = styled.div`
  background: #f3f4f6;
  padding: 32px;
  border-radius: 12px;
  margin-top: 64px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  color: #2E3038;
  font-weight: 500;
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 28px;
    margin-top: 56px;
  }

  @media (max-width: 480px) {
    padding: 24px 20px;
    margin-top: 48px;
    font-size: 13px;
    border-radius: 10px;
  }
`;