import { createGlobalStyle } from "styled-components";

export const GlobalReset = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    overflow-x: hidden;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  @font-face {
    font-family: "Forma DJR Display";
    src: url("/fonts/FormaDJRDisplay-Bold-Testing.woff2") format("woff2"),
         url("/fonts/FormaDJRDisplay-Bold-Testing.woff") format("woff");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;
