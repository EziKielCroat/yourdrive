import styled from "styled-components";

export const OverviewContainer = styled.div`
    width: 60%;
    max-width: calc(100vw - 40px);
    height: 250px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 0;

    @media (max-width: 1400px) {
        width: 75%;
    }

    @media (max-width: 1200px) {
        width: 85%;
        height: auto;
        padding-top: 40px;
        padding-bottom: 40px;
    }

    @media (max-width: 968px) {
        width: 90%;
        padding-top: 30px;
        padding-bottom: 30px;
    }

    @media (max-width: 640px) {
        width: 100%;
        padding: 30px 20px;
    }
`;

export const SimpleDesc = styled.div`
    flex: 1;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 500;
    letter-spacing: -0.6px;
    line-height: 33px;
    font-style: normal;
    font-size: 24px;
    color: #94A0B8;

    @media (max-width: 1200px) {
        font-size: 22px;
        line-height: 30px;
    }

    @media (max-width: 968px) {
        font-size: 20px;
        line-height: 28px;
        flex: auto;
        margin-bottom: 15px;
    }

    @media (max-width: 640px) {
        font-size: 18px;
        line-height: 26px;
    }
`;

export const DetailDesc = styled.div`
    flex: 1;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 500;
    letter-spacing: -1.6px;
    line-height: 50px;
    font-style: normal;
    font-size: 40px;
    color: #363840;

    .desktop-break {
        display: block;
    }

    @media (max-width: 1400px) {
        font-size: 36px;
        line-height: 46px;
        letter-spacing: -1.4px;
    }

    @media (max-width: 1200px) {
        font-size: 32px;
        line-height: 42px;
        letter-spacing: -1.2px;
    }

    @media (max-width: 968px) {
        font-size: 28px;
        line-height: 38px;
        letter-spacing: -1px;
        flex: auto;
        margin-bottom: 20px;

        .desktop-break {
            display: none;
        }
    }

    @media (max-width: 640px) {
        font-size: 24px;
        line-height: 34px;
        letter-spacing: -0.8px;
    }
`;

export const ItemCont = styled.div`
    flex: 1;
    display: flex;
    width: 100%;
    gap: 20px;
    flex-wrap: wrap;

    @media (max-width: 1200px) {
        gap: 15px;
    }

    @media (max-width: 968px) {
        flex-direction: column;
        flex: auto;
        gap: 12px;
    }
`;

export const ImgCont = styled.div`
    display: flex;
    width: 100%;
    max-width: 100vw;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    overflow: hidden;

    img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    @media (max-width: 1200px) {
        padding: 30px 20px;
    }

    @media (max-width: 968px) {
        padding: 20px;
    }
`;

export const Item = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-start;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: -0.4px;
    font-size: 16px;
    color: #777A88;

    @media (max-width: 1200px) {
        font-size: 15px;
    }

    @media (max-width: 968px) {
        font-size: 16px;
        gap: 0.6rem;
    }

    @media (max-width: 640px) {
        font-size: 15px;
    }
`;