import React from "react";
import { MainContainer } from "./styles/home.styles";

import QuickSearch from "./components/QuickSearch";
import SuggestedFolders from "./components/SuggestedFolders";
import RecentFiles from "./components/RecentFiles";
import { useStorageStore } from "../../../../store/storageStore";

interface HomeProps {
  // Add props as needed
}

const Home: React.FC<HomeProps> = () => {
  const hasUserUploadedFolder = useStorageStore(
    (state) => state.hasUserUploadedFolder
  );

  return (
    <MainContainer>
      <QuickSearch />
      {hasUserUploadedFolder && <SuggestedFolders />}
      <RecentFiles />
    </MainContainer>
  );
};

export default Home;
