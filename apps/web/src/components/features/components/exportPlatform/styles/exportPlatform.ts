import styled from 'styled-components';

export const ExportSection = styled.section`
  width: 100%;
  max-width: 100vw;
  padding: 100px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 80px 0px;
  }

  @media (max-width: 480px) {
    padding: 60px 0px;
  }
`;

export const ExportContainer = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    padding: 0 4%;
  }

  @media (max-width: 768px) {
    padding: 0 3%;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

export const SectionHeader = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 60px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }

  @media (max-width: 480px) {
    margin-bottom: 40px;
  }
`;

export const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 44px;
  font-weight: 600;
  color: #2E3038;
  text-align: center;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
  width: 100%;
  max-width: 100%;

  @media (max-width: 1024px) {
    font-size: 38px;
  }

  @media (max-width: 768px) {
    font-size: 32px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
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

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
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
  box-sizing: border-box;
  min-height: 300px;

  @media (max-width: 768px) {
    padding: 40px 30px;
    margin-bottom: 60px;
    min-height: 250px;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
    margin-bottom: 50px;
    border-radius: 20px;
    min-height: 200px;
  }
`;

export const PreviewImage = styled.div`
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
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 24px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

export const ExportCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 1rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

export const ExportIcon = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1F9AFE;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const ExportTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 6px 0;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

export const ExportDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  text-align: center;
  width: 100%;

  @media (max-width: 480px) {
    font-size: 13px;
    line-height: 1.5;
  }
`;