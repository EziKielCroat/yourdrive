import styled from 'styled-components';

export const CardsSection = styled.section`
  width: 100%;
  max-width: 100vw;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }

  @media (max-width: 480px) {
    padding: 2rem 0;
  }
`;

export const CardsContainer = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    padding: 0 4%;
  }

  @media (max-width: 768px) {
    padding: 0 3%;
    gap: 20px;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
    gap: 16px;
  }
`;

export const TopSection = styled.div`
  width: 100%;
  max-width: 100%;
  margin-bottom: 8px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

export const CreativeCard = styled.div`
  background: linear-gradient(180deg, #7BC3FE 0%, #9AD2FF 100%);
  border-radius: 24px;
  padding: 50px 60px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 45px 50px;
    gap: 35px;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 30px;
    gap: 24px;
  }

  @media (max-width: 480px) {
    padding: 32px 24px;
    gap: 20px;
    border-radius: 20px;
  }
`;

export const CreativeIcon = styled.div`
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 968px) {
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    font-size: 40px;
  }
`;

export const CreativeTextArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

export const CreativeTitle = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: #2E3038;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.01em;
  text-align: left;

  br {
    @media (max-width: 968px) {
      display: none;
    }
  }

  @media (max-width: 1024px) {
    font-size: 34px;
  }

  @media (max-width: 968px) {
    font-size: 28px;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }

  @media (max-width: 360px) {
    font-size: 22px;
  }
`;

export const CreativeIllustration = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;

  @media (max-width: 968px) {
    margin: 0 auto;
    min-width: auto;
  }

  div {
    @media (max-width: 480px) {
      font-size: 60px !important;
    }
  }
`;

export const UpdatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 100%;
  margin-bottom: 36px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 28px;
  }

  @media (max-width: 480px) {
    gap: 16px;
    margin-bottom: 24px;
  }
`;

interface UpdateCardProps {
  background: string;
}

export const UpdateCard = styled.div<UpdateCardProps>`
  background: ${props => props.background};
  border-radius: 20px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 180px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
    padding: 32px 28px;
    min-height: 160px;
  }

  @media (max-width: 480px) {
    padding: 28px 24px;
    min-height: 150px;
    border-radius: 16px;
  }
`;

export const UpdateBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #2E3038;
  opacity: 0.8;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 12px;
  }
`;

export const UpdateTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 16px 0;
  line-height: 1.25;
  text-align: left;

  br {
    @media (max-width: 768px) {
      display: none;
    }
  }

  @media (max-width: 768px) {
    text-align: center;
    font-size: 22px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
`;

export const UpdateLink = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: #2E3038;
  text-decoration: none;
  transition: opacity 0.2s ease;
  margin-top: auto;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const PartnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 32px;
  padding-top: 40px;
  border-top: 1px solid #DDE2EE;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-top: 32px;
  }

  @media (max-width: 480px) {
    gap: 28px;
    padding-top: 28px;
  }
`;

export const PartnerItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 2rem;
  }

  @media (max-width: 480px) {
    padding: 0 0.5rem;
    gap: 10px;
  }
`;

export const PartnerIconWrapper = styled.div`
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const PartnerTitle = styled.h4`
  font-size: 15px;
  font-weight: 500;
  color: #2E3038;
  margin: 0;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;