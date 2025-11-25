import React from "react";
import {
  EmptyStateWrapper,
  EmptyStateDescription,
  EmptyStateTitle,
  MainContainer,
} from "../../styles/main";
import FilesIcon from "../../../shared/icons/files";

const EmptyState: React.FC<{
  text: { title: string; description: string };
}> = ({ text }) => {
  return (
    <MainContainer>
      <EmptyStateWrapper>
        <FilesIcon color="#363840" height="40px" width="40px" />
        <EmptyStateTitle>{text.title}</EmptyStateTitle>
        <EmptyStateDescription>{text.description}</EmptyStateDescription>
      </EmptyStateWrapper>
    </MainContainer>
  );
};

export default EmptyState;
