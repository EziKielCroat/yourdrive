import styled from "styled-components";

export const FaqCont = styled.div`
    width: 50%;
    min-height: 507px;
    margin: auto;
    margin-top: 150px;
`;

export const QCont = styled.div`
    
`;
export const Question = styled.div`
    display: flex;
    flex-direction: column;
    height: auto;
    width: 80%;
    margin: 2% 0% 2% 0%;
    padding: 2% 0% 2% 0%;
    border-bottom: 1px solid #E3E4E9;
`;
export const Wrap = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
`;
export const QText = styled.div`
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 27px;
    letter-spacing: -0.96px;
    color: #363840;
`;
export const Answear = styled.div<{ open: boolean }>`
  max-height: ${({ open }) => (open ? "600px" : "0px")};
  margin-top: ${({ open }) => (open ? "10px" : "0px")};
  overflow: hidden;
  transition: max-height 0.35s ease;
  transition: margin-top 0.35s ease;
  color: black;
`;
export const FAQButton = styled.div`

`;

export const FAQIcon = styled.img<{ open: boolean }>`
  display: inline-block;
  transition: transform 0.25s ease;
  transform: ${({ open }) => (open ? "rotate(0deg)" : "rotate(90deg)")};
`;
