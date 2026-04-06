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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 148px), 1fr));
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
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

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 12px;
  padding: 0;

  &:hover {
    background-color: #f1f3f4;
  }

  &:active {
    background-color: #e8eaed;
  }
`;

export const BackIcon = styled.span`
  font-size: 20px;
  color: #5f6368;
  line-height: 1;
`;

export const PreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 500;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px 0;
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FolderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:active {
    background-color: #f1f3f4;
  }
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:active {
    background-color: #f1f3f4;
  }
`;

export const FileIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const FileIcon = styled.span`
  font-size: 20px;
  line-height: 1;
`;

export const FileDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

export const ItemName = styled.span`
  font-size: 14px;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

export const FileSize = styled.span`
  font-size: 12px;
  color: #5f6368;
  flex-shrink: 0;
`;
