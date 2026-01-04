import React from "react";
import {SimpleDesc} from "../overview/styles/overview";
import Image from "../../../shared/image/Image";
import {DescCont, Title, BlackText, Desc, Wrap, WrapText, ImageWrapper} from "./styles/description"


const Description: React.FC = () => {
  return (
    <>
    <DescCont>
      <SimpleDesc>You lose track of files more than you think</SimpleDesc>
      <Title>
        <Wrap>
          <WrapText>
            <BlackText><span style={{color: "#0E84FF"}}>YourDrive</span> shows you</BlackText>
          </WrapText>
          <BlackText>where everything is</BlackText>
        </Wrap>
      </Title>
      <Desc>After every upload, edit, or share, YourDrive helps you stay in control—whether you’re working solo, collaborating with a team, or managing files across projects.</Desc>
      <ImageWrapper>
        <Image src="/Images/skibidi.png" width={1116} height={550} />
      </ImageWrapper>
    </DescCont>
    </>
    );
}

export default Description;
