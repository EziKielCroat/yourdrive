import styled from "styled-components";

export const FeaturesContainer = styled.div`
    width: 70%;
    max-width: calc(100vw - 40px);
    height: auto;
    min-height: 700px;
    margin: 7% auto 0;

    @media (max-width: 1400px) {
        width: 75%;
        margin-top: 6%;
    }

    @media (max-width: 1200px) {
        width: 85%;
        margin-top: 5%;
        min-height: auto;
    }

    @media (max-width: 968px) {
        width: 90%;
        margin-top: 60px;
    }

    @media (max-width: 640px) {
        width: 100%;
        padding: 0 20px;
        margin-top: 50px;
    }
`;

export const ImgNDescCont = styled.div`
    width: 100%;
    height: auto;
    min-height: 500px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 3%;
    gap: 20px;

    @media (max-width: 1200px) {
        gap: 15px;
        min-height: auto;
    }

    @media (max-width: 968px) {
        flex-direction: column;
        align-items: center;
        gap: 40px;
        margin-top: 40px;
    }
`;

export const Item = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    max-width: 406px;

    @media (max-width: 968px) {
        max-width: 100%;
        width: 100%;
    }
`;

export const ImgCont = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    overflow: hidden;

    img {
        max-width: 100%;
        height: auto;
        display: block;
    }
`;

export const Title = styled.div`
    width: max-content;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
    color: #2E3038;

    @media (max-width: 1200px) {
        font-size: 19px;
        line-height: 26px;
    }

    @media (max-width: 968px) {
        font-size: 20px;
        line-height: 27.5px;
    }

    @media (max-width: 640px) {
        font-size: 18px;
        line-height: 25px;
    }
`;

export const Desc = styled.div`
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
    color: #5E616E;
    display: flex;
    justify-content: center;
    text-align: center;

    @media (max-width: 1200px) {
        font-size: 18px;
        line-height: 25px;
    }

    @media (max-width: 968px) {
        font-size: 18px;
        line-height: 26px;
    }

    @media (max-width: 640px) {
        font-size: 16px;
        line-height: 23px;
    }
`;

export const TextCont = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 15px;

    @media (max-width: 968px) {
        align-items: center;
    }
`;

export const Wrap = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    gap: 1ch;
    flex-wrap: wrap;

    @media (max-width: 640px) {
        gap: 0.5ch;
    }
`;