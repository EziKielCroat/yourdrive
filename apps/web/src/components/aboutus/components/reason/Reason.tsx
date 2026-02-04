import React from "react";
import { 
  Title, 
  ReasonCont, 
  SubTitle, 
  InfoWrapper, 
  TextWrapper,
  ImageWrapper 
} from "./styles/reason";
import Image from "../../../shared/image/Image";
import styled from "styled-components";

const Highlight = styled.span`
  color: #0E84FF;
`;

const StyledSubTitle = styled(SubTitle)`
  padding: 0;
  margin-bottom: 1%;

  @media (max-width: 768px) {
    margin-bottom: 2%;
  }

  @media (max-width: 480px) {
    margin-bottom: 3%;
  }
`;

const TextSubTitle = styled(SubTitle)`
  font-weight: 400;
  line-height: 1.6;
  white-space: normal;
  
  br {
    @media (max-width: 1024px) {
      display: none;
    }
  }
`;

const DarkTextSubTitle = styled(TextSubTitle)`
  color: #2E3038;
`;

const Reason: React.FC = () => {
  return (
    <>
      <ReasonCont>
        <Title>
          Why We Built <Highlight>YourDrive</Highlight>
        </Title>
        <StyledSubTitle>
          Born from the frustration of scattered files
        </StyledSubTitle>
        <InfoWrapper>
          <TextWrapper>
            <TextSubTitle>
              From classrooms to startups, we've all experienced the pain of juggling too many tools and losing track of files.
            </TextSubTitle>
            <DarkTextSubTitle>
              <Highlight>YourDrive</Highlight> was created to bring everything together in one simple, private, and polished space—so you can focus on what matters, not where your files are.
            </DarkTextSubTitle>
          </TextWrapper>
          <ImageWrapper>
            <Image 
              src="./Images/skibidi.png" 
              width={878} 
              height={625}
              alt="YourDrive illustration"
            />
          </ImageWrapper>
        </InfoWrapper>
      </ReasonCont>
    </>
  );
};

export default Reason;