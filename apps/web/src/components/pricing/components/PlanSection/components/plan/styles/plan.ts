import styled from "styled-components";
import { Link } from "@tanstack/react-router";

export const Cont = styled.div<{main: boolean}>`
    flex: 1;
    width: auto;
    aspect-ratio: 7 / 10;
    border-radius: 11.08px;
    ${({main})=>(main ? "border: 1px solid #E8E0F4;" : "border: 3px solid #1F9AFE;")}
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5%;
`;

export const BoxLink = styled(Link)`
    margin-top: 15%;
    display: block;
    text-decoration: none;
    color: inherit;
`;
export const PlanTitle = styled.div`
    width: max-content;
    text-align: center;
    color: #2E3038;
    font-size: 28px;
    line-height: 38.5px;
    letter-spacing: 0%;
`;
export const PlanPrice = styled.div`
    width: max-content;
    margin-top: 2.5%;
    color: #2E3038;
    font-size: 80px;
    line-height: 87.8px;
    letter-spacing: -4.55px;
`;
export const TimeText = styled.div`
    width: 100%;
    text-align: center;
    margin-top: 1.5%;
    color: #1F9AFE;
    font-size: 18px;
    line-height: 28.8px;
    letter-spacing: 0%;
    border-bottom: 1px solid #E8E0F4;
    padding-bottom: 3.5%;
`;
export const CapText = styled.div`
    width: 100%;
    margin-top: 7.5%;
    text-align: center;
    color: #2E3038;
    font-size: 18px;
    line-height: 18px;
    letter-spacing: 0.36px;
    
`;