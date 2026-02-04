import styled from "styled-components";

export const FaqCont = styled.div`
    width: 50%;
    max-width: calc(100vw - 40px);
    min-height: 507px;
    margin: 150px auto 0;

    @media (max-width: 1400px) {
        width: 60%;
        margin-top: 120px;
    }

    @media (max-width: 1200px) {
        width: 70%;
        margin-top: 100px;
    }

    @media (max-width: 968px) {
        width: 85%;
        margin-top: 80px;
    }

    @media (max-width: 640px) {
        width: 100%;
        padding: 0 20px;
        margin-top: 60px;
    }
`;

export const QCont = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

export const Question = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    height: auto;
    width: 80%;
    margin: 1% 0;
    padding: 2% 0;
    border-bottom: 1px solid #E3E4E9;

    @media (max-width: 968px) {
        width: 90%;
        margin: 2% 0;
        padding: 3% 0;
    }

    @media (max-width: 640px) {
        width: 100%;
    }
`;

export const Wrap = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: 15px;

    @media (max-width: 640px) {
        gap: 10px;
    }
`;

export const QText = styled.div`
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 27px;
    letter-spacing: -0.96px;
    color: #363840;
    flex: 1;

    @media (max-width: 1200px) {
        font-size: 22px;
        line-height: 26px;
        letter-spacing: -0.88px;
    }

    @media (max-width: 968px) {
        font-size: 20px;
        line-height: 25px;
        letter-spacing: -0.8px;
    }

    @media (max-width: 640px) {
        font-size: 18px;
        line-height: 23px;
        letter-spacing: -0.72px;
    }
`;

export const Answear = styled.div<{ open: boolean }>`
  max-height: ${({ open }) => (open ? "600px" : "0px")};
  margin-top: ${({ open }) => (open ? "10px" : "0px")};
  overflow: hidden;
  transition: max-height 0.35s ease, margin-top 0.35s ease;
  color: #5E616E;
  font-family : 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.45px;

  @media (max-width: 1200px) {
    font-size: 17px;
    line-height: 25px;
  }

  @media (max-width: 968px) {
    font-size: 16px;
    line-height: 24px;
  }

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 22px;
  }
`;

export const FAQButton = styled.div`
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`;

export const FAQIcon = styled.img<{ open: boolean }>`
  display: inline-block;
  transition: transform 0.25s ease;
  transform: ${({ open }) => (open ? "rotate(0deg)" : "rotate(90deg)")};
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 20px;
    height: 20px;
  }
`;