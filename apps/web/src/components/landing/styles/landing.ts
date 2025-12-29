import { createGlobalStyle } from "styled-components";

export const GlobalReset = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
    height: auto;        /* prevents scroll locking */
    overflow-x: hidden;  /* stop horizontal scroll */
    overflow-y: auto;   /* allow vertical scroll */
  }
`;
