import styled from "styled-components";

export const NavbarContainer = styled.nav`
  width: 100%;
  height: 90px;
`;

const BaseLeftSection = styled.div`
  display: flex;
  float: left;
  height: 100%;
  padding-left: 8px;
  justify-content: center;
  align-items: center;
  margin-left: clamp(8px, 2vw, 20px);
  gap: clamp(16px, 4vw, 86px);
  min-width: 0;

  img {
    max-width: min(135px, 38vw);
    width: auto;
    height: auto;
  }

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const LeftSection = BaseLeftSection;

export const LeftSectionWithMobile = styled(BaseLeftSection)`
  /* Styles are handled by NavButton component itself */
`;

export const RightSection = styled.div`
  display: flex;
  float: right;
  height: 100%;
  padding-right: 28px;
  justify-content: center;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 8px;
    padding-right: 8px;
  }
`;
