import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  background: #ffffff;
  margin-top: 120px;
`;

export const HeroSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HeroContent = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

export const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 600;
  color: #2E3038;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  max-width: 650px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const CTAButton = styled.button`
  background: #1F9AFE;
  color: white;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: #0d7dd4;
    transform: translateY(-2px);
  }
`;

export const BadgesContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto 60px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

export const SecurityBadge = styled.div`
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  color: #1F9AFE;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid #1F9AFE;
  white-space: nowrap;
`;

export const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto 100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const FeatureCard = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

export const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 12px 0;
`;

export const FeatureDescription = styled.p`
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
`;

export const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 80px;
`;

export const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 600;
  color: #2E3038;
  text-align: center;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

export const SectionDescription = styled.p`
  font-size: 17px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin: 0 auto 48px;
  max-width: 700px;
`;

export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #DDE2EE;
  border-radius: 16px;
  padding: 32px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: #1F9AFE;
    box-shadow: 0 4px 12px rgba(31, 154, 254, 0.1);
  }
`;

export const CardTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 12px 0;
`;

export const CardDescription = styled.p`
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
`;

export const ImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #DDE2EE 0%, #f0f4f8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin-bottom: 20px;
  color: #6b7280;
  text-align: center;
`;