import styled from "styled-components";

export const PageContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  background: #ffffff;
  overflow-x: hidden;
  padding: 0 20px;

  @media (max-width: 968px) {
    margin-top: 100px;
    padding: 0 15px;
  }

  @media (max-width: 640px) {
    margin-top: 80px;
    padding: 0 10px;
  }
`;

export const HeroSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 80px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 968px) {
    margin-bottom: 60px;
  }

  @media (max-width: 640px) {
    margin-bottom: 50px;
  }
`;

export const HeroContent = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  @media (max-width: 640px) {
    gap: 20px;
  }
`;

export const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 600;
  color: #2e3038;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.02em;

  @media (max-width: 1200px) {
    font-size: 48px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 640px) {
    font-size: 32px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 17px;
    max-width: 100%;
  }

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto 100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;

  @media (max-width: 1200px) {
    gap: 24px;
  }

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 80px;
  }

  @media (max-width: 640px) {
    margin-bottom: 60px;
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
  flex: 0 1 300px;
  max-width: 400px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 968px) {
    flex: 1 1 100%;
    max-width: 100%;
  }

  @media (max-width: 640px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
`;

export const FeatureIcon = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

export const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2e3038;
  margin: 0 0 12px 0;

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

export const FeatureDescription = styled.p`
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 80px;

  @media (max-width: 968px) {
    margin-bottom: 60px;
  }

  @media (max-width: 640px) {
    margin-bottom: 50px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 600;
  color: #2e3038;
  text-align: center;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;

  @media (max-width: 968px) {
    font-size: 32px;
  }

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 640px) {
    font-size: 24px;
    margin-bottom: 12px;
  }
`;

export const SectionDescription = styled.p`
  font-size: 17px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin: 0 auto 48px;
  max-width: 700px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 40px;
  }

  @media (max-width: 640px) {
    font-size: 15px;
    margin-bottom: 32px;
  }
`;

export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    gap: 20px;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #dde2ee;
  border-radius: 16px;
  padding: 32px;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    border-color: #1f9afe;
    box-shadow: 0 4px 12px rgba(31, 154, 254, 0.1);
  }

  @media (max-width: 640px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
`;

export const CardTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #2e3038;
  margin: 0 0 12px 0;

  @media (max-width: 640px) {
    font-size: 17px;
    margin-bottom: 10px;
  }
`;

export const CardDescription = styled.p`
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const ImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #dde2ee 0%, #f0f4f8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 20px;
  color: #6b7280;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    height: 150px;
    font-size: 12px;
    padding: 15px;
    margin-bottom: 15px;
  }
`;

export const HighlightBox = styled.div`
  max-width: 1200px;
  margin: 0 auto 80px;
  padding: 60px 40px;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border-radius: 24px;

  @media (max-width: 968px) {
    margin-bottom: 60px;
    padding: 50px 30px;
  }

  @media (max-width: 768px) {
    padding: 40px 24px;
    border-radius: 20px;
  }

  @media (max-width: 640px) {
    margin-bottom: 50px;
    padding: 32px 20px;
    border-radius: 16px;
  }
`;
