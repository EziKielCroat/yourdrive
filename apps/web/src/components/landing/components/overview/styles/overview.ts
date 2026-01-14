import styled from "styled-components";

export const OverviewContainer = styled.div`
    width: 70%;
    height: 250px;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 15%;
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
`;
export const ItemCont = styled.div`
    flex: 1;
    display: flex;
    width: 100%;
`;
export const ImgCont = styled.div`
    display: flex;
    width: auto;
    align-items: center;
`;
export const Item = styled.div`
    display: flex;
    gap: 0.2rem;
    align-items: center;
    justify-content: space-between;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: -0.4px;
    font-size: 16px;
    color: #777A88;
    margin-right: 3%;
`;
