import { createGlobalStyle } from "styled-components";

export const GlobalReset = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    overflow-x: hidden;
    width: 100vw;
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 100vw;
    min-height: 100vh;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
  }

  #root {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  @font-face {
    font-family: "Forma DJR Display";
    src: url("../../../../../../public/fonts/FormaDJRDisplay-Bold-Testing.woff2") format("woff2"),
         url("../../../../../../public/fonts/FormaDJRDisplay-Bold-Testing.woff") format("woff");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;