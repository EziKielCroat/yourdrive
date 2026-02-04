import styled from "styled-components";

export const TryoutContainer = styled.div`
    width: 70%;
    max-width: calc(100vw - 40px);
    display: flex;
    height: 580px;
    flex-direction: column;
    margin: 130px auto 0;

    @media (max-width: 1400px) {
        width: 75%;
        margin-top: 100px;
    }

    @media (max-width: 1200px) {
        width: 85%;
        height: auto;
        margin-top: 80px;
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

export const Question = styled.div`
    text-align: center;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 40px;
    line-height: 50px;
    letter-spacing: -1.6px;
    color: #363840;

    @media (max-width: 1200px) {
        font-size: 36px;
        line-height: 46px;
    }

    @media (max-width: 968px) {
        font-size: 32px;
        line-height: 42px;
    }

    @media (max-width: 640px) {
        font-size: 28px;
        line-height: 38px;
    }
`;

export const QuestionDesc = styled.div`
    text-align: center;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 33px;
    letter-spacing: -0.6px;
    color: #94A0B8;
    margin-bottom: 35px;

    .desktop-break {
        display: block;
    }

    @media (max-width: 1200px) {
        font-size: 18px;
        line-height: 30px;
    }

    @media (max-width: 968px) {
        font-size: 16px;
        line-height: 26px;
        margin-bottom: 30px;

        .desktop-break {
            display: none;
        }
    }

    @media (max-width: 640px) {
        font-size: 15px;
        line-height: 24px;
        margin-bottom: 25px;
    }
`;

export const TryoutBox = styled.div`
    background-color: #BBC5DD;
    width: 100%;
    height: 407px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #aab4cc;
    }

    @media (max-width: 1200px) {
        height: 380px;
        border-radius: 20px;
    }

    @media (max-width: 968px) {
        height: 350px;
        border-radius: 18px;
    }

    @media (max-width: 640px) {
        height: 320px;
        border-radius: 16px;
    }
`;

export const TryoutBoxTextBox = styled.div`
    background-color: #EEEFF1;
    width: 90%;
    height: 18%;
    min-height: 70px;
    border-radius: 12px;
    align-items: center;
    padding: 0 3%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 2%;

    @media (max-width: 968px) {
        width: 85%;
        padding: 15px 3%;
        flex-direction: column;
        gap: 5px;
        height: auto;
        min-height: 80px;
    }

    @media (max-width: 640px) {
        width: 90%;
        border-radius: 10px;
    }
`;

export const TryoutBoxInstructions = styled.div`
    text-align: center;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
    color: #2E3038;

    @media (max-width: 1200px) {
        font-size: 18px;
        line-height: 25px;
    }

    @media (max-width: 968px) {
        font-size: 16px;
        line-height: 22px;
    }

    @media (max-width: 640px) {
        font-size: 15px;
        line-height: 20px;
    }
`;

export const TryoutBoxLimits = styled.div`
    text-align: center;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
    color: #5E616E;

    @media (max-width: 1200px) {
        font-size: 18px;
        line-height: 25px;
    }

    @media (max-width: 968px) {
        font-size: 16px;
        line-height: 22px;
    }

    @media (max-width: 640px) {
        font-size: 15px;
        line-height: 20px;
    }
`;

export const ImageWrapper = styled.div`
    width: auto;
    height: auto;
    margin-top: 7%;

    img {
        max-width: 100%;
        height: auto;
        
        @media (max-width: 968px) {
            width: 90px;
            height: 90px;
        }

        @media (max-width: 640px) {
            width: 80px;
            height: 80px;
        }
    }
`;