import React from 'react';
import {
  FeaturesSection,
  FeaturesContainer,
  SectionHeader,
  SectionLabel,
  SectionTitle,
  SectionDescription,
  FeaturesGrid,
  FeatureCard,
  FeatureImageContainer,
  FeatureImage,
  FeatureBadge,
  FeatureTitle,
  FeatureDescription,
  SupportGrid,
  SupportItem,
  SupportIcon,
  SupportTitle,
  SupportDescription
} from './styles/featuresPart';

const FeaturesPart: React.FC = () => {
  const features = [
    {
      title: 'Infinite canvas',
      description: 'Jump into a familiar interface and start creating instantly with all the features you\'d expect. Get rid of the limit and art board, and cover your canvas with assets and artboards.',
      badge: null,
      image: '/images/infinite-canvas.png'
    },
    {
      title: 'Masks',
      description: 'Clip certain artwork. Specify all types of objects. Mix and match them like magic and all of them. Masks.',
      badge: null,
      image: '/images/masks.png'
    },
    {
      title: 'Gradients',
      description: 'You can now add gradients to create stunning scenes or give any shadow or long-depth to your designs.',
      badge: null,
      image: '/images/gradients.png'
    },
    {
      title: 'Blur',
      description: 'Add blur on any object. Apply the depth of field effect. Easy to use. Great for many use cases to create elegant soft effects.',
      badge: null,
      image: '/images/blur.png'
    },
    {
      title: 'Snapping',
      description: 'Handling would seem a great way. Even when importing illustrations and SVG files, they import perfectly, ensuring your intuitive motion is precise.',
      badge: null,
      image: '/images/snapping.png'
    },
    {
      title: 'Custom fonts',
      description: 'Access hundreds of Google Fonts available in Jitter, or import your own custom fonts to make your animations unique.',
      badge: null,
      image: '/images/custom-fonts.png'
    }
  ];

  const support = [
    {
      icon: '📱',
      title: 'SVG support',
      description: 'The perfect format for scalable graphics, scalable vector graphics.'
    },
    {
      icon: '🖼️',
      title: 'Vector support',
      description: 'Import vector illustrations from your favorite tools like Sketch, Figma and Illustrator.'
    },
    {
      icon: '⚡',
      title: 'Alignment tools',
      description: 'Quickly align any element within the canvas using the snap-to-grid feature.'
    }
  ];

  return (
    <FeaturesSection>
      <FeaturesContainer>
        <SectionHeader>
          <SectionLabel>Design</SectionLabel>
          <SectionTitle>Design without limits</SectionTitle>
          <SectionDescription>
            Jump into a familiar interface and start creating instantly
            with all the features you'd expect in a modern design tool —
            built for animators and designers.
          </SectionDescription>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureImageContainer>
                {feature.badge && <FeatureBadge>{feature.badge}</FeatureBadge>}
                <FeatureImage src={feature.image} alt={feature.title} />
              </FeatureImageContainer>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>

        <SupportGrid>
          {support.map((item, index) => (
            <SupportItem key={index}>
              <SupportIcon>{item.icon}</SupportIcon>
              <SupportTitle>{item.title}</SupportTitle>
              <SupportDescription>{item.description}</SupportDescription>
            </SupportItem>
          ))}
        </SupportGrid>
      </FeaturesContainer>
    </FeaturesSection>
  );
};

export default FeaturesPart;