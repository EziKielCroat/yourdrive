// OPTION 2: Remove animation from Application.tsx and add it to each page

// Application.tsx - SIMPLIFIED VERSION (no animation wrapper)
import { type ReactNode } from "react";
import styled from "styled-components";

interface ApplicationProps {
  children: ReactNode;
}

const Application = ({ children }: ApplicationProps) => {
  return <><ApplicationContainer>{children}</ApplicationContainer></>;
};

const ApplicationContainer = styled.div`
  flex: 1;
  position: relative;
  background: #f8f9fa;

  overflow-y: hidden;
  overflow-x: hidden;
`;

export default Application;
