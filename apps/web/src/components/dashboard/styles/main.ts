import styled from "styled-components";

export const MainContainer = styled.main`
  flex: 1;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
`;

export const EmptyStateWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  color: #363840;
`;

export const EmptyStateTitle = styled.h1`
  font-size: 20px;
  color: #363840;
  margin-top: 20px;
  margin-bottom: 0;
`;

export const EmptyStateDescription = styled.p`
  font-size: 13px;
  font-weight: 400;
  color: #363840;
  padding-top: 0;
`;
