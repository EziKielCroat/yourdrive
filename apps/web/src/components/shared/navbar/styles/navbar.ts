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
  margin-left: 20px;
  gap: 86px;

  @media (max-width: 768px) {
    gap: 16px;
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
