import styled from "styled-components";
import { useMatches } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserUiPreferencesStore } from "../../../../store/userUiPreferencesStore";

interface MainProps {
  children?: ReactNode;
}

const Main = ({ children }: MainProps) => {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || "";
  const resolvedTheme = useUserUiPreferencesStore((s) => s.resolvedTheme);

  return (
    <MainContainer $themeMode={resolvedTheme} data-dashboard-scroll="true">
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
            minHeight: "100%",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MainContainer>
  );
};

export default Main;

const MainContainer = styled.main<{ $themeMode: "light" | "dark" }>`
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  background: ${(p) => (p.$themeMode === "dark" ? "#121418" : "#f8f9fa")};
  color: ${(p) => (p.$themeMode === "dark" ? "#e8eaed" : "inherit")};
  border-radius: 10px;
  padding: clamp(12px, 3vw, 20px) clamp(12px, 3vw, 24px);
  padding-bottom: max(clamp(12px, 3vw, 20px), env(safe-area-inset-bottom, 0px));
  transition:
    background 0.22s ease,
    color 0.22s ease;
  -webkit-overflow-scrolling: touch;
`;
