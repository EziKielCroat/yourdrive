import styled from "styled-components";
import { useMatches } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MainProps {
  children?: ReactNode;
}

const Main = ({ children }: MainProps) => {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || "";

  return (
    <MainContainer>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MainContainer>
  );
};

export default Main;

const MainContainer = styled.main`
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;
