import React from "react";
import { SimpleDesc, DetailDesc } from "../../../landing/components/overview/styles/overview";
import { FeaturesContainer, ImgNDescCont, ImgCont, Item, TextCont, Title, Desc, Wrap } from "../../../landing/components/features/styles/features";
import Image from "../../../shared/image/Image";


const CoreValues: React.FC = () => {
    return (
        <>
            <FeaturesContainer>
                <SimpleDesc style={{ marginLeft: "5%" }}>What we stand for as a pioneer in the cloud space</SimpleDesc>
                <DetailDesc style={{ marginLeft: "5%" }}>Our Core Values</DetailDesc>
                <ImgNDescCont>
                    <Item>
                        <Title style={{}}>Privacy First.</Title>
                        <ImgCont><Image src="/Images/Backgroundskib.png" height={426} width={406} /></ImgCont>
                        <TextCont>
                            <Wrap style={{ flexDirection: "column", alignItems: "center", marginTop: "3%" }}>
                                <Desc>YourDrive is designed with end-to-end</Desc>
                                <Desc>security at its core.</Desc>
                            </Wrap>
                        </TextCont>
                    </Item>
                    <Item>
                        <Title>Cross-Device Freedom.</Title>
                        <ImgCont><Image src="/Images/Background.png" height={426} width={406} /></ImgCont>
                        <TextCont>
                            <Wrap style={{ flexDirection: "column", alignItems: "center", marginTop: "3%" }}>
                                <Desc>Pick up where you left off</Desc>
                                <Desc>from laptop to tablet to phone.</Desc>
                            </Wrap>
                        </TextCont>
                    </Item>
                    <Item>
                        <Title>Reliability.</Title>
                        <ImgCont><Image src="/Images/Background-1.png" height={426} width={406} /></ImgCont>
                        <TextCont>
                            <Wrap style={{ flexDirection: "column", alignItems: "center", marginTop: "3%" }}>
                                <Desc>Your files are always accessible,</Desc>
                                <Desc>whenever you need them.</Desc>
                            </Wrap>
                        </TextCont>
                    </Item>
                </ImgNDescCont>
            </FeaturesContainer>
        </>
    );
};

export default CoreValues;
