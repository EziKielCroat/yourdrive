import {
  InfoSidebar as StyledInfoSidebar,
  InfoSection,
  InfoTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
  TagsContainer,
  Tag,
  ViewerRow,
  ViewerAvatar,
  ViewerAvatarPlaceholder,
  ViewerName,
  CommentItem,
  CommentUser,
  CommentText,
  CommentTime,
  ActivityItem,
  ActivityText,
  ActivityTime,
  RelatedFileItem,
  RelatedFileName,
} from "../styles/filePreview.styles";

interface InfoSidebarProps {
  show: boolean;
  mimeType?: string;
  fileType?: string;
  detectedType?: string;
  metadata?: { size?: string; created?: string; createdAt?: string; modified?: string; updatedAt?: string };
  tags?: string[];
  viewers?: { name: string; avatar?: string }[];
  comments?: { user: string; text: string; timestamp?: string }[];
  activityLog?: { action: string; user: string; timestamp?: string }[];
  relatedFiles?: { name: string }[];
}

export const InfoSidebar = ({
  show,
  mimeType,
  fileType,
  detectedType,
  metadata = {},
  tags = [],
  viewers = [],
  comments = [],
  activityLog = [],
  relatedFiles = [],
}: InfoSidebarProps) => {
  return (
    <>
      {show && (
        <StyledInfoSidebar>
          <InfoSection>
            <InfoTitle>Details</InfoTitle>
            <InfoRow>
              <InfoLabel>Type:</InfoLabel>
              <InfoValue>{mimeType || fileType || detectedType}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Size:</InfoLabel>
              <InfoValue>{metadata?.size ?? "Unknown"}</InfoValue>
            </InfoRow>
            {(metadata?.created ?? metadata?.createdAt) != null && (
              <InfoRow>
                <InfoLabel>Created:</InfoLabel>
                <InfoValue>{String(metadata?.created ?? metadata?.createdAt)}</InfoValue>
              </InfoRow>
            )}
            <InfoRow>
              <InfoLabel>Modified:</InfoLabel>
              <InfoValue>{metadata?.modified ?? metadata?.updatedAt ?? "Unknown"}</InfoValue>
            </InfoRow>
          </InfoSection>

          {tags.length > 0 && (
            <InfoSection>
              <InfoTitle>Tags</InfoTitle>
              <TagsContainer>
                {tags.map((tag: string, idx: number) => (
                  <Tag key={idx}>{tag}</Tag>
                ))}
              </TagsContainer>
            </InfoSection>
          )}

          {viewers.length > 0 && (
            <InfoSection>
              <InfoTitle>Currently Viewing</InfoTitle>
              {viewers.map((viewer: { name: string; avatar?: string }, idx: number) => (
                <ViewerRow key={idx}>
                  {viewer.avatar ? (
                    <ViewerAvatar src={viewer.avatar} alt={viewer.name} />
                  ) : (
                    <ViewerAvatarPlaceholder>
                      {viewer.name.charAt(0).toUpperCase()}
                    </ViewerAvatarPlaceholder>
                  )}
                  <ViewerName>{viewer.name}</ViewerName>
                </ViewerRow>
              ))}
            </InfoSection>
          )}

          {comments.length > 0 && (
            <InfoSection>
              <InfoTitle>Comments</InfoTitle>
              {comments.map((comment: { user: string; text: string; timestamp?: string }, idx: number) => (
                <CommentItem key={idx}>
                  <CommentUser>{comment.user}</CommentUser>
                  <CommentText>{comment.text}</CommentText>
                  <CommentTime>{comment.timestamp}</CommentTime>
                </CommentItem>
              ))}
            </InfoSection>
          )}

          {activityLog.length > 0 && (
            <InfoSection>
              <InfoTitle>Activity</InfoTitle>
              {activityLog.map((activity: { action: string; user: string; timestamp?: string }, idx: number) => (
                <ActivityItem key={idx}>
                  <ActivityText>
                    {activity.action} by {activity.user}
                  </ActivityText>
                  <ActivityTime>{activity.timestamp}</ActivityTime>
                </ActivityItem>
              ))}
            </InfoSection>
          )}

          {relatedFiles.length > 0 && (
            <InfoSection>
              <InfoTitle>Related Files</InfoTitle>
              {relatedFiles.map((file: { name: string }, idx: number) => (
                <RelatedFileItem key={idx}>
                  <RelatedFileName>{file.name}</RelatedFileName>
                </RelatedFileItem>
              ))}
            </InfoSection>
          )}
        </StyledInfoSidebar>
      )}
    </>
  );
};
