import { Outlet } from "@tanstack/react-router";
import { MainContainer } from "../../styles/main";
import EmptyState from "./EmptyState";
import { ROUTES } from "../../../../router/router";

const Main = () => {
  const hasFiles = false;
  const currentPath = window.location.pathname;
  const currentPage =
    currentPath === ROUTES.SHARED_WITH_YOU ? "shared" : "default";

  const emptyStateText = {
    default: {
      title: "No files uploaded yet",
      description: "Start by uploading files here.",
    },
    shared: {
      title: "No shared files",
      description: "Files shared with you will appear here.",
    },
  };

  if (!hasFiles) {
    return (
      <EmptyState
        text={
          currentPage === "shared"
            ? emptyStateText.shared
            : emptyStateText.default
        }
      />
    );
  }

  return (
    <MainContainer>
      <Outlet />
    </MainContainer>
  );
};

export default Main;
