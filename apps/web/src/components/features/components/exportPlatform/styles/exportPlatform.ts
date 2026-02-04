import styled from 'styled-components';

export const ExportSection = styled.section`
  width: 100%;
  padding: 100px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ExportContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SectionHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 60px;
`;

export const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.h2`
  font-size: 44px;
  font-weight: 600;
  color: #2E3038;
  text-align: center;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const SectionDescription = styled.p`
  font-size: 17px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 700px;
  width: 100%;
`;

export const PreviewContainer = styled.div`
  width: 100%;
  max-width: 750px;
  margin: 0 auto 70px;
  background: #ffffff;
  border-radius: 24px;
  padding: 50px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #DDE2EE;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PreviewImage = styled.img`
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  display: block;
  margin: 0 auto;
`;

export const ExportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px 32px;
  width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const ExportCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const ExportIcon = styled.div`
  font-size: 26px;
  margin-bottom: 12px;
`;

export const ExportTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 6px 0;
  text-align: center;
  width: 100%;
`;

export const ExportDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  text-align: center;
  width: 100%;
`;