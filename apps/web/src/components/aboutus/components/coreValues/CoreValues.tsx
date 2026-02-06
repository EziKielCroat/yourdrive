import React from "react";
import { SimpleDesc, DetailDesc } from "../../../landing/components/overview/styles/overview";
import { FeaturesContainer, ImgNDescCont, ImgCont, Item, TextCont, Title, Desc, Wrap } from "../../../landing/components/features/styles/features";
import {
  PrivacyFirstIllustration,
  CrossDeviceIllustration,
  ReliabilityIllustration,
} from "../../../shared/illustrations/CoreValuesIllustrations";

const CoreValues: React.FC = () => {
    return (
        <>
            <FeaturesContainer>
                <SimpleDesc style={{ marginLeft: "5%" }}>What we stand for as a pioneer in the cloud space</SimpleDesc>
                <DetailDesc style={{ marginLeft: "5%" }}>Our Core Values</DetailDesc>
                <ImgNDescCont>
                    <Item>
                        <Title>Privacy First.</Title>
                        <ImgCont><PrivacyFirstIllustration width={406} height={280} /></ImgCont>
                        <TextCont>
                            <Wrap style={{ flexDirection: "column", alignItems: "center", marginTop: "3%" }}>
                                <Desc>Your data stays private. We don&apos;t sell</Desc>
                                <Desc>or mine your files.</Desc>
                            </Wrap>
                        </TextCont>
                    </Item>
                    <Item>
                        <Title>Cross-Device Freedom.</Title>
                        <ImgCont><CrossDeviceIllustration width={406} height={280} /></ImgCont>
                        <TextCont>
                            <Wrap style={{ flexDirection: "column", alignItems: "center", marginTop: "3%" }}>
                                <Desc>Pick up where you left off</Desc>
                                <Desc>from laptop to tablet to phone.</Desc>
                            </Wrap>
                        </TextCont>
                    </Item>
                    <Item>
                        <Title>Reliability.</Title>
                        <ImgCont><ReliabilityIllustration width={406} height={280} /></ImgCont>
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
