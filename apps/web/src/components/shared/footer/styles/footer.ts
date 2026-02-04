import styled from "styled-components";

export const BackGround = styled.div`
    width: 100%;
    max-width: 100vw;
    min-height: 500px;
    background-color: #DDE2EE;
    display: flex;
    justify-content: center;
    padding: 40px 0;
    overflow: hidden;
    margin-top: auto;

    @media (max-width: 968px) {
        padding: 30px 0;
    }
`;

export const FooterCont = styled.div`
    width: 67%;
    max-width: calc(100vw - 40px);
    display: flex;
    background-color: #DDE2EE;
    flex-direction: column;

    @media (max-width: 1400px) {
        width: 75%;
    }

    @media (max-width: 1200px) {
        width: 85%;
    }

    @media (max-width: 968px) {
        width: 90%;
    }

    @media (max-width: 640px) {
        width: 100%;
        padding: 0 20px;
    }
`;

export const WrapperOne = styled.div`
    width: 100%;
    display: flex;
    margin-bottom: 40px;
    gap: 20px;

    @media (max-width: 968px) {
        flex-direction: column;
        gap: 30px;
    }

    @media (max-width: 640px) {
        gap: 25px;
    }

    > div:first-child {
        img {
            max-width: 100%;
            height: auto;
        }
    }
`;

export const ItemBox = styled.div`
    height: 100%;
    margin-left: 5%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 1rem;

    @media (max-width: 968px) {
        margin-left: 0;
        gap: 0.8rem;
    }
`;

export const Title = styled.div`
    width: max-content;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: -0.4px;
    color: #2E3038;
    margin-bottom: 0.5rem;

    @media (max-width: 640px) {
        font-size: 15px;
        line-height: 20px;
    }
`;

export const Link = styled.a`
  font-family : 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: -0.4px;
  color: #2E3038;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #1F9AFE;
  }

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 20px;
  }
`;

export const SystemInfCont = styled.div`
    width: max-content;
    margin-left: 2%;
    margin-bottom: 20px;

    img {
        max-width: 100%;
        height: auto;
        
        @media (max-width: 640px) {
            max-width: 150px;
        }
    }

    @media (max-width: 968px) {
        margin-left: 0;
    }
`;

export const IconWrapper = styled.div`
    margin-top: 2%;
    margin-left: 2%;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;

    img {
        max-width: 52px;
        height: auto;
        
        @media (max-width: 640px) {
            max-width: 40px;
        }
    }

    @media (max-width: 968px) {
        margin-left: 0;
        gap: 1rem;
    }
`;

export const IconText = styled.div`
    margin-left: 2%;
    margin-top: 2%;
    margin-bottom: 30px;
    font-family : 'Inter', sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: -0.3px;
    color: #777A88;

    @media (max-width: 968px) {
        margin-left: 0;
        font-size: 11px;
        line-height: 15px;
    }
`;

export const BottomCont = styled.div`
    width: 100%;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-left: 2%;
    border-top: 3px solid #D0D7E7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    @media (max-width: 968px) {
        width: 100%;
        margin-left: 0;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    @media (max-width: 640px) {
        padding-top: 20px;
        padding-bottom: 20px;
    }
`;

export const RightsText = styled.div`
    font-family : 'Inter', sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: -0.35px;
    color: #777A88;

    @media (max-width: 640px) {
        font-size: 13px;
        line-height: 18px;
    }
`;

export const SocialsWrapper = styled.div`
    width: max-content;
    display: flex;
    gap: 0.8rem;

    img {
        transition: opacity 0.2s ease;
        cursor: pointer;
        max-width: 20px;
        height: auto;

        &:hover {
            opacity: 0.7;
        }

        @media (max-width: 640px) {
            max-width: 18px;
        }
    }

    @media (max-width: 640px) {
        gap: 0.6rem;
    }
`;