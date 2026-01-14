import React from "react";
import styled from "styled-components";

interface UnsupportedStateProps {
  fileName: string;
  fileType: string;
}

const UnsupportedState: React.FC<UnsupportedStateProps> = ({
  fileName,
  fileType,
}) => {
  return (
    <Container>
      <IconContainer>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
            fill="currentColor"
          />
        </svg>
      </IconContainer>
      <Title>Preview Not Available</Title>
      <Description>
        Preview is not supported for this file type ({fileType || "unknown"}).
      </Description>
      <FileName>{fileName}</FileName>
      <Suggestion>
        You can download the file to view it with an appropriate application.
      </Suggestion>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8f9fa;
`;

const IconContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    color: #9e9e9e;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0 0 8px 0;
  text-align: center;
  max-width: 500px;
`;

const FileName = styled.p`
  font-size: 14px;
  color: #80868b;
  margin: 0 0 24px 0;
  font-family: monospace;
  background: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  max-width: 500px;
  word-break: break-all;
`;

const Suggestion = styled.p`
  font-size: 14px;
  color: #5f6368;
  margin: 0;
  text-align: center;
  max-width: 400px;
`;

export default UnsupportedState;
