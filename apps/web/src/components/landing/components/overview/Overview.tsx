import React from "react";
import { OverviewContainer, SimpleDesc, ItemCont, DetailDesc, Item, ImgCont } from "./styles/overview";
import Image from "../../../shared/image/Image";

const Overview: React.FC = () => {

  return (
    <>
    <OverviewContainer>
      <SimpleDesc>Stores everything securely</SimpleDesc>
      <DetailDesc>
        Open, edit, and update documents,<br />images, videos, and more - no<br />downloads or extra software needed.
      </DetailDesc>
      <ItemCont>
        <Item><Image src="/SvgIcons/UE.svg" width={18} height={18}/>Universal Editor</Item>
        <Item><Image src="/SvgIcons/IP.svg" width={18} height={18} />Instant previews</Item>
        <Item><Image src="/SvgIcons/US.svg" width={18} height={18} />Universal Search</Item>
      </ItemCont>
    </OverviewContainer>
    <ImgCont>
        <Image src="/Images/skibidi.png" width={1116} height={550} />
    </ImgCont>
    </>
  );
};

export default Overview;
