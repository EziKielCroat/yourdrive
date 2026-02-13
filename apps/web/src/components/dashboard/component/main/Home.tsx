import React from "react";
import { MainContainer } from "./styles/home.styles";

import QuickSearch from "./components/QuickSearch";
import SuggestedFolders from "./components/SuggestedFolders";
import RecentFiles from "./components/RecentFiles";
import PageTransition from "../../../shared/PageTransition";

interface HomeProps {
  // Add props as needed
}

const Home: React.FC<HomeProps> = () => {
  return (
    <PageTransition>
      <MainContainer>
        <QuickSearch />
        <SuggestedFolders />
        <RecentFiles singleClickMode="preview" />
      </MainContainer>
    </PageTransition>
  );
};

export default Home;
