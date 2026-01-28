import React from 'react';
import * as S from './styles/tutorialSection';

interface StepCardProps {
  title: string;
  highlightedWord: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ title, highlightedWord, description }) => {
  const titleParts = title.split(highlightedWord);
  
  return (
    <S.Card>
      <S.CardTitle>
        {titleParts[0]}
        <S.TitleHighlight>{highlightedWord}</S.TitleHighlight>
        {titleParts[1]}
      </S.CardTitle>
      <S.CardDescription>{description}</S.CardDescription>
      
      <S.VideoPlaceholder>
        
      </S.VideoPlaceholder>
      
      <S.PlayButton>Play Step</S.PlayButton>
    </S.Card>
  );
};

const TutorialSection: React.FC = () => {
  const steps = [
    {
      title: 'Upload Your Files',
      highlightedWord: 'Upload',
      description: "From upload to collaboration, it's as simple as three steps.",
    },
    {
      title: 'Edit Your Files',
      highlightedWord: 'Edit',
      description: 'Edit documents, share feedback, and keep versions.',
    },
    {
      title: 'Share Your Files',
      highlightedWord: 'Share',
      description: 'Your files can only be seen by you and those you share with.',
    }
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
          />
        ))}
      </S.CardsWrapper>
    </S.Container>
  );
};

export default TutorialSection;