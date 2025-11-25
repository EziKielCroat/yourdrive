import { MainContainer } from "../../styles/main";
import EmptyState from "./EmptyState";

const Main = () => {
  const currentPage = "default"; // this will later be determined by the app's state or routing
  const hasFiles = false; // will later on check if user has uploaded any files with their account

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
      <h1>Your Files</h1>
    </MainContainer>
  );
};

export default Main;
