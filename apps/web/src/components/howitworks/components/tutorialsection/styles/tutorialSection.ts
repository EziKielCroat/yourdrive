import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 20px;
`;

export const CardsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 400;
  color: #2c3e50;
  margin: 0 0 8px 0;
  text-align: center;
`;

export const TitleHighlight = styled.span`
  color: #3498db;
  font-weight: 400;
`;

export const CardDescription = styled.p`
  font-size: 14px;
  color: #5a6c7d;
  margin: 0 0 24px 0;
  text-align: center;
  line-height: 1.5;
`;

export const VideoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #c5c9cd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

export const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  background-color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
`;

export const IconText = styled.span`
  color: white;
  font-size: 20px;
  font-weight: 600;
`;

export const PlayButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  &:active {
    transform: scale(0.98);
  }
`;