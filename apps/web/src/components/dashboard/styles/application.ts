import styled from "styled-components";

export const Root = styled.div`
  width: 100%;
  height: calc(100vh - 80px); /* Adjust based on your navbar height */
  padding: 0 28px;
  box-sizing: border-box;
  overflow: hidden; /* Prevent scrolling */
`;

export const Layout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
`;