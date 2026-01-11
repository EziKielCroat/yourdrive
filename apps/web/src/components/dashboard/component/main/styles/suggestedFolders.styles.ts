import styled from "styled-components";

export const Container = styled.div`
  margin-bottom: 32px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const Title = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

export const FoldersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

export const FolderCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #dadce0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

export const FolderIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #e9eef6;
  border-radius: 8px;
  flex-shrink: 0;
`;

export const FolderInfo = styled.div`
  min-width: 0;
  flex: 1;
`;

export const FolderName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FolderMeta = styled.div`
  font-size: 12px;
  color: #5f6368;
  margin-top: 2px;
`;

export const LoadingState = styled.div`
  padding: 24px;
  text-align: center;
  color: #5f6368;
  font-size: 14px;
`;

export const ErrorState = styled.div`
  padding: 24px;
  text-align: center;
  color: #d93025;
  font-size: 14px;
`;

export const EmptyState = styled.div`
  padding: 32px;
  background: #f8f9fa;
  border-radius: 8px;
  /* border: 1px dashed #dadce0; */
`;

export const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
`;

export const EmptySubtext = styled.div`
  font-size: 13px;
  color: #80868b;
  margin-top: 4px;
`;
