import React from "react";
import { Title, ReasonCont, SubTitle, InfoWrapper, TextWrapper } from "./styles/reason";
import Image from "../../../shared/image/Image";

const Reason: React.FC = () => {
  return (
    <>
    <ReasonCont>
        <Title>Why We Built <span style={{color: "#0E84FF"}}>YourDrive</span></Title>
        <SubTitle style={{padding: "0%", marginBottom: "1%"}}>Born from the frustration of scattered files</SubTitle>
        <InfoWrapper>
            <TextWrapper>
                <SubTitle style={{fontWeight: 400}}>
                    From classrooms to startups, we’ve all experienced the<br />
                    pain of juggling too many tools and losing track of files.
                </SubTitle>
                <SubTitle style={{fontWeight: 400, color: "#2E3038"}}>
                    <span style={{color: "#0E84FF"}}>YourDrive</span> was created to bring everything together in<br />
                    one simple, private, and polished space—so you can<br />
                    focus on what matters, not where your files are.
                </SubTitle>
            </TextWrapper>
            <Image src="./Images/skibidi.png" width={878} height={625}></Image>
        </InfoWrapper>
    </ReasonCont>
    </>
  );
};

export default Reason;
