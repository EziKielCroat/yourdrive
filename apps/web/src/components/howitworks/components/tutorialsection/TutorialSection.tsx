import React from "react";
import * as S from "./styles/tutorialSection";
import {
  UploadIllustration,
  EditIllustration,
  ShareIllustration,
} from "../../../shared/illustrations/TutorialIllustrations";

interface StepCardProps {
  title: string;
  highlightedWord: string;
  description: string;
  illustration: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({
  title,
  highlightedWord,
  description,
  illustration,
}) => {
  const titleParts = title.split(highlightedWord);

  return (
    <S.Card>
      <S.CardTitle>
        {titleParts[0]}
        <S.TitleHighlight>{highlightedWord}</S.TitleHighlight>
        {titleParts[1]}
      </S.CardTitle>
      <S.CardDescription>{description}</S.CardDescription>

      <S.VideoPlaceholder>{illustration}</S.VideoPlaceholder>
    </S.Card>
  );
};

const TutorialSection: React.FC = () => {
  const steps = [
    {
      title: "Upload Your Files",
      highlightedWord: "Upload",
      description:
        "From upload to collaboration, it's as simple as three steps.",
      illustration: <UploadIllustration width={300} height={200} />,
    },
    {
      title: "Edit Your Files",
      highlightedWord: "Edit",
      description: "Edit documents, share feedback, and keep versions.",
      illustration: <EditIllustration width={300} height={200} />,
    },
    {
      title: "Share Your Files",
      highlightedWord: "Share",
      description:
        "Your files can only be seen by you and those you share with.",
      illustration: <ShareIllustration width={300} height={200} />,
    },
  ];

  return (
    <S.Container>
      <S.CardsWrapper>
        {steps.map((step, index) => (
          <StepCard
            key={index}
            title={step.title}
            highlightedWord={step.highlightedWord}
            description={step.description}
            illustration={step.illustration}
          />
        ))}
      </S.CardsWrapper>
    </S.Container>
  );
};

export default TutorialSection;
