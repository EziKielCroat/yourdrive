import styled from "styled-components";

export const Root = styled.div`
  width: 100%;
  min-width: 0;
  height: calc(100vh - 80px); /* Adjust based on your navbar height */
  padding: 0 clamp(10px, 3vw, 28px);
  padding-left: max(clamp(10px, 3vw, 28px), env(safe-area-inset-left, 0px));
  padding-right: max(clamp(10px, 3vw, 28px), env(safe-area-inset-right, 0px));
  box-sizing: border-box;
  overflow: hidden; /* Prevent scrolling */
`;

export const Layout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
`;

export const SidebarBackdrop = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 10;
  }
`;
