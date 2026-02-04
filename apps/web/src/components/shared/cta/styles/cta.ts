import styled from "styled-components";

export const CtaCont = styled.div`
    width: 100%;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    margin-top: 80px;
    overflow: hidden;

    @media (max-width: 968px) {
        margin-top: 60px;
    }

    @media (max-width: 640px) {
        margin-top: 50px;
    }
`;

export const Wrap = styled.div`
    transform: rotate(180deg);
    width: 100%;
`;

export const Text = styled.div`
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 28px;
    line-height: 35px;
    letter-spacing: -1.12px;
    color: #2E3038;
    text-align: center;
    padding: 0 20px;

    @media (max-width: 1200px) {
        font-size: 26px;
        line-height: 33px;
        letter-spacing: -1.04px;
    }

    @media (max-width: 968px) {
        font-size: 24px;
        line-height: 31px;
        letter-spacing: -0.96px;
    }

    @media (max-width: 640px) {
        font-size: 22px;
        line-height: 29px;
        letter-spacing: -0.88px;
    }
`;

export const ButtonWrapper = styled.div`
    width: 20%;
    display: flex;
    justify-content: center;
    margin: 0 auto;

    @media (max-width: 1200px) {
        width: 30%;
    }

    @media (max-width: 968px) {
        width: 50%;
    }

    @media (max-width: 640px) {
        width: 70%;
    }

    @media (max-width: 480px) {
        width: 90%;
    }

    button {
        width: 100%;
    }
`;