import React from "react";
import {SimpleDesc, DetailDesc} from "../overview/styles/overview";
import { FeaturesContainer, ImgNDescCont, ImgCont, Item, TextCont, Title, Desc, Wrap } from "./styles/features";
import Image from "../../../shared/image/Image";


const Features: React.FC = () => {
  return (
    <>
    <FeaturesContainer>
      <SimpleDesc style={{marginLeft: "5%"}}>Seamlessly integrated with third-party file managers</SimpleDesc>
      <DetailDesc style={{marginLeft: "5%"}}>Edit and manage files effortlessly via <span style={{color: "#0E84FF"}}>YourDrive</span></DetailDesc>
      <ImgNDescCont>
        <Item>
          <ImgCont><Image src="/Images/Backgroundskib.png" height={426} width={406} /></ImgCont>
          <TextCont>
            <Wrap>
              <Title>Unlimited Sharing.</Title>
              <Desc>You can collaborate with</Desc>
            </Wrap>
            <Desc>anyone, anywhere all while being secure.</Desc> 
          </TextCont>
        </Item>
        <Item>
          <ImgCont><Image src="/Images/Background.png" height={426} width={406} /></ImgCont>
          <TextCont>
            <Wrap>
              <Title>Live Editing.</Title>
              <Desc>You can edit any file type you have</Desc>
            </Wrap>
            <Desc>with privacy focused Artifical Inteligence.</Desc>
          </TextCont>
        </Item>
        <Item>
          <ImgCont><Image src="/Images/Background-1.png" height={426} width={406} /></ImgCont>
          <TextCont>
            <Wrap>
              <Title>Never in your way.</Title>
              <Desc>YourDrive is designed as</Desc>
            </Wrap>
            <Desc>your go to platform with the simple and affordable features.</Desc>
          </TextCont>
        </Item>
      </ImgNDescCont>
    </FeaturesContainer>
    </>
  );
};

export default Features;
