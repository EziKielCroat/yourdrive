import React from "react";
import { TryoutContainer, Question, QuestionDesc, TryoutBox, TryoutBoxInstructions, TryoutBoxTextBox,TryoutBoxLimits, ImageWrapper} from "./styles/tryout";
import Image from "../../../shared/image/Image";

const Tryout: React.FC = () => {
  return (
    <>
    <TryoutContainer>
        <Question>Want to try?</Question>
        <QuestionDesc>We offer all of our users sharing without a account on our platform, so they<br />can see how easy it is to share with us.</QuestionDesc>
        <TryoutBox>
          <ImageWrapper><Image src="/SvgIcons/upload.svg" width={112} height={112}/></ImageWrapper>
          <TryoutBoxTextBox>
            <TryoutBoxInstructions>Drag-and-drop or click to upload a file</TryoutBoxInstructions>
            <TryoutBoxLimits>50 MB max*</TryoutBoxLimits>
          </TryoutBoxTextBox>
        </TryoutBox>
    </TryoutContainer>
    </>
  );
};

export default Tryout;
