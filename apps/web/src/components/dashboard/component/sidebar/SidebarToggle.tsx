import { type FC } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useSidebarStore } from "../../../../store/sidebarStore";

const SidebarToggle: FC = () => {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <ToggleButton
      data-tour="tour-sidebar-toggle"
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        initial={false}
        animate={{
          scaleX: isOpen ? 1 : -1,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <g clipPath="url(#clip0_sidebar_toggle)">
          <motion.path
            d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M7.96997 2V22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              delay: 0.05,
            }}
          />
          <motion.path
            d="M14.97 9.43945L12.41 11.9995L14.97 14.5595"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              x: isOpen ? [0, -2, 0] : [0, 2, 0],
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
          />
        </g>
        <defs>
          <clipPath id="clip0_sidebar_toggle">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </motion.svg>
    </ToggleButton>
  );
};

export default SidebarToggle;

const ToggleButton = styled(motion.button)`
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: rgba(233, 238, 246, 0.5);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #1a1a1a;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(233, 238, 246, 1);
  }

  &:active {
    background: rgba(209, 218, 232, 1);
  }

  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  svg {
    display: block;
  }
`;
